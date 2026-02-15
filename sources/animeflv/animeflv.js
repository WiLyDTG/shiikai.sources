async function searchResults(keyword) {
  const results = [];
  try {
    const response = await fetchv2("https://m.animeflv.net/browse?q=" + encodeURIComponent(keyword));
    const html = await response.text();
    const regex = /<li class="Anime">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h2 class="Title">([^<]+)<\/h2>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({
        title: match[3].trim(),
        image: "https://m.animeflv.net" + match[2].trim(),
        href: match[1].trim()
      });
    }
    return JSON.stringify(results);
  } catch (err) {
    return JSON.stringify([]);
  }
}

async function extractDetails(url) {
  try {
    const response = await fetchv2("https://m.animeflv.net" + url);
    const html = await response.text();
    const match = html.match(/<strong>Sinopsis:<\/strong>\s*([\s\S]*?)<\/p>/);
    const description = match ? match[1].trim() : "Sin descripcion";
    return JSON.stringify([{
      description: description,
      aliases: "N/A",
      airdate: "N/A"
    }]);
  } catch (err) {
    return JSON.stringify([{ description: "Error", aliases: "N/A", airdate: "N/A" }]);
  }
}

async function extractEpisodes(url) {
  const results = [];
  try {
    const response = await fetchv2("https://m.animeflv.net" + url);
    const html = await response.text();
    const regex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const num = match[2].match(/(\d+)$/);
      results.push({
        href: match[1].trim(),
        number: num ? parseInt(num[1], 10) : results.length + 1
      });
    }
    return JSON.stringify(results);
  } catch (err) {
    return JSON.stringify([]);
  }
}

async function extractStreamUrl(url) {
  try {
    const response = await fetchv2("https://m.animeflv.net" + url);
    const html = await response.text();
    const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
      const videos = JSON.parse(match[1]);
      if (videos.SUB && videos.SUB[0] && videos.SUB[0].code) {
        return videos.SUB[0].code;
      }
      if (videos.LAT && videos.LAT[0] && videos.LAT[0].code) {
        return videos.LAT[0].code;
      }
    }
    return "";
  } catch (err) {
    return "";
  }
}
