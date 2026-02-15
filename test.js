(async () => {
    // Test YourUpload extraction
    const embedUrl = 'https://www.yourupload.com/embed/D1OgmRtniGT7';
    const res = await fetch(embedUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    const html = await res.text();
    
    console.log('HTML length:', html.length);
    
    // Buscar URLs de video
    const mp4Match = html.match(/https?:\/\/[^"'\s<>]+\.mp4[^"'\s<>]*/gi);
    const srcMatch = html.match(/file\s*:\s*["']([^"']+)["']/i);
    const sourceMatch = html.match(/source\s+src=["']([^"']+)["']/i);
    
    console.log('MP4 URLs:', mp4Match);
    console.log('File match:', srcMatch ? srcMatch[1] : 'not found');
    console.log('Source match:', sourceMatch ? sourceMatch[1] : 'not found');
    
    // Buscar cualquier URL de video
    const videoUrls = html.match(/https?:\/\/[^"'\s<>]+\.(mp4|m3u8|webm)[^"'\s<>]*/gi);
    console.log('All video URLs:', videoUrls);
})();
