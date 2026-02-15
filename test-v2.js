(async () => {
    try {
        // Buscar anime
        console.log('1. Buscando naruto...');
        const searchRes = await fetch('https://www3.animeflv.net/browse?q=naruto');
        console.log('   Status:', searchRes.status);
        const searchHtml = await searchRes.text();
        
        const animeMatch = searchHtml.match(/href="(\/anime\/[^"]+)"/);
        if (!animeMatch) {
            console.log('   No anime match');
            return;
        }
        console.log('   Anime:', animeMatch[1]);
        
        // Ir a pagina del anime
        console.log('2. Cargando anime...');
        const animeRes = await fetch('https://www3.animeflv.net' + animeMatch[1]);
        console.log('   Status:', animeRes.status);
        const animeHtml = await animeRes.text();
        
        // Buscar episodios en el listado
        const epMatches = animeHtml.match(/href="(\/ver\/[^"]+)"/g) || [];
        console.log('   Episodios encontrados:', epMatches.length);
        
        if (epMatches.length === 0) {
            // Guardar para debug
            require('fs').writeFileSync('anime.html', animeHtml.substring(0, 100000));
            console.log('   HTML guardado en anime.html');
            return;
        }
        
        // Tomar el primer episodio
        const firstEp = epMatches[0].match(/href="([^"]+)"/)[1];
        console.log('   Primer episodio:', firstEp);
        
        // Ver episodio
        console.log('3. Cargando episodio...');
        const epRes = await fetch('https://www3.animeflv.net' + firstEp);
        console.log('   Status:', epRes.status);
        const epHtml = await epRes.text();
        
        // Buscar videos
        const vidMatch = epHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        if (vidMatch) {
            console.log('\n=== VIDEOS ENCONTRADOS ===');
            const videos = JSON.parse(vidMatch[1]);
            console.log(JSON.stringify(videos, null, 2));
        } else {
            console.log('   No var videos encontrado');
            require('fs').writeFileSync('episode.html', epHtml.substring(0, 100000));
            console.log('   HTML guardado en episode.html');
        }
    } catch (e) {
        console.log('ERROR:', e.message);
        console.log(e.stack);
    }
})();
