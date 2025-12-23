const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات الـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'يرجى إرسال رابط الصورة imageUrl' });
        }

        try {
            const response = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: imageUrl }
            );
            return res.status(200).json(response.data);
        } catch (error) {
            return res.status(500).json({ error: 'خطأ في الاتصال بـ Nyckel' });
        }
    } else {
        // إذا دخل شخص من المتصفح مباشرة (GET)
        res.status(200).send('الـ API يعمل بنجاح! يرجى إرسال طلب POST مع رابط الصورة.');
    }
};
