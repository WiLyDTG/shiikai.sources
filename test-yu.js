// Test YourUpload extraction
async function testYourUpload() {
    // First get the embed URL from AnimeFLV
    const epRes = await fetch("https://m.animeflv.net/ver/naruto-1");
    const epHtml = await epRes.text();
    
    const match = epHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
        const videos = JSON.parse(match[1]);
        const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
        
        const yuServer = allServers.find(s => s.title === "YourUpload");
        if (yuServer) {
            console.log("YourUpload embed:", yuServer.code);
            
            // Fetch YourUpload embed page
            const yuRes = await fetch(yuServer.code, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://m.animeflv.net/"
                }
            });
            const yuHtml = await yuRes.text();
            console.log("YU HTML length:", yuHtml.length);
            
            // Look for file: pattern
            const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+)['"]/i);
            if (fileMatch) {
                console.log("File URL:", fileMatch[1]);
            }
            
            // Look for source pattern
            const srcMatch = yuHtml.match(/src\s*:\s*['"]([^'"]+)['"]/i);
            if (srcMatch) {
                console.log("Src URL:", srcMatch[1]);
            }
            
            // Look for video tag
            const videoMatch = yuHtml.match(/<source[^>]+src=["']([^"']+)["']/i);
            if (videoMatch) {
                console.log("Video source:", videoMatch[1]);
            }
            
            // Look for any mp4
            const mp4Match = yuHtml.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi);
            if (mp4Match) {
                console.log("MP4 URLs:", mp4Match);
            }
            
            // Debug - show first 2000 chars
            console.log("\nHTML preview:", yuHtml.substring(0, 2000));
        }
    }
}

testYourUpload().catch(e => console.log("Error:", e.message));
