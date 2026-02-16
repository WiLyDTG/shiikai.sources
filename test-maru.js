(async () => {
    // Probar Maru (mail.ru)
    const maruUrl = "https://my.mail.ru/video/embed/8995617145282890505#budyak.rus#2825";
    
    console.log("Fetching Maru...");
    const res = await fetch(maruUrl);
    const html = await res.text();
    
    // Buscar video directo
    console.log("\nBuscando patrones...");
    
    // Meta video URL
    const metaVideo = html.match(/meta-video-url"\s*content="([^"]+)"/i);
    if (metaVideo) console.log("meta-video-url:", metaVideo[1]);
    
    // video_url patterns
    const videoUrl = html.match(/"videoUrl"\s*:\s*"([^"]+)"/i);
    if (videoUrl) console.log("videoUrl:", videoUrl[1]);
    
    // mp4 URLs
    const mp4s = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi);
    if (mp4s) console.log("MP4 URLs:", mp4s);
    
    // m3u8 URLs  
    const m3u8s = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi);
    if (m3u8s) console.log("M3U8 URLs:", m3u8s);
    
    // Save for analysis
    require('fs').writeFileSync('maru.html', html.substring(0, 100000));
    console.log("\nHTML guardado en maru.html");
})();
