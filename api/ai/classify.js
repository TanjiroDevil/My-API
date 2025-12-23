const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // جلب الرابط مع معالجة المساحات الفارغة
    let imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);
    if (imageUrl) imageUrl = imageUrl.trim();

    if (imageUrl) {
        try {
            const response = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: imageUrl },
                { timeout: 10000 } // مهلة 10 ثوانٍ
            );
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        } catch (error) {
            // استخراج تفاصيل الخطأ من Nyckel نفسه
            const errorMsg = error.response && error.response.data ? error.response.data : error.message;
            return res.status(error.response ? error.response.status : 500).send(JSON.stringify({ 
                error: 'Nyckel Analysis Failed',
                details: errorMsg,
                hint: "تأكد أن رابط الصورة مباشر وينتهي بـ .jpg أو .png وأن الموقع لا يحظر الطلبات الخارجية"
            }, null, 4));
        }
    }

    // رسالة التعليمات
    return res.status(200).send(JSON.stringify({
        status: "success",
        message: "Tanjiro NSFW API is active",
        usage: `https://${req.headers.host}/api/ai/classify?imageUrl=رابط_الصورة`
    }, null, 4));
};
