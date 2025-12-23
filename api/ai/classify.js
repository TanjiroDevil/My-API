const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات الـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // لضمان ظهور الـ JSON مرتب في المتصفح
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // جلب الرابط سواء كان من الـ Body (في POST) أو من الـ URL (في GET)
    const imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);

    // إذا وجدنا رابط صورة، نقوم بتحليله فوراً (حتى لو كان الطلب GET من المتصفح)
    if (imageUrl) {
        try {
            const response = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: imageUrl }
            );
            // إرجاع النتيجة منسقة (المعامل 4 يجعل كل معلومة في سطر)
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        } catch (error) {
            return res.status(500).send(JSON.stringify({ 
                error: 'Nyckel Connection Failed',
                details: error.message 
            }, null, 4));
        }
    }

    // إذا لم يوجد رابط صورة، نظهر رسالة التعليمات منسقة
    const instructions = {
        status: "success",
        message: "Tanjiro NSFW API is active",
        author: "Tanjiro",
        how_to_use: {
            option_1: "فتح الرابط مباشرة مع إضافة رابط الصورة في النهاية كالتالي:",
            example_url: `${req.headers.host}/api/ai/classify?imageUrl=رابط_الصورة_هنا`,
            option_2: "إرسال طلب POST بداخل Body يحتوي على imageUrl"
        }
    };

    return res.status(200).send(JSON.stringify(instructions, null, 4));
};
