// Wrapper para compatibilidad
async function fetchv2(url, headers = {}, method = "GET", body = null) {
    const options = {
        method: method,
        headers: headers
    };
    if (body && method !== "GET" && method !== "HEAD") {
        options.body = body;
    }
    return fetch(url, options);
}

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

// Extraer URL directa de Streamwish
async function extractStreamwish(embedUrl) {
    try {
        const headers = {
            "Referer": "https://animeflv.net/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
        };
        const response = await fetchv2(embedUrl, headers);
        const html = await response.text();
        
        // Buscar URL m3u8 en el HTML
        const m3u8Match = html.match(/file:\s*["']([^"']+\.m3u8[^"']*)/i) ||
                          html.match(/source:\s*["']([^"']+\.m3u8[^"']*)/i) ||
                          html.match(/["']([^"']+master\.m3u8[^"']*)/i);
        
        if (m3u8Match) {
            return {
                url: m3u8Match[1],
                headers: headers
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// Extraer URL directa de OK.ru
async function extractOkru(embedUrl) {
    try {
        const headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
        };
        const response = await fetchv2(embedUrl, headers);
        const html = await response.text();
        
        // Buscar data-options con videos
        const optionsMatch = html.match(/data-options="([^"]+)"/);
        if (optionsMatch) {
            const decoded = optionsMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            try {
                const options = JSON.parse(decoded);
                const videos = options.flashvars?.metadata?.videos;
                if (videos && videos.length > 0) {
                    // Obtener la mejor calidad
                    const best = videos.reduce((a, b) => 
                        (parseInt(b.name) > parseInt(a.name)) ? b : a
                    );
                    return {
                        url: best.url,
                        headers: {}
                    };
                }
            } catch (e) {}
        }
        
        // Fallback: buscar URL directa
        const urlMatch = html.match(/["'](https?:\/\/[^"']+\.mp4[^"']*)/i);
        if (urlMatch) {
            return {
                url: urlMatch[1],
                headers: {}
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// Extraer URL directa de Streamtape
async function extractStreamtape(embedUrl) {
    try {
        const headers = {
            "Referer": "https://animeflv.net/",
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
        };
        const response = await fetchv2(embedUrl, headers);
        const html = await response.text();
        
        // Streamtape usa un truco con innerHTML
        const tokenMatch = html.match(/innerHTML\s*=\s*["'][^"']*\/\/([^"']+)/);
        if (tokenMatch) {
            const videoUrl = "https://" + tokenMatch[1];
            return {
                url: videoUrl,
                headers: headers
            };
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function extractStreamUrl(url) {
    try {
        const fullUrl = url.startsWith("http") ? url : "https://m.animeflv.net" + url;
        const response = await fetchv2(fullUrl);
        const html = await response.text();

        const videosMatch = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        if (!videosMatch) {
            return JSON.stringify({
                streams: [],
                subtitles: ""
            });
        }

        const videosJson = JSON.parse(videosMatch[1]);
        const streams = [];
        
        // Función para procesar cada servidor
        async function processServer(server, prefix) {
            if (!server.code || !server.allow_mobile) return null;
            
            const embedUrl = server.code;
            const title = prefix + " - " + server.title;
            let directUrl = null;
            let headers = {};
            
            // Intentar extraer URL directa según el servidor
            if (embedUrl.includes("streamwish") || embedUrl.includes("wishembed")) {
                const result = await extractStreamwish(embedUrl);
                if (result) {
                    directUrl = result.url;
                    headers = result.headers;
                }
            } else if (embedUrl.includes("ok.ru")) {
                const result = await extractOkru(embedUrl);
                if (result) {
                    directUrl = result.url;
                    headers = result.headers;
                }
            } else if (embedUrl.includes("streamtape")) {
                const result = await extractStreamtape(embedUrl);
                if (result) {
                    directUrl = result.url;
                    headers = result.headers;
                }
            }
            
            // Si no se pudo extraer URL directa, usar embed
            return {
                title: title,
                streamUrl: directUrl || embedUrl,
                headers: Object.keys(headers).length > 0 ? headers : undefined
            };
        }
        
        // Procesar SUB
        if (videosJson.SUB && Array.isArray(videosJson.SUB)) {
            for (const server of videosJson.SUB) {
                const stream = await processServer(server, "SUB");
                if (stream) streams.push(stream);
            }
        }

        // Procesar LAT
        if (videosJson.LAT && Array.isArray(videosJson.LAT)) {
            for (const server of videosJson.LAT) {
                const stream = await processServer(server, "LAT");
                if (stream) streams.push(stream);
            }
        }

        return JSON.stringify({
            streams: streams,
            subtitles: ""
        });

    } catch (err) {
        console.error(err);
        return JSON.stringify({
            streams: [],
            subtitles: ""
        });
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
