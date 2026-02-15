async function search(query) {
    try {
        const response = await fetch("https://m.animeflv.net/browse?q=" + encodeURIComponent(query));
        const html = await response.text();
        const results = [];
        const regex = /<li class="Anime">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h2 class="Title">([^<]+)<\/h2>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            results.push({
                id: match[1].trim(),
                title: match[3].trim(),
                image: "https://m.animeflv.net" + match[2].trim(),
                url: "https://m.animeflv.net" + match[1].trim()
            });
        }
        return JSON.stringify(results);
    } catch (e) {
        return JSON.stringify([]);
    }
}

async function fetchInfo(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/<strong>Sinopsis:<\/strong>\s*([\s\S]*?)<\/p>/);
        return JSON.stringify([{
            description: match ? match[1].trim() : "Sin descripcion",
            airdate: "N/A"
        }]);
    } catch (e) {
        return JSON.stringify([{ description: "Error", airdate: "N/A" }]);
    }
}

async function fetchEpisodes(id, page) {
    try {
        const url = id.startsWith("http") ? id : "https://m.animeflv.net" + id;
        const response = await fetch(url);
        const html = await response.text();
        const results = [];
        const regex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const num = match[2].match(/(\d+)$/);
            results.push({
                id: "https://m.animeflv.net" + match[1].trim(),
                number: num ? parseInt(num[1], 10) : results.length + 1
            });
        }
        return JSON.stringify(results);
    } catch (e) {
        return JSON.stringify([]);
    }
}

async function fetchSources(episodeId) {
    try {
        const url = episodeId.startsWith("http") ? episodeId : "https://m.animeflv.net" + episodeId;
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        
        if (match) {
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            
            // YourUpload - extrae MP4 directo (sin headers, probamos si funciona)
            for (const server of allServers) {
                if (server.title === "YourUpload" && server.code) {
                    try {
                        const yuRes = await fetch(server.code);
                        const yuHtml = await yuRes.text();
                        const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+)['"]/i);
                        if (fileMatch) {
                            return JSON.stringify([{
                                label: "YourUpload",
                                qualities: [{ quality: "720p", url: fileMatch[1] }]
                            }]);
                        }
                    } catch (e) {}
                }
            }
            
            // Fallback: primer servidor
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

return { search, fetchInfo, fetchEpisodes, fetchSources };
