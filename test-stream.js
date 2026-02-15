(async () => {
    const videoUrl = "https://vidcache.net:8161/a20260215Vj5BxK17e6w/video.mp4";
    const proxyUrl = "https://shiikai-sources.pages.dev/proxy?url=" + encodeURIComponent(videoUrl) + "&referer=" + encodeURIComponent("https://www.yourupload.com/");
    
    console.log("1. Test HEAD request...");
    const head = await fetch(proxyUrl, { method: 'HEAD' });
    console.log("   Status:", head.status);
    console.log("   Content-Type:", head.headers.get('content-type'));
    console.log("   Content-Length:", head.headers.get('content-length'));
    console.log("   Accept-Ranges:", head.headers.get('accept-ranges'));
    
    console.log("\n2. Test Range request (bytes 0-1000)...");
    const range = await fetch(proxyUrl, {
        headers: { 'Range': 'bytes=0-1000' }
    });
    console.log("   Status:", range.status);
    console.log("   Content-Range:", range.headers.get('content-range'));
    console.log("   Content-Length:", range.headers.get('content-length'));
    
    console.log("\n3. Test directo con Referer...");
    const direct = await fetch(videoUrl, {
        method: 'HEAD',
        headers: { 'Referer': 'https://www.yourupload.com/' }
    });
    console.log("   Status:", direct.status);
    console.log("   Accept-Ranges:", direct.headers.get('accept-ranges'));
})();
