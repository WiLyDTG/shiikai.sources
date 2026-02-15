async function searchResults(keyword) {
    const results = [];

    try {
        const response = await fetchv2("https://m.animeflv.net/browse?q=" + encodeURIComponent(keyword));
        const html = await response.text();

        const animeRegex = /<li class="Anime">\s*<a href="([^"]+)">\s*<figure class="Image"><img src="([^"]+)"[^>]*>[\s\S]*?<\/figure>\s*<h2 class="Title">([^<]+)<\/h2>/g;
        let match;

        while ((match = animeRegex.exec(html)) !== null) {
            results.push({
                title: decodeHtmlEntities(match[3].trim()),
                image: "https://m.animeflv.net" + match[2].trim(),
                href: match[1].trim()
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

            results.push({
                href: match[1].trim(),
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
            return null;
        }

        const videosJson = JSON.parse(videosMatch[1]);
        
        // Buscar StreamWish primero (SUB)
        if (videosJson.SUB && Array.isArray(videosJson.SUB)) {
            const sw = videosJson.SUB.find(s => s.server === "sw");
            if (sw && sw.code) {
                console.log("StreamWish SUB: " + sw.code);
                return sw.code;
            }
            // Si no hay StreamWish, usar el primero disponible
            const first = videosJson.SUB.find(s => s.code && s.allow_mobile);
            if (first && first.code) {
                console.log("First SUB: " + first.code);
                return first.code;
            }
        }

        // Buscar en LAT si no hay SUB
        if (videosJson.LAT && Array.isArray(videosJson.LAT)) {
            const sw = videosJson.LAT.find(s => s.server === "sw");
            if (sw && sw.code) {
                console.log("StreamWish LAT: " + sw.code);
                return sw.code;
            }
            const first = videosJson.LAT.find(s => s.code && s.allow_mobile);
            if (first && first.code) {
                console.log("First LAT: " + first.code);
                return first.code;
            }
        }

        console.log("No stream URL found");
        return null;

    } catch (err) {
        console.error(err);
        return null;
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
        .replace(/&oacute;/g, 'ó')
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&iacute;/g, 'í')
        .replace(/&uacute;/g, 'ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Ntilde;/g, 'Ñ');
}
