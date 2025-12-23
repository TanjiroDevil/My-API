const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ error: 'Missing imageUrl' });

        try {
            const response = await axios.post(
                'https://www.nyckel.com/v1/functions/o2f0jzcdyut2qxhu/invoke',
                { data: imageUrl },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Origin': 'https://www.nyckel.com',
                        'Referer': 'https://www.nyckel.com/pretrained-classifiers/nsfw-identifier/'
                    }
                }
            );
            return res.status(200).json(response.data);
        } catch (error) {
            // هنا سنعرف السبب الحقيقي للخطأ
            const errorStatus = error.response ? error.response.status : 500;
            const errorData = error.response ? error.response.data : error.message;
            
            return res.status(errorStatus).json({ 
                error: 'Nyckel Connection Failed',
                details: errorData 
            });
        }
    } else {
        res.status(200).send('API is active. Send a POST request.');
    }
};
    
