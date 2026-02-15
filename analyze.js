(async () => {
    const res = await fetch('https://m.animeflv.net/ver/one-piece-1120');
    const html = await res.text();
    
    // Guardar HTML para analizar
    require('fs').writeFileSync('episode.html', html);
    console.log('HTML guardado en episode.html');
    
    // Buscar patrones de video
    console.log('\n--- Buscando patrones ---');
    
    if (html.includes('var videos')) console.log('Tiene: var videos');
    if (html.includes('data-video')) console.log('Tiene: data-video');
    if (html.includes('iframe')) console.log('Tiene: iframe');
    if (html.includes('StreamServers')) console.log('Tiene: StreamServers');
    if (html.includes('SUB')) console.log('Tiene: SUB');
    if (html.includes('yourupload')) console.log('Tiene: yourupload');
    if (html.includes('embed')) console.log('Tiene: embed');
    
    // Buscar scripts
    const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    console.log('\nScripts encontrados:', scripts.length);
    
    // Buscar links de video
    const videoLinks = html.match(/https?:\/\/[^\s"'<>]+(?:embed|video|watch|ver)[^\s"'<>]*/gi) || [];
    console.log('Links de video:', videoLinks.slice(0, 5));
})();
