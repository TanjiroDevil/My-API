import axios from "axios";
import crypto from "crypto";

class SaveTubeEngine {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/;
    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'user-agent': 'Mozilla/5.0 (Android 15; Mobile)'
      }
    });
  }

  async decrypt(enc) {
    const buf = Buffer.from(enc, 'base64');
    const key = Buffer.from(this.ky, 'hex');
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);

    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString());
  }

  async getCdn() {
    const res = await this.is.get("https://media.savetube.vip/api/random-cdn");
    return { status: true, data: res.data.cdn };
  }

  async getDownloadUrl(youtubeUrl) {
    const id = youtubeUrl.match(this.m)?.[3];
    if (!id) throw new Error("رابط يوتيوب غير صالح");

    const cdn = await this.getCdn();
    const info = await this.is.post(`https://${cdn.data}/v2/info`, {
      url: `https://www.youtube.com/watch?v=${id}`
    });

    const dec = await this.decrypt(info.data.data);

    const dl = await this.is.post(`https://${cdn.data}/download`, {
      id,
      downloadType: 'audio',
      quality: '128',
      key: dec.key
    });

    return dl.data.data.downloadUrl;
  }
}

export default async function handler(req, res) {
    let queryParams = req.query || {};
    if (req.url && Object.keys(queryParams).length === 0) {
        try {
            const urlObj = new URL(req.url, `http://${req.headers?.host || 'localhost'}`);
            queryParams = Object.fromEntries(urlObj.searchParams.entries());
        } catch (e) {}
    }

    let body = req.body || {};
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
    }

    const commonHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'X-Powered-By': 'Tanjiro-Engine',
        'Content-Type': 'application/json; charset=utf-8'
    };

    const sendResponse = (statusCode, payload) => {
        const bodyString = JSON.stringify(payload, null, 4);
        if (res && typeof res.status === 'function') {
            Object.entries(commonHeaders).forEach(([k, v]) => res.setHeader(k, v));
            return res.status(statusCode).send(bodyString);
        }
        return new Response(bodyString, { status: statusCode, headers: commonHeaders });
    };

    if (req.method === 'OPTIONS') {
        if (res && typeof res.status === 'function') return res.status(200).end();
        return new Response(null, { status: 200, headers: commonHeaders });
    }

    let trackUrl = queryParams.url || body.url || queryParams.id || body.id;

    if (!trackUrl || trackUrl.trim().length === 0) {
        return sendResponse(200, { 
            title: "Spotify SaveTube MP3 Downloader API", 
            status: "Online ✅", 
            usage: "?url=SPOTIFY_URL", 
            dev: "Tanjiro ✨" 
        });
    }

    try {
        let targetUrl = trackUrl.trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = `https://open.spotify.com/track/${targetUrl}`;
        }

        const spotifyRes = await axios.get(targetUrl, { timeout: 15000 });
        const htmlText = spotifyRes.data;

        const titleMatch = htmlText.match(/(?<=:title" content=")(.*?)(?=")/gm);
        const authorMatch = htmlText.match(/(?<=:description" content=")(.*?)(?= · )/gm);
        const coverMatch = htmlText.match(/(?<=:image" content=")(.*?)(?=")/gm);

        if (!titleMatch || !authorMatch) {
            return sendResponse(400, { status: "error", message: "فشل استخراج بيانات الأغنية." });
        }

        const title = titleMatch[0];
        const artist = authorMatch[0];
        const cover = coverMatch ? coverMatch[0] : "";

        const searchQuery = encodeURIComponent(`${title} ${artist} audio`);
        const ytSearchRes = await axios.get(`https://html.duckduckgo.com/html/?q=${searchQuery}+site%3Ayoutube.com`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        const ytHtml = ytSearchRes.data;
        const ytUrlMatch = ytHtml.match(/watch\?v=[a-zA-Z0-9_-]{11}/);

        if (!ytUrlMatch) {
            return sendResponse(404, { status: "error", message: "الأغنية غير متاحة حالياً." });
        }

        const youtubeVideoUrl = `https://www.youtube.com/${ytUrlMatch[0]}`;

        const st = new SaveTubeEngine();
        const finalMp3Url = await st.getDownloadUrl(youtubeVideoUrl);

        if (!finalMp3Url) throw new Error("فشل توليد رابط التحميل.");

        return sendResponse(200, {
            status: "success",
            title: title,
            artist: artist,
            image: cover,
            youtube_source: youtubeVideoUrl,
            download_url: finalMp3Url, // نرجع الرابط المباشر الصافي و Lovable يتكفل بالـ Blob السريع!
            dev: "Tanjiro ✨"
        });

    } catch (error) {
        return sendResponse(500, { status: "error", message: error.message || error });
    }
}