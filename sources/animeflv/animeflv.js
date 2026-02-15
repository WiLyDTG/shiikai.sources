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
                href: href
            });
        }

        return JSON.stringify(results);
    } catch (err) {
        console.error(err);
        return JSON.stringify([{
            title: "Error",
            image: "Error",
            href: "Error"
        }]);
    }
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
                number: episodeNumber
            });
        }

        return JSON.stringify(results);
    } catch (err) {
        console.error(err);
        return JSON.stringify([{ href: "Error", number: "Error" }]);
    }
}

async function extractStreamUrl(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetchv2(fullUrl);
        const html = await response.text();

        const videosMatch = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        if (!videosMatch) {
            return "https://error.org/";
        }

        const videosJson = JSON.parse(videosMatch[1]);
        
        // Buscar el primer servidor disponible (preferir SUB)
        if (videosJson.SUB && Array.isArray(videosJson.SUB)) {
            for (const server of videosJson.SUB) {
                if (server.code && server.allow_mobile) {
                    return server.code;
                }
            }
        }

        // Si no hay SUB, buscar LAT
        if (videosJson.LAT && Array.isArray(videosJson.LAT)) {
            for (const server of videosJson.LAT) {
                if (server.code && server.allow_mobile) {
                    return server.code;
                }
            }
        }

        return "https://error.org/";

    } catch (err) {
        console.error(err);
        return "https://error.org/";
    }
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
        .replace(/&oacute;/g, 'o')
        .replace(/&aacute;/g, 'a')
        .replace(/&eacute;/g, 'e')
        .replace(/&iacute;/g, 'i')
        .replace(/&uacute;/g, 'u')
        .replace(/&ntilde;/g, 'n')
        .replace(/&Ntilde;/g, 'N');
}
