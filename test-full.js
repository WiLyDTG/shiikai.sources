(async () => {
    // Buscar anime y luego episodio
    console.log('Buscando naruto...');
    const searchRes = await fetch('https://www3.animeflv.net/browse?q=naruto');
    console.log('Search status:', searchRes.status);
    
    const searchHtml = await searchRes.text();
    const animeMatch = searchHtml.match(/href="(\/anime\/[^"]+)"/);
    
    if (animeMatch) {
        console.log('Anime encontrado:', animeMatch[1]);
        
        // Ir a la pagina del anime
        const animeRes = await fetch('https://www3.animeflv.net' + animeMatch[1]);
        const animeHtml = await animeRes.text();
        
        // Buscar episodio
        const epMatch = animeHtml.match(/href="(\/ver\/[^"]+)"/);
        if (epMatch) {
            console.log('Episodio:', epMatch[1]);
            
            // Ver episodio
            const epRes = await fetch('https://www3.animeflv.net' + epMatch[1]);
            const epHtml = await epRes.text();
            
            // Buscar videos
            const vidMatch = epHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
            if (vidMatch) {
                console.log('\n--- VIDEOS ---');
                const videos = JSON.parse(vidMatch[1]);
                console.log(JSON.stringify(videos, null, 2));
            } else {
                console.log('No var videos');
                require('fs').writeFileSync('ep.html', epHtml.substring(0, 50000));
            }
        }
    } else {
        console.log('No anime encontrado');
        require('fs').writeFileSync('search.html', searchHtml.substring(0, 20000));
    }
})();
