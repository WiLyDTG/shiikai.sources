(async () => {
    // StreamWish necesita extraer de forma especial
    const url = "https://streamwish.to/e/7xj8vx4vwwzf";
    
    console.log("Fetching StreamWish...");
    const res = await fetch(url);
    const html = await res.text();
    
    // Guardar para analizar
    require('fs').writeFileSync('streamwish.html', html);
    console.log("HTML guardado");
    
    // Buscar patrones
    console.log("\nBuscando patrones...");
    
    // Packed JS
    if (html.includes("eval(function(p,a,c,k,e,d)")) {
        console.log("Tiene: packed JS (necesita unpacker)");
    }
    
    // Direct sources
    const sources = html.match(/sources\s*[=:]\s*\[([\s\S]*?)\]/i);
    if (sources) {
        console.log("Sources:", sources[0].substring(0, 200));
    }
    
    // File patterns
    const file = html.match(/file\s*:\s*["']([^"']+)/gi);
    if (file) {
        console.log("File patterns:", file);
    }
    
    // M3U8
    const m3u8 = html.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi);
    if (m3u8) {
        console.log("M3U8 URLs:", m3u8);
    }
})();
