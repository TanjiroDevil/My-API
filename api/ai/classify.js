const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    let imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);
    
    if (imageUrl) {
        try {
            // الخطوة 1: نقوم نحن بتحميل الصورة كـ Buffer (لنتجاوز حماية الموقع)
            const imageResponse = await axios.get(imageUrl.trim(), {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; V2029 Build/SP1A.210812.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36'
                }
            });

            // الخطوة 2: تحويل الصورة إلى صيغة Base64
            const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
            const dataUrl = `data:${imageResponse.headers['content-type']};base64,${base64Image}`;

            // الخطوة 3: إرسال الصورة الخام إلى Nyckel
            const nyckelResponse = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: dataUrl },
                { headers: { 'Content-Type': 'application/json' } }
            );

            return res.status(200).send(JSON.stringify(nyckelResponse.data, null, 4));

        } catch (error) {
            return res.status(500).send(JSON.stringify({ 
                error: 'فشل تحليل الصورة بالكامل',
                reason: error.message,
                suggestion: "تأكد أن رابط الصورة يعمل عند فتحه في المتصفح"
            }, null, 4));
        }
    }

    return res.status(200).send(JSON.stringify({
        status: "success",
        author: "Tanjiro",
        usage: `https://${req.headers.host}/api/ai/classify?imageUrl=رابط_الصورة`
    }, null, 4));
};
