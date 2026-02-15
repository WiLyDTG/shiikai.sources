(async () => {
    const BASE = "https://www3.animeflv.net";
    
    console.log("=== PROBANDO TODOS LOS SERVIDORES ===\n");
    
    // Cargar episodio
    const epRes = await fetch(BASE + "/ver/naruto-1");
    const epHtml = await epRes.text();
    const match = epHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    
    if (!match) {
        console.log("No videos found");
        return;
    }
    
    const videos = JSON.parse(match[1]);
    const allServers = [...(videos.SUB || [])];
    
    for (const server of allServers) {
        console.log(`--- ${server.title} ---`);
        console.log(`URL: ${server.code}`);
        
        if (server.title === "SW") {
            // StreamWish
            try {
                const res = await fetch(server.code);
                const html = await res.text();
                // Buscar m3u8 o mp4
                const m3u8 = html.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)/i);
                const mp4 = html.match(/file\s*:\s*["']([^"']+\.mp4[^"']*)/i);
                if (m3u8) console.log(`  M3U8: ${m3u8[1].substring(0, 80)}...`);
                if (mp4) console.log(`  MP4: ${mp4[1].substring(0, 80)}...`);
                if (!m3u8 && !mp4) console.log("  No direct URL found");
            } catch(e) { console.log(`  Error: ${e.message}`); }
        }
        
        if (server.title === "Fembed") {
            try {
                const res = await fetch(server.code);
                const html = await res.text();
                const sources = html.match(/sources\s*:\s*\[([\s\S]*?)\]/i);
                if (sources) console.log(`  Sources found`);
                else console.log("  No sources");
            } catch(e) { console.log(`  Error: ${e.message}`); }
        }
        
        console.log("");
    }
    
    // Probar descarga real del proxy
    console.log("=== TEST DESCARGA REAL ===");
    const yu = allServers.find(s => s.title === "YourUpload");
    if (yu) {
        const yuRes = await fetch(yu.code);
        const yuHtml = await yuRes.text();
        const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
        
        if (fileMatch) {
            const videoUrl = fileMatch[1];
            const proxyUrl = "https://shiikai-sources.pages.dev/proxy?url=" + encodeURIComponent(videoUrl) + "&referer=" + encodeURIComponent("https://www.yourupload.com/");
            
            console.log("Descargando primeros 100KB via proxy...");
            const start = Date.now();
            const res = await fetch(proxyUrl, {
                headers: { 'Range': 'bytes=0-102400' }
            });
            const buffer = await res.arrayBuffer();
            const elapsed = Date.now() - start;
            
            console.log(`Status: ${res.status}`);
            console.log(`Bytes recibidos: ${buffer.byteLength}`);
            console.log(`Tiempo: ${elapsed}ms`);
            console.log(`Content-Type: ${res.headers.get('content-type')}`);
        }
    }
})();
