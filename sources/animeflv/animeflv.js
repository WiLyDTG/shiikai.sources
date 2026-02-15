async function searchResults(keyword) {
    try {
        const response = await fetch("https://m.animeflv.net/browse?q=" + encodeURIComponent(keyword));
        const html = await response.text();
        const results = [];
        const regex = /<li class="Anime">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h2 class="Title">([^<]+)<\/h2>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            results.push({
                title: match[3].trim(),
                image: "https://m.animeflv.net" + match[2].trim(),
                href: match[1].trim()
            });
        }
        return JSON.stringify(results);
    } catch (e) {
        return JSON.stringify([]);
    }
}

async function extractDetails(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetch(fullUrl);
        const html = await response.text();
        const match = html.match(/<strong>Sinopsis:<\/strong>\s*([\s\S]*?)<\/p>/);
        return JSON.stringify([{
            description: match ? match[1].trim() : "Sin descripcion",
            aliases: "N/A",
            airdate: "N/A"
        }]);
    } catch (e) {
        return JSON.stringify([{ description: "Error", aliases: "N/A", airdate: "N/A" }]);
    }
}

async function extractEpisodes(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetch(fullUrl);
        const html = await response.text();
        const results = [];
        const regex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const num = match[2].match(/(\d+)$/);
            results.push({
                href: "https://m.animeflv.net" + match[1].trim(),
                number: num ? parseInt(num[1], 10) : results.length + 1
            });
        }
        return JSON.stringify(results);
    } catch (e) {
        return JSON.stringify([]);
    }
}

async function extractStreamUrl(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetch(fullUrl);
        const html = await response.text();
        const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        
        if (match) {
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            
            // YourUpload - extrae MP4 directo
            for (const server of allServers) {
                if (server.title === "YourUpload" && server.code) {
                    try {
                        const yuRes = await fetch(server.code);
                        const yuHtml = await yuRes.text();
                        const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+)['"]/i);
                        if (fileMatch) {
                            return JSON.stringify({
                                streams: [{
                                    title: "YourUpload",
                                    streamUrl: fileMatch[1],
                                    headers: {
                                        "Referer": "https://www.yourupload.com/",
                                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
                                    }
                                }],
                                subtitles: ""
                            });
                        }
                    } catch (e) {}
                }
            }
            
            // Fallback
            if (allServers[0] && allServers[0].code) {
                return JSON.stringify({
                    streams: [{
                        title: allServers[0].title || "Video",
                        streamUrl: allServers[0].code,
                        headers: {}
                    }],
                    subtitles: ""
                });
            }
        }
        return "https://error.org/";
    } catch (e) {
        return "https://error.org/";
    }
}
