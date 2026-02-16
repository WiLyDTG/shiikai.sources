(async () => {
    console.log("=== TEST YOURUPLOAD ENDPOINT ===\n");
    
    // ID de un video de naruto
    const id = "D1OgmRtniGT7";
    const url = "https://shiikai-sources.pages.dev/yourupload?id=" + id;
    
    console.log("URL:", url);
    console.log("\n1. HEAD request...");
    
    try {
        const head = await fetch(url, { method: 'HEAD' });
        console.log("   Status:", head.status);
        console.log("   Content-Type:", head.headers.get('content-type'));
        console.log("   Content-Length:", head.headers.get('content-length'));
        console.log("   Accept-Ranges:", head.headers.get('accept-ranges'));
    } catch (e) {
        console.log("   Error:", e.message);
    }
    
    console.log("\n2. Range request...");
    try {
        const range = await fetch(url, {
            headers: { 'Range': 'bytes=0-1000' }
        });
        console.log("   Status:", range.status);
        console.log("   Content-Range:", range.headers.get('content-range'));
        
        const buffer = await range.arrayBuffer();
        console.log("   Bytes received:", buffer.byteLength);
    } catch (e) {
        console.log("   Error:", e.message);
    }
    
    console.log("\n3. Test plugin output...");
    // Simular lo que devuelve el plugin
    const pluginUrl = "https://shiikai-sources.pages.dev/yourupload?id=" + id;
    console.log("   Plugin URL:", pluginUrl);
    console.log("   URL Length:", pluginUrl.length);
})();
