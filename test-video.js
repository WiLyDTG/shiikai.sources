const BASE = "https://www3.animeflv.net";

(async () => {
    console.log("=== TEST EPISODIO Y VIDEOS ===");
    
    // Ir directo a un episodio
    const epUrl = BASE + "/ver/naruto-1";
    console.log("1. Cargando:", epUrl);
    
    const epRes = await fetch(epUrl);
    console.log("   Status:", epRes.status);
    
    if (epRes.status !== 200) {
        console.log("Error: episodio no encontrado");
        return;
    }
    
    const epHtml = await epRes.text();
    
    // Buscar var videos
    const match = epHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    
    if (match) {
        console.log("\n2. VIDEOS ENCONTRADOS:");
        const videos = JSON.parse(match[1]);
        console.log(JSON.stringify(videos, null, 2));
        
        // Buscar YourUpload
        const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
        console.log("\n3. Servidores:", allServers.map(s => s.title).join(", "));
        
        const yu = allServers.find(s => s.title === "YourUpload");
        if (yu) {
            console.log("\n4. Extrayendo YourUpload...");
            console.log("   Embed:", yu.code);
            
            const yuRes = await fetch(yu.code);
            const yuHtml = await yuRes.text();
            const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
            
            if (fileMatch) {
                console.log("\n5. VIDEO MP4:", fileMatch[1]);
                
                // Probar proxy
                const proxyUrl = "https://shiikai-sources.pages.dev/proxy?url=" + encodeURIComponent(fileMatch[1]) + "&referer=" + encodeURIComponent("https://www.yourupload.com/");
                console.log("\n6. PROXY URL:", proxyUrl);
                
                const proxyRes = await fetch(proxyUrl, { method: 'HEAD' });
                console.log("   Proxy Status:", proxyRes.status);
                console.log("   Content-Type:", proxyRes.headers.get('content-type'));
            } else {
                console.log("   No MP4 encontrado");
            }
        }
    } else {
        console.log("No var videos encontrado");
        require('fs').writeFileSync('ep-test.html', epHtml.substring(0, 50000));
    }
})();
