const axios = require('axios');

module.exports = async (req, res) => {
    const startTime = Date.now(); 

    // إعدادات الحماية والـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Powered-By', 'Tanjiro-Engine');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);

    if (imageUrl) {
        try {
            // 1. محاولة جلب الصورة مع الـ User-Agent الخاص بك
            const imageResponse = await axios.get(imageUrl.trim(), {
                responseType: 'arraybuffer',
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; V2029 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
                }
            });

            // 2. التحقق مما إذا كان الملف المستلم صورة فعلاً
            const contentType = imageResponse.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`الرابط لا يشير إلى صورة صالحة. النوع المستلم: ${contentType}`);
            }

            // 3. تحويل الصورة إلى Base64
            const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
            const dataUrl = `data:${contentType};base64,${base64Image}`;

            // 4. إرسالها إلى Nyckel
            const nyckelResponse = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: dataUrl },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // ترجمة النتائج إلى العربية 🙂✨
            let labelArabic = nyckelResponse.data.labelName;
            if (labelArabic.toLowerCase() === 'porn') {
                labelArabic = 'محتوى غير لائق ⚠️';
            } else if (labelArabic.toLowerCase() === 'safe') {
                labelArabic = 'محتوى آمن ✅';
            }

            // 5. الاستجابة الاحترافية النهائية
            return res.status(200).send(JSON.stringify({
                success: true,
                result: {
                    label: labelArabic,
                    confidence: (nyckelResponse.data.confidence * 100).toFixed(2) + "%",
                    id: nyckelResponse.data.labelId
                },
                image_info: {
                    type: contentType
                },
                developer: "Tanjiro"
            }, null, 4));

        } catch (error) {
            const statusCode = error.response ? error.response.status : 500;
            return res.status(statusCode).send(JSON.stringify({
                success: false,
                error: {
                    code: statusCode,
                    message: error.message,
                    details: error.response ? error.response.data : "No extra details"
                }
            }, null, 4));
        }
    }

    // واجهة الاستخدام الاحترافية (عند عدم وجود رابط)
    return res.status(200).send(JSON.stringify({
        api_name: "Tanjiro NSFW Detector",
        version: "2.0.0",
        status: "Online 🙂✨",
        endpoints: {
            analyze: {
                method: "GET/POST",
                path: "/api/ai/classify",
                params: { imageUrl: "URL string" }
            }
        },
        example: `https://${req.headers.host}/api/ai/classify?imageUrl=https://files.catbox.moe/6zwy2b.jpg`
    }, null, 4));
};
