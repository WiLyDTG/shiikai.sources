async function search(query) {
  const results = [];
  try {
    const response = await fetch("https://m.animeflv.net/browse?q=" + encodeURIComponent(query));
    const html = await response.text();
    const regex = /<li class="Anime">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h2 class="Title">([^<]+)<\/h2>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[3].trim(),
        image: "https://m.animeflv.net" + match[2].trim(),
        href: "https://m.animeflv.net" + match[1].trim(),
      });
    }
  } catch (e) {}
  return JSON.stringify(results);
}

async function fetchInfo(url) {
  return JSON.stringify([{
    description: "Anime de AnimeFLV",
    airdate: "N/A",
  }]);
}

async function fetchEpisodes(url) {
  const results = [];
  try {
    const response = await fetch(url);
    const html = await response.text();
    const regex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const num = match[2].match(/(\d+)$/);
      results.push({
        href: "https://m.animeflv.net" + match[1].trim(),
        number: num ? parseInt(num[1], 10) : results.length + 1,
      });
    }
  } catch (e) {}
  return JSON.stringify(results);
}

async function fetchSources(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      const videos = JSON.parse(match[1]);
      if (videos.SUB && videos.SUB[0]) return videos.SUB[0].code;
      if (videos.LAT && videos.LAT[0]) return videos.LAT[0].code;
    }
  } catch (e) {}
  return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
}

return {
  search,
  fetchInfo,
  fetchEpisodes,
  fetchSources,
};
