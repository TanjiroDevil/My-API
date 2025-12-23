const axios = require('axios');

module.exports = async (req, res) => {
    // إعدادات الـ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // في حال دخل شخص من المتصفح (GET)
    if (req.method === 'GET') {
        return res.status(200).json({
            status: "success",
            message: "Tanjiro NSFW API is active",
            author: "Tanjiro",
            usage: {
                method: "POST",
                endpoint: "/api/ai/classify",
                body: {
                    imageUrl: "https://example.com/image.jpg"
                }
            }
        });
    }

    // في حال إرسال طلب فحص (POST)
    if (req.method === 'POST') {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'يرجى تزويد رابط الصورة imageUrl' });

        try {
            const response = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: imageUrl }
            );
            return res.status(200).json(response.data);
        } catch (error) {
            return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الصورة' });
        }
    }
};
