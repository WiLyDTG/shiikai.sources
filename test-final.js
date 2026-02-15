// Test final de fetchSources con extracción de YourUpload
async function fetchSources(episodeId) {
    try {
        const url = episodeId.startsWith("http") ? episodeId : "https://m.animeflv.net" + episodeId;
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        if (match) {
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            
            // YourUpload - funciona y devuelve MP4 directo
            for (const server of allServers) {
                if (server.title === "YourUpload" && server.code) {
                    try {
                        const yuRes = await fetch(server.code);
                        const yuHtml = await yuRes.text();
                        const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+)['"]/i);
                        if (fileMatch) {
                            return JSON.stringify([{
                                label: "YourUpload",
                                qualities: [{ quality: "default", url: fileMatch[1] }]
                            }]);
                        }
                    } catch (e) {}
                }
            }
            
            // Fallback: devolver embed URL
            if (allServers[0] && allServers[0].code) {
                return JSON.stringify([{
                    label: allServers[0].title || "Video",
                    qualities: [{ quality: "default", url: allServers[0].code }]
                }]);
            }
        }
        return JSON.stringify([]);
    } catch (e) {
        return JSON.stringify([]);
    }
}

// Test
async function test() {
    console.log("Testing fetchSources for Naruto episode 1...");
    const result = await fetchSources("https://m.animeflv.net/ver/naruto-1");
    console.log("Result:", result);
    
    const parsed = JSON.parse(result);
    if (parsed[0] && parsed[0].qualities && parsed[0].qualities[0]) {
        console.log("\nVideo URL:", parsed[0].qualities[0].url);
        console.log("Label:", parsed[0].label);
        
        // Verificar que es URL directa (no embed)
        const url = parsed[0].qualities[0].url;
        if (url.includes(".mp4") || url.includes(".m3u8")) {
            console.log("\n✅ SUCCESS: Direct video URL extracted!");
        } else if (url.includes("embed")) {
            console.log("\n⚠️ WARNING: Embed URL returned (fallback)");
        } else {
            console.log("\n✅ Direct URL format");
        }
    }
}

test().catch(e => console.log("Error:", e.message));
