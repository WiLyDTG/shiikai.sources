async function search(query) {
    const results = [];
    try {
        const response = await fetch("https://m.animeflv.net/browse?q=" + encodeURIComponent(query));
        const html = await response.text();
        
        const regex = /<li class="Anime">\s*<a href="([^"]+)">\s*<figure class="Image"><img src="([^"]+)"[^>]*>[\s\S]*?<\/figure>\s*<h2 class="Title">([^<]+)<\/h2>/g;

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
    } catch (err) {
        return JSON.stringify([]);
    }
}

async function fetchInfo(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const match = html.match(/<strong>Sinopsis:<\/strong>\s*([\s\S]*?)<\/p>/);
        const description = match ? match[1].trim() : "Sin descripcion";

        return JSON.stringify([{
            description: description,
            airdate: "N/A"
        }]);
    } catch (err) {
        return JSON.stringify([{ description: "Error", airdate: "N/A" }]);
    }
}

async function fetchEpisodes(id) {
    const results = [];
    try {
        const url = id.startsWith("http") ? id : "https://m.animeflv.net" + id;
        const response = await fetch(url);
        const html = await response.text();

        const regex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
        let match;

        while ((match = regex.exec(html)) !== null) {
            const numberMatch = match[2].match(/(\d+)$/);
            results.push({
                id: match[1].trim(),
                number: numberMatch ? parseInt(numberMatch[1], 10) : results.length + 1
            });
        }

        return JSON.stringify(results);
    } catch (err) {
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
            
            // Buscar YourUpload que tiene URLs directas
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            
            for (const server of allServers) {
                if (server.title === "YourUpload" && server.code) {
                    const yuRes = await fetch(server.code);
                    const yuHtml = await yuRes.text();
                    const fileMatch = yuHtml.match(/file\s*:\s*["']([^"']+)["']/i);
                    if (fileMatch) {
                        return JSON.stringify([{
                            url: fileMatch[1],
                            quality: "720p"
                        }]);
                    }
                }
            }
            
            // Fallback
            if (videos.SUB && videos.SUB[0] && videos.SUB[0].code) {
                return JSON.stringify([{ url: videos.SUB[0].code, quality: "default" }]);
            }
            if (videos.LAT && videos.LAT[0] && videos.LAT[0].code) {
                return JSON.stringify([{ url: videos.LAT[0].code, quality: "default" }]);
            }
        }

        return JSON.stringify([]);
    } catch (err) {
        return JSON.stringify([]);
    }
}

return {
    search,
    fetchInfo,
    fetchEpisodes,
    fetchSources
};
