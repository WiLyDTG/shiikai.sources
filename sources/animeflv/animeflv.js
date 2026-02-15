async function search(query) {
  return JSON.stringify([
    {
      id: "naruto",
      title: "Naruto Test",
      image: "https://m.animeflv.net/uploads/animes/covers/2.jpg",
      url: "https://m.animeflv.net/anime/naruto"
    }
  ]);
}

async function fetchInfo(url) {
  return JSON.stringify([{
    description: "Test anime",
    airdate: "2002"
  }]);
}

async function fetchEpisodes(id, page) {
  return JSON.stringify([
    { id: "ep1", number: 1 },
    { id: "ep2", number: 2 }
  ]);
}

async function fetchSources(episodeId) {
  return JSON.stringify([{
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    quality: "default"
  }]);
}

return { search, fetchInfo, fetchEpisodes, fetchSources };
