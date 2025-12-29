import axios from "axios";
import FormData from "form-data";

class NyckelAPI {
  constructor() {
    this.baseUrl = "https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke";
    this.headers = {
      "user-agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36",
      "origin": "https://www.nyckel.com",
      "referer": "https://www.nyckel.com/pretrained-classifiers/nsfw-identifier/",
    };
  }

  async scan(imageUrl) {
    try {
      // 1. تحميل الصورة كـ Buffer
      const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(imageRes.data, 'binary');

      // 2. تجهيز الـ FormData
      const form = new FormData();
      form.append("file", buffer, {
        filename: "image.jpg",
        contentType: imageRes.headers["content-type"] || "image/jpeg",
      });

      // 3. إرسال الطلب لـ Nyckel
      const response = await axios.post(this.baseUrl, form, {
        headers: {
          ...this.headers,
          ...form.getHeaders()
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error in Nyckel Scan:", error.message);
      return null;
    }
  }
}

export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  // الحصول على الرابط سواء من GET أو POST
  const imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);

  if (!imageUrl) {
    return res.status(200).json({
      api: "Nyckel NSFW Scanner",
      status: "Online 🙂✨",
      message: "Please provide an imageUrl parameter"
    });
  }

  try {
    const nyckel = new NyckelAPI();
    const result = await nyckel.scan(imageUrl);

    if (!result) {
      return res.status(400).json({ status: "error", message: "فشل في معالجة الصورة" });
    }

    return res.status(200).json({
      status: "success",
      label: result.labelName,
      confidence: result.confidence,
      dev: "Tanjiro ✨"
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      details: error.message
    });
  }
}
