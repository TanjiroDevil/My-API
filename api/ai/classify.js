const axios = require('axios');

export default async function handler(req, res) {
    // السماح فقط بطلبات POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const response = await axios.post(
            'https://www.nyckel.com/v1/functions/YOUR_FUNCTION_ID/invoke', 
            { data: imageUrl },
            {
                headers: {
                    'Authorization': 'Bearer YOUR_BEARER_TOKEN',
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json(response.data);

    } catch (error) {
        return res.status(500).json({ 
            error: 'Failed to analyze image', 
            details: error.message 
        });
    }
}
