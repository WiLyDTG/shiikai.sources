async function search(query) {
    return JSON.stringify([{
        id: "test-1",
        title: "Naruto Test",
        image: "https://m.animeflv.net/uploads/animes/covers/2.jpg",
        url: "https://m.animeflv.net/anime/naruto"
    }]);
}

async function fetchInfo(url) {
    return JSON.stringify([{
        description: "Test description",
        airdate: "2002"
    }]);
}

async function fetchEpisodes(id, page) {
    return JSON.stringify([
        { id: "ep-1", number: 1 },
        { id: "ep-2", number: 2 }
    ]);
}

async function fetchSources(episodeId) {
    return JSON.stringify([{
        label: "Test",
        qualities: [{
            quality: "default",
            url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        }]
    }]);
}

return { search, fetchInfo, fetchEpisodes, fetchSources };
