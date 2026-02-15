const BASE = "https://www3.animeflv.net";
const PROXY = "https://shiikai-sources.pages.dev/proxy";

async function fetchSources(episodeId) {
    try {
        const url = episodeId.startsWith("http") ? episodeId : BASE + episodeId;
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        
        if (match) {
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            const sources = [];
            
            for (const server of allServers) {
                if (server.title === "YourUpload" && server.code) {
                    try {
                        const yuRes = await fetch(server.code);
                        const yuHtml = await yuRes.text();
                        const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
                        if (fileMatch && !fileMatch[1].includes("novideo")) {
                            const proxyUrl = PROXY + "?url=" + encodeURIComponent(fileMatch[1]) + "&referer=" + encodeURIComponent("https://www.yourupload.com/");
                            sources.push({
                                label: "YourUpload (MP4)",
                                qualities: [{ quality: "720p", url: proxyUrl }]
                            });
                        }
                    } catch (e) {}
                }
            }
            
            if (sources.length > 0) {
                return JSON.stringify(sources);
            }
        }
        return JSON.stringify([]);
    } catch (e) {
        return JSON.stringify([]);
    }
}

// Test
(async () => {
    console.log("=== TEST FETCH SOURCES ===\n");
    const result = await fetchSources("https://www3.animeflv.net/ver/naruto-1");
    console.log("RAW OUTPUT:");
    console.log(result);
    
    console.log("\n\nPARSED:");
    const parsed = JSON.parse(result);
    console.log(JSON.stringify(parsed, null, 2));
    
    if (parsed.length > 0 && parsed[0].qualities) {
        console.log("\n\nURL LENGTH:", parsed[0].qualities[0].url.length);
        console.log("\nFULL URL:");
        console.log(parsed[0].qualities[0].url);
    }
})();
