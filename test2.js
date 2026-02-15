// Test simple del proxy
(async () => {
    // Primero busquemos un episodio con YourUpload
    console.log('Buscando episodio con YourUpload...');
    
    const res = await fetch('https://m.animeflv.net/ver/one-piece-1120');
    const html = await res.text();
    console.log('Pagina cargada, buscando videos...');
    
    const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
    if (!match) {
        console.log('No se encontro var videos');
        return;
    }
    
    const videos = JSON.parse(match[1]);
    console.log('Videos encontrados:', JSON.stringify(videos, null, 2));
    
    const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
    console.log('Servidores:', allServers.map(s => s.title).join(', '));
})();
