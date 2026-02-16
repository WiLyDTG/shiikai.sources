const BASE = "https://www3.animeflv.net";
const PROXY = "https://shiikai-sources.pages.dev/proxy";

async function search(query) {
    try {
        const response = await fetch(BASE + "/browse?q=" + encodeURIComponent(query));
        const html = await response.text();
        const results = [];
        
        const regex = /<article class="Anime[^"]*"[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h3 class="Title">([^<]+)<\/h3>/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            results.push({
                id: match[1].trim(),
                title: match[3].trim(),
                image: match[2].startsWith("http") ? match[2].trim() : BASE + match[2].trim(),
                url: BASE + match[1].trim()
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
        const descMatch = html.match(/<div class="Description">[\s\S]*?<p>([\s\S]*?)<\/p>/);
        return JSON.stringify([{
            description: descMatch ? descMatch[1].trim().replace(/<[^>]+>/g, '') : "Sin descripcion",
            airdate: "N/A"
        }]);
    } catch (e) {
        return JSON.stringify([{ description: "Error", airdate: "N/A" }]);
    }
}

async function fetchEpisodes(id, page) {
    try {
        const url = id.startsWith("http") ? id : BASE + id;
        const response = await fetch(url);
        const html = await response.text();
        const results = [];
        
        const infoMatch = html.match(/var anime_info\s*=\s*\[([^\]]+)\]/);
        const epsMatch = html.match(/var episodes\s*=\s*\[([\s\S]*?)\];/);
        
        if (infoMatch && epsMatch) {
            const infoParts = infoMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
            const slug = infoParts[2];
            
            const epsData = epsMatch[1];
            const epRegex = /\[(\d+),(\d+)\]/g;
            let epMatch;
            while ((epMatch = epRegex.exec(epsData)) !== null) {
                const epNum = parseInt(epMatch[1], 10);
                results.push({
                    id: BASE + "/ver/" + slug + "-" + epNum,
                    number: epNum
                });
            }
            results.sort((a, b) => a.number - b.number);
        }
        return JSON.stringify(results);
    } catch (e) {
        return JSON.stringify([]);
    }
}

async function fetchSources(episodeId) {
    try {
        const url = episodeId.startsWith("http") ? episodeId : BASE + episodeId;
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        
        if (match) {
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            const hlsSources = [];
            const embedSources = [];

            // Separate HLS (YourUpload) from embed fallbacks so we can return HLS-first.
            for (const server of allServers) {
                if (!server || !server.code) continue;
                const title = server.title || "Unknown";

                if (title === "YourUpload") {
                    const idMatch = server.code.match(/embed\/([^?#]+)/);
                    if (idMatch) {
                        const hlsUrl = "https://shiikai-sources.pages.dev/hls?yourupload_id=" + encodeURIComponent(idMatch[1]);
                        hlsSources.push({ label: "YourUpload (HLS)", qualities: [{ quality: "720p", url: hlsUrl }] });
                        // keep embed as fallback
                        embedSources.push({ label: "YourUpload (Embed)", qualities: [{ quality: "default", url: server.code }] });
                    } else {
                        embedSources.push({ label: "YourUpload (Embed)", qualities: [{ quality: "default", url: server.code }] });
                    }
                    continue;
                }

                // Generic embed fallback for any other server
                embedSources.push({ label: `${title} (Embed)`, qualities: [{ quality: "default", url: server.code }] });
            }

            const combined = [...hlsSources, ...embedSources];
            if (combined.length > 0) return JSON.stringify(combined);
        }
        return JSON.stringify([]);
    } catch (e) {
        return JSON.stringify([]);
    }
}

return { search, fetchInfo, fetchEpisodes, fetchSources };
