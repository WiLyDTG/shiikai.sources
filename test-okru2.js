// Test Ok.ru extraction with proper decoding
async function testOkru() {
    const epRes = await fetch("https://m.animeflv.net/ver/naruto-1");
    const epHtml = await epRes.text();
    
    const match = epHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
        const videos = JSON.parse(match[1]);
        const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
        
        for (const server of allServers) {
            if (server.title === "Okru" && server.code) {
                console.log("Ok.ru embed:", server.code);
                
                try {
                    const okRes = await fetch(server.code);
                    const okHtml = await okRes.text();
                    
                    // Look for data-options JSON
                    const optMatch = okHtml.match(/data-options="([^"]+)"/);
                    if (optMatch) {
                        // Decode HTML entities
                        const decoded = optMatch[1]
                            .replace(/&quot;/g, '"')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>');
                        
                        try {
                            const opts = JSON.parse(decoded);
                            console.log("\nFound options data");
                            
                            // Look for flashvars or metadata
                            if (opts.flashvars) {
                                const fv = opts.flashvars;
                                console.log("Metadata:", fv.metadata ? "present" : "not found");
                                
                                if (fv.metadata) {
                                    const meta = JSON.parse(fv.metadata);
                                    console.log("\nVideo info:");
                                    console.log("Title:", meta.movie?.title);
                                    
                                    if (meta.videos) {
                                        console.log("\nVideos available:");
                                        for (const v of meta.videos) {
                                            console.log(`- ${v.name}: ${v.url?.substring(0, 80)}...`);
                                        }
                                        
                                        // Try to access first video
                                        const firstVideo = meta.videos[0];
                                        if (firstVideo && firstVideo.url) {
                                            console.log("\nTesting first video URL...");
                                            try {
                                                const vRes = await fetch(firstVideo.url, { method: 'HEAD' });
                                                console.log("Status:", vRes.status);
                                                console.log("Content-Type:", vRes.headers.get('content-type'));
                                            } catch (e) {
                                                console.log("Video error:", e.message);
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log("JSON parse error:", e.message);
                        }
                    } else {
                        console.log("No data-options found");
                    }
                } catch (e) {
                    console.log("Error:", e.message);
                }
                break;
            }
        }
    }
}

testOkru().catch(e => console.log("Error:", e.message));
