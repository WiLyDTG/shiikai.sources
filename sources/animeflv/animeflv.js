async function searchResults(keyword) {
    const results = [];

    try {
        const response = await fetchv2("https://m.animeflv.net/browse?q=" + encodeURIComponent(keyword));
        const html = await response.text();

        const animeRegex = /<li class="Anime">\s*<a href="([^"]+)">\s*<figure class="Image"><img src="([^"]+)"[^>]*>[\s\S]*?<\/figure>\s*<h2 class="Title">([^<]+)<\/h2>/g;
        let match;

        while ((match = animeRegex.exec(html)) !== null) {
            const href = match[1].trim();
            results.push({
                title: decodeHtmlEntities(match[3].trim()),
                image: "https://m.animeflv.net" + match[2].trim(),
                href: href,
                id: href,
                url: "https://m.animeflv.net" + href
            });
        }

        return JSON.stringify(results);
    } catch (err) {
        console.error(err);
        return JSON.stringify([]);
    }
}

// Alias para StandardClientAdapter
async function search(keyword) {
    return searchResults(keyword);
}

async function extractDetails(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetchv2(fullUrl);
        const html = await response.text();

        const synopsisMatch = html.match(/<strong>Sinopsis:<\/strong>\s*([\s\S]*?)<\/p>/);
        const description = synopsisMatch ? decodeHtmlEntities(synopsisMatch[1].trim()) : "N/A";

        const statusMatch = html.match(/<strong>Estado:<\/strong>\s*<strong[^>]*>([^<]+)<\/strong>/);
        const status = statusMatch ? statusMatch[1].trim() : "N/A";

        return JSON.stringify([{
            description: description,
            aliases: "N/A",
            airdate: status
        }]);

    } catch (err) {
        console.error(err);
        return JSON.stringify([{
            description: "Error",
            aliases: "Error",
            airdate: "Error"
        }]);
    }
}

async function extractEpisodes(url) {
    const results = [];
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetchv2(fullUrl);
        const html = await response.text();

        const episodeRegex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
        let match;

        while ((match = episodeRegex.exec(html)) !== null) {
            const titleText = match[2].trim();
            const numberMatch = titleText.match(/(\d+)$/);
            const episodeNumber = numberMatch ? parseInt(numberMatch[1], 10) : results.length + 1;
            const href = match[1].trim();

            results.push({
                href: href,
                id: href,
                number: episodeNumber
            });
        }

        return JSON.stringify(results);
    } catch (err) {
        console.error(err);
        return JSON.stringify([]);
    }
}

// Alias para StandardClientAdapter
async function fetchEpisodes(url, page) {
    return extractEpisodes(url);
}

async function extractStreamUrl(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetchv2(fullUrl);
        const html = await response.text();

        const videosMatch = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        if (!videosMatch) {
            return null;
        }

        const videosJson = JSON.parse(videosMatch[1]);
        const streams = [];
        
        // Procesar SUB
        if (videosJson.SUB && Array.isArray(videosJson.SUB)) {
            for (const server of videosJson.SUB) {
                if (server.code && server.allow_mobile) {
                    streams.push({
                        title: "SUB - " + server.title,
                        streamUrl: server.code
                    });
                }
            }
        }

        // Procesar LAT
        if (videosJson.LAT && Array.isArray(videosJson.LAT)) {
            for (const server of videosJson.LAT) {
                if (server.code && server.allow_mobile) {
                    streams.push({
                        title: "LAT - " + server.title,
                        streamUrl: server.code
                    });
                }
            }
        }

        if (streams.length === 0) {
            return null;
        }

        // Retornar en formato compatible con Mojuru
        return JSON.stringify({
            streams: streams,
            subtitles: ""
        });

    } catch (err) {
        console.error(err);
        return null;
    }
}

// Alias para StandardClientAdapter
async function fetchSources(episodeId) {
    return extractStreamUrl(episodeId);
}

function decodeHtmlEntities(text) {
    if (!text) {
        return "";
    }
    return text
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
        .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/&oacute;/g, 'ó')
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&iacute;/g, 'í')
        .replace(/&uacute;/g, 'ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Ntilde;/g, 'Ñ');
}
