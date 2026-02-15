// Simulate what fetchSources returns
async function testFetchSources() {
    const episodeUrl = "https://m.animeflv.net/ver/naruto-1";
    
    console.log("Testing fetchSources for:", episodeUrl);
    
    const response = await fetch(episodeUrl);
    const html = await response.text();
    const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    
    if (match) {
        const videos = JSON.parse(match[1]);
        const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
        
        // YourUpload
        for (const server of allServers) {
            if (server.title === "YourUpload" && server.code) {
                console.log("\n=== YourUpload ===");
                try {
                    const yuRes = await fetch(server.code);
                    const yuHtml = await yuRes.text();
                    const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
                    if (fileMatch && !fileMatch[1].includes("novideo")) {
                        console.log("MP4 URL:", fileMatch[1]);
                        
                        // Test if accessible
                        try {
                            const testRes = await fetch(fileMatch[1], { method: 'HEAD' });
                            console.log("Status:", testRes.status);
                        } catch (e) {
                            console.log("Video fetch error:", e.message);
                        }
                    } else {
                        console.log("No valid MP4 found");
                    }
                } catch (e) {
                    console.log("Error:", e.message);
                }
                break;
            }
        }
        
        // Netu
        for (const server of allServers) {
            if (server.title === "Netu" && server.code) {
                console.log("\n=== Netu ===");
                try {
                    const netuRes = await fetch(server.code);
                    const netuHtml = await netuRes.text();
                    const m3u8Match = netuHtml.match(/src\s*:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/i);
                    if (m3u8Match) {
                        console.log("M3U8 URL:", m3u8Match[1]);
                        
                        // Test if accessible
                        try {
                            const testRes = await fetch(m3u8Match[1], { method: 'HEAD' });
                            console.log("Status:", testRes.status);
                        } catch (e) {
                            console.log("M3U8 fetch error:", e.message);
                        }
                    } else {
                        console.log("No M3U8 found");
                    }
                } catch (e) {
                    console.log("Error:", e.message);
                }
                break;
            }
        }
    }
}

testFetchSources().catch(e => console.log("Error:", e.message));
