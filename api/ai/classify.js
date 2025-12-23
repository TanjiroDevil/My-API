const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // استخراج الرابط وتنظيفه
    let imageUrl = req.query.imageUrl || (req.body && req.body.imageUrl);
    
    if (imageUrl) {
        imageUrl = imageUrl.trim();
        try {
            // التعديل هنا: إرسال البيانات بـ الصيغة التي يفضلها Nyckel للروابط الخارجية
            const response = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: imageUrl }, 
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000 
                }
            );
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        } catch (error) {
            const errorData = error.response ? error.response.data : error.message;
            return res.status(error.response ? error.response.status : 500).send(JSON.stringify({ 
                error: 'Nyckel Analysis Failed',
                details: errorData,
                note: "إذا ظهر خطأ text/html فهذا يعني أن الرابط هو لصفحة ويب وليس لملف صورة مباشر"
            }, null, 4));
        }
    }

    return res.status(200).send(JSON.stringify({
        status: "success",
        message: "Tanjiro NSFW API is active",
        example: `https://${req.headers.host}/api/ai/classify?imageUrl=https://i.imgur.com/8K9Mv7n.jpg`
    }, null, 4));
};
