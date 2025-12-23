const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات الحماية والـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Powered-By', 'Tanjiro-Engine ⚡');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);

    if (imageUrl) {
        try {
            // 1. جلب الصورة باستخدام الـ User-Agent الخاص بك
            const imageResponse = await axios.get(imageUrl.trim(), {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; V2029 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36'
                }
            });

            // 2. تحويل الصورة إلى Base64
            const contentType = imageResponse.headers['content-type'];
            const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
            const dataUrl = `data:${contentType};base64,${base64Image}`;

            // 3. تحليل الصورة عبر Nyckel
            const nyckelResponse = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: dataUrl },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // 4. تعريب النتيجة وتجهيز الرد
            let labelArabic = nyckelResponse.data.labelName;
            let statusEmoji = "✨";

            if (labelArabic.toLowerCase() === 'porn') {
                labelArabic = "محتوى غير لائق (إباحي) 🔞";
                statusEmoji = "⚠️";
            } else if (labelArabic.toLowerCase() === 'not porn') {
                labelArabic = "محتوى آمن ونظيف ✅";
                statusEmoji = "🛡️";
            }

            return res.status(200).send(JSON.stringify({
                success: true,
                message: "تم تحليل الصورة بنجاح " + statusEmoji,
                result: {
                    label: labelArabic,
                    confidence: (nyckelResponse.data.confidence * 100).toFixed(2) + "%"
                },
                image_info: {
                    type: contentType
                },
                developer: "Tanjiro 👨🏻‍💻"
            }, null, 4));

        } catch (error) {
            return res.status(500).send(JSON.stringify({
                success: false,
                error: "حدث خطأ أثناء المعالجة ❌",
                details: error.message
            }, null, 4));
        }
    }

    // واجهة الاستخدام عند الدخول للرابط مباشرة
    return res.status(200).send(JSON.stringify({
        api_name: "Tanjiro NSFW Detector 🛡️",
        status: "Online 🟢",
        instructions: "يرجى إرسال رابط الصورة عبر imageUrl لتحديد نوع المحتوى.",
        example: `https://${req.headers.host}/api/ai/classify?imageUrl=رابط_الصورة_هنا`
    }, null, 4));
};
