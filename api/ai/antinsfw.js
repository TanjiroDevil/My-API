const axios = require('axios');

module.exports = async (req, res) => {
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
            const imageResponse = await axios.get(imageUrl.trim(), {
                responseType: 'arraybuffer',
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/*'
                }
            });

            const contentType = imageResponse.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error(`الرابط لا يشير إلى صورة صالحة 🙂`);
            }

            const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
            const dataUrl = `data:${contentType};base64,${base64Image}`;

            const nyckelResponse = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: dataUrl },
                { headers: { 'Content-Type': 'application/json' } }
            );

            // تحويل النتيجة للعربية بأسلوب مختصر 🙂✨
            let labelName = nyckelResponse.data.labelName.toLowerCase();
            const translatedLabel = labelName === 'porn' ? 'محتوى غير لائق ⚠️' : 
                                  labelName === 'safe' ? 'محتوى آمن ✅' : labelName;

            // الرد الاحترافي المختصر
            return res.status(200).send(JSON.stringify({
                status: "success",
                prediction: translatedLabel,
                accuracy: (nyckelResponse.data.confidence * 100).toFixed(2) + "%",
                format: contentType.split('/')[1],
                dev: "Tanjiro ✨"
            }, null, 4));

        } catch (error) {
            return res.status(400).send(JSON.stringify({
                status: "error",
                message: error.message
            }, null, 4));
        }
    }

    return res.status(200).send(JSON.stringify({
        api: "Tanjiro NSFW Detector",
        status: "Online 🙂✨",
        usage: `${req.headers.host}/api?imageUrl=LINK`
    }, null, 4));
};
