import axios from "axios";

class NyckelAPI {
  constructor() {
    this.baseUrl = "https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke";
    this.headers = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36"
    };
  }

  async scan(imageUrl) {
    try {
      // تحميل الصورة
      const res = await axios.get(imageUrl.trim(), {
        responseType: "arraybuffer",
        timeout: 10000
      });

      const contentType = res.headers["content-type"] || "image/jpeg";
      
      // تحويل الـ Buffer إلى Base64 (يعمل في بيئة Node.js ESM بشكل طبيعي)
      const base64Image = Buffer.from(res.data).toString("base64");
      const dataUrl = `data:${contentType};base64,${base64Image}`;

      // إرسال الطلب
      const response = await axios.post(this.baseUrl, 
        { data: dataUrl }, 
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error("Scan Error:", error.message);
      return null;
    }
  }
}

export default async function handler(req, res) {
  // ترويسات الاستجابة
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Powered-By", "Tanjiro-Engine");

  if (req.method === "OPTIONS") return res.status(200).end();

  // الحصول على الرابط
  const imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);

  if (!imageUrl) {
    return res.status(200).send(JSON.stringify({
      api: "Nyckel NSFW Scanner (ESM)",
      status: "Online 🙂✨",
      dev: "Tanjiro ✨"
    }, null, 4));
  }

  try {
    const nyckel = new NyckelAPI();
    const result = await nyckel.scan(imageUrl);

    if (!result) throw new Error("فشل في معالجة الصورة");

    let label = result.labelName === 'Porn' ? 'محتوى غير لائق ⚠️' : 
                result.labelName === 'Safe' ? 'محتوى آمن ✅' : result.labelName;

    return res.status(200).send(JSON.stringify({
      status: "success",
      label: label,
      confidence: (result.confidence * 100).toFixed(2) + "%",
      dev: "Tanjiro ✨"
    }, null, 4));

  } catch (error) {
    return res.status(500).send(JSON.stringify({
      status: "error",
      message: error.message
    }, null, 4));
  }
}
