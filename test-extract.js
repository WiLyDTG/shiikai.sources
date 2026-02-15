// Test URL extraction from embeds
async function testExtraction() {
    const episodeUrl = "https://m.animeflv.net/ver/naruto-1";
    
    console.log("Fetching episode page...");
    const response = await fetch(episodeUrl);
    const html = await response.text();
    
    const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
        const videos = JSON.parse(match[1]);
        const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
        
        console.log("Found servers:", allServers.map(s => s.title));
        
        // Try StreamWish
        for (const server of allServers) {
            if (server.title === "SW" && server.code) {
                console.log("\nTrying StreamWish:", server.code);
                try {
                    const swRes = await fetch(server.code);
                    const swHtml = await swRes.text();
                    console.log("SW HTML length:", swHtml.length);
                    
                    const m3u8Match = swHtml.match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i);
                    if (m3u8Match) {
                        console.log("SUCCESS! M3U8 URL:", m3u8Match[1]);
                    } else {
                        console.log("No m3u8 found in response");
                        // Try to find any file: pattern
                        const filePattern = swHtml.match(/file\s*:\s*["']([^"']+)["']/gi);
                        if (filePattern) {
                            console.log("File patterns found:", filePattern.slice(0, 3));
                        }
                    }
                } catch (e) {
                    console.log("SW error:", e.message);
                }
                break;
            }
        }
        
        // Try Streamtape
        for (const server of allServers) {
            if (server.title === "Stape" && server.code) {
                console.log("\nTrying Streamtape:", server.code);
                try {
                    const stRes = await fetch(server.code);
                    const stHtml = await stRes.text();
                    console.log("Stape HTML length:", stHtml.length);
                    
                    const tokenMatch = stHtml.match(/getElementById\('robotlink'\)\.innerHTML\s*=\s*'([^']+)'\s*\+\s*\('([^']+)'\)/);
                    if (tokenMatch) {
                        const videoUrl = "https:" + tokenMatch[1] + tokenMatch[2];
                        console.log("SUCCESS! Stape URL:", videoUrl);
                    } else {
                        console.log("No token pattern found");
                    }
                } catch (e) {
                    console.log("Stape error:", e.message);
                }
                break;
            }
        }
    } else {
        console.log("No videos var found");
    }
}

testExtraction().catch(e => console.log("Error:", e.message));
