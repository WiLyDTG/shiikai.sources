// Debug - see what StreamWish and Streamtape actually return
async function debug() {
    // StreamWish
    console.log("=== STREAMWISH ===");
    try {
        const swRes = await fetch("https://streamwish.to/e/7xj8vx4vwwzf");
        const swHtml = await swRes.text();
        console.log("Full response:", swHtml);
    } catch (e) {
        console.log("SW error:", e.message);
    }
    
    // Streamtape - look for video patterns
    console.log("\n=== STREAMTAPE ===");
    try {
        const stRes = await fetch("https://streamtape.com/e/4v0aRBzva2cKq06/");
        const stHtml = await stRes.text();
        
        // Look for robotlink
        const robotMatch = stHtml.match(/getElementById\(['"]robotlink['"]\)[^;]*;/g);
        console.log("Robot patterns:", robotMatch);
        
        // Look for any tape URLs
        const tapeUrls = stHtml.match(/\/\/[a-z0-9]+\.streamtape\.com\/get_video[^"']+/gi);
        console.log("Tape URLs:", tapeUrls);
        
        // Look for token
        const tokenMatch = stHtml.match(/token=([^&"']+)/g);
        console.log("Token patterns:", tokenMatch?.slice(0, 3));
        
    } catch (e) {
        console.log("Stape error:", e.message);
    }
    
    // Try Ok.ru
    console.log("\n=== OK.RU ===");
    try {
        const okRes = await fetch("https://ok.ru/videoembed/7686266649282");
        const okHtml = await okRes.text();
        console.log("OK.ru HTML length:", okHtml.length);
        
        // Look for video URLs
        const hlsMatch = okHtml.match(/hlsManifestUrl['"]\s*:\s*['"]([^'"]+)/i);
        if (hlsMatch) {
            console.log("HLS URL:", decodeURIComponent(hlsMatch[1]));
        }
        
        const mp4Match = okHtml.match(/"url":"(https?:[^"]+\.mp4[^"]*)"/gi);
        console.log("MP4 URLs:", mp4Match?.slice(0, 2));
        
    } catch (e) {
        console.log("OK.ru error:", e.message);
    }
}

debug().catch(e => console.log("Error:", e.message));
