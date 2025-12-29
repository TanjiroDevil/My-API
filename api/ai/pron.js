import axios from "axios";
import FormData from "form-data";

class NyckelAPI {
  constructor() {
    this.baseUrl = "https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke";
    this.headers = {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "user-agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
      "origin": "https://www.nyckel.com",
      "referer": "https://www.nyckel.com/pretrained-classifiers/nsfw-identifier/",
      "x-requested-with": "XMLHttpRequest"
    };
  }

  async getImage(imageUrl) {
    try {
      const res = await axios.get(imageUrl.trim(), {
        responseType: "arraybuffer",
        timeout: 10000
      });
      return {
        buffer: res.data,
        type: res.headers["content-type"] || "image/jpeg"
      };
    } catch {
      return null;
    }
  }

  async scan({ imageUrl }) {
    const img = await this.getImage(imageUrl);
    if (!img) return null;

    const form = new FormData();
    form.append("file", img.buffer, {
      filename: "image.jpg",
      contentType: img.type
    });

    const response = await axios.post(this.baseUrl, form, {
      headers: {
        ...this.headers,
        ...form.getHeaders()
      },
      timeout: 15000
    });

    return response.data;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Powered-By", "Tanjiro-Engine");

  if (req.method === "OPTIONS") return res.status(200).end();

  const imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);

  if (!imageUrl) {
    return res.status(200).send(JSON.stringify({
      api: "Nyckel NSFW Scanner",
      status: "Online 🙂✨",
      dev: "Tanjiro ✨"
    }, null, 4));
  }

  try {
    const nyckel = new NyckelAPI();
    const result = await nyckel.scan({ imageUrl });

    if (!result) throw new Error("فشل فحص الصورة");

    return res.status(200).send(JSON.stringify({
      status: "success",
      label: result.labelName,
      confidence: result.confidence,
      dev: "Tanjiro ✨"
    }, null, 4));

  } catch (error) {
    return res.status(500).send(JSON.stringify({
      status: "error",
      message: "حدث خطأ أثناء فحص الصورة"
    }, null, 4));
  }
  }
