(function() {
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
                const streams = [];
                
                if (videos.SUB && Array.isArray(videos.SUB)) {
                    for (const server of videos.SUB) {
                        if (server.code && server.title) {
                            streams.push({
                                title: server.title + " (SUB)",
                                streamUrl: server.code
                            });
                        }
                    }
                }
                
                if (videos.LAT && Array.isArray(videos.LAT)) {
                    for (const server of videos.LAT) {
                        if (server.code && server.title) {
                            streams.push({
                                title: server.title + " (LAT)",
                                streamUrl: server.code
                            });
                        }
                    }
                }
                
                if (streams.length > 0) {
                    return JSON.stringify({ streams: streams });
                }
            }

            return JSON.stringify({ streams: [] });
        } catch (err) {
            return JSON.stringify({ streams: [] });
        }
    }

    return {
        search: search,
        fetchEpisodes: fetchEpisodes,
        fetchSources: fetchSources
    };
})()
