(async () => {
    // Usar version de escritorio
    const res = await fetch('https://www3.animeflv.net/ver/one-piece-1120');
    const html = await res.text();
    
    console.log('URL:', res.url);
    console.log('Status:', res.status);
    
    // Buscar var videos
    const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (match) {
        console.log('\nVideos encontrados!');
        const videos = JSON.parse(match[1]);
        console.log(JSON.stringify(videos, null, 2));
    } else {
        console.log('No var videos - guardando HTML...');
        require('fs').writeFileSync('desktop.html', html);
    }
})();
