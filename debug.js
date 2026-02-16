(async () => {
    const BASE = "https://www3.animeflv.net";
    const PROXY = "https://shiikai-sources.pages.dev/proxy";
    
    // Probar varios episodios recientes
    const episodes = [
        "/ver/one-piece-1126",
        "/ver/one-piece-1125",
        "/ver/dragon-ball-daima-20",
        "/ver/naruto-1"
    ];
    
    for (const ep of episodes) {
        console.log(`\n=== ${ep} ===`);
        try {
            const res = await fetch(BASE + ep);
            if (res.status !== 200) {
                console.log("  Status:", res.status);
                continue;
            }
            
            const html = await res.text();
            const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
            
            if (!match) {
                console.log("  No videos found");
                continue;
            }
            
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            
            console.log("  Servers:", allServers.map(s => s.title).join(", "));
            
            // Probar YourUpload
            const yu = allServers.find(s => s.title === "YourUpload");
            if (yu) {
                console.log("  YourUpload embed:", yu.code);
                const yuRes = await fetch(yu.code);
                const yuHtml = await yuRes.text();
                const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
                
                if (fileMatch) {
                    console.log("  MP4:", fileMatch[1].substring(0, 60) + "...");
                    console.log("  novideo?", fileMatch[1].includes("novideo"));
                } else {
                    console.log("  NO MP4 FOUND");
                    // Buscar otros patrones
                    const anyFile = yuHtml.match(/file\s*:\s*['"]([^'"]+)['"]/gi);
                    if (anyFile) console.log("  Other file patterns:", anyFile);
                }
            } else {
                console.log("  No YourUpload available");
            }
        } catch (e) {
            console.log("  Error:", e.message);
        }
    }
})();
