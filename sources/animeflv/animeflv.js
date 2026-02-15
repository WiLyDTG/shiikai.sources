async function searchResults(keyword) {
    const results = [];

    try {
        const response = await fetchv2("https://m.animeflv.net/browse?q=" + encodeURIComponent(keyword));
        const html = await response.text();

        // Buscar todos los <li class="Anime">
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
        const response = await fetchv2("https://m.animeflv.net" + url);
        const html = await response.text();

        // Extraer sinopsis
        const synopsisMatch = html.match(/<strong>Sinopsis:<\/strong>\s*([\s\S]*?)<\/p>/);
        const description = synopsisMatch ? decodeHtmlEntities(synopsisMatch[1].trim()) : "N/A";

        // Extraer estado
        const statusMatch = html.match(/<strong>Estado:<\/strong>\s*<strong[^>]*>([^<]+)<\/strong>/);
        const status = statusMatch ? statusMatch[1].trim() : "N/A";

        // Extraer géneros
        const genresMatch = html.match(/<strong>Generos:<\/strong><\/p>([\s\S]*?)<\/footer>/);
        let genres = "N/A";
        if (genresMatch) {
            const genreTagsMatch = genresMatch[1].match(/<a[^>]*class="Tag"[^>]*>([^<]+)<\/a>/g);
            if (genreTagsMatch) {
                genres = genreTagsMatch.map(tag => {
                    const nameMatch = tag.match(/>([^<]+)</);
                    return nameMatch ? decodeHtmlEntities(nameMatch[1]) : "";
                }).filter(g => g).join(", ");
            }
        }

        return JSON.stringify([{
            description: description,
            aliases: genres,
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
        const response = await fetchv2("https://m.animeflv.net" + url);
        const html = await response.text();

        // Buscar todos los episodios <li class="Episode"><a href="/ver/...">...</a></li>
        const episodeRegex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
        let match;

        while ((match = episodeRegex.exec(html)) !== null) {
            // Extraer número del episodio del título (ej: "Naruto 1" -> 1)
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
        const response = await fetchv2("https://m.animeflv.net" + url);
        const html = await response.text();

        // Buscar var videos = {...};
        const videosMatch = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        if (!videosMatch) {
            return "https://error.org/";
        }

        const videosJson = JSON.parse(videosMatch[1]);
        const streams = [];

        // Procesar servidores SUB (subtitulado)
        if (videosJson.SUB && Array.isArray(videosJson.SUB)) {
            for (const server of videosJson.SUB) {
                if (server.code && server.allow_mobile) {
                    streams.push({
                        title: `SUB - ${server.title}`,
                        streamUrl: server.code,
                        server: server.server
                    });
                }
            }
        }

        // Procesar servidores LAT (latino)
        if (videosJson.LAT && Array.isArray(videosJson.LAT)) {
            for (const server of videosJson.LAT) {
                if (server.code && server.allow_mobile) {
                    streams.push({
                        title: `LAT - ${server.title}`,
                        streamUrl: server.code,
                        server: server.server
                    });
                }
            }
        }

        if (streams.length === 0) {
            return "https://error.org/";
        }

        // Priorizar StreamWish, YourUpload, Okru
        const priorityServers = ['sw', 'yu', 'okru', 'stape', 'mega'];
        const sortedStreams = streams.sort((a, b) => {
            const aIndex = priorityServers.indexOf(a.server);
            const bIndex = priorityServers.indexOf(b.server);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });

        // Retornar el primer stream disponible o la lista completa
        const finalStreams = sortedStreams.map(s => ({
            title: s.title,
            streamUrl: s.streamUrl
        }));

        if (finalStreams.length === 1) {
            return finalStreams[0].streamUrl;
        }

        return JSON.stringify({
            streams: finalStreams
        });

    } catch (err) {
        console.error(err);
        return "https://error.org/";
    }
}

function decodeHtmlEntities(text) {
    if (!text) return text;
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&oacute;/g, 'ó')
        .replace(/&aacute;/g, 'á')
        .replace(/&eacute;/g, 'é')
        .replace(/&iacute;/g, 'í')
        .replace(/&uacute;/g, 'ú')
        .replace(/&ntilde;/g, 'ñ')
        .replace(/&Ntilde;/g, 'Ñ')
        .replace(/&iquest;/g, '¿')
        .replace(/&iexcl;/g, '¡')
        .replace(/&uuml;/g, 'ü')
        .replace(/&Uuml;/g, 'Ü');
}
