const axios = require('axios');

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'يرجى استخدام POST طلب' });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'يرجى تزويد رابط الصورة imageUrl' });
    }

    try {
        const response = await axios.post(
            'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
            { data: imageUrl }, 
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return res.status(200).json(response.data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            error: 'حدث خطأ في تحليل الصورة',
            details: error.response ? error.response.data : error.message 
        });
    }
}
