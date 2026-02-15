const fetch = globalThis.fetch;

(async () => {
    try {
        const res = await fetch('https://m.animeflv.net/ver/one-piece-1126');
        const html = await res.text();
        const match = html.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
        
        if (match) {
            const videos = JSON.parse(match[1]);
            const allServers = [...(videos.SUB || []), ...(videos.LAT || [])];
            const yu = allServers.find(s => s.title === 'YourUpload');
            
            if (yu) {
                console.log('YourUpload embed:', yu.code);
                const yuRes = await fetch(yu.code);
                const yuHtml = await yuRes.text();
                const fileMatch = yuHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
                
                if (fileMatch) {
                    const videoUrl = fileMatch[1];
                    console.log('\nVideo URL:', videoUrl);
                    
                    // Probar directamente
                    try {
                        const direct = await fetch(videoUrl, { method: 'HEAD' });
                        console.log('Direct status:', direct.status);
                    } catch (e) {
                        console.log('Direct error:', e.message);
                    }
                    
                    // Probar via proxy
                    const proxyUrl = 'https://shiikai-sources.pages.dev/proxy?url=' + encodeURIComponent(videoUrl) + '&referer=' + encodeURIComponent('https://www.yourupload.com/');
                    console.log('\nProxy URL:', proxyUrl);
                    
                    try {
                        const proxied = await fetch(proxyUrl, { method: 'HEAD' });
                        console.log('Proxy status:', proxied.status);
                        console.log('Content-Type:', proxied.headers.get('content-type'));
                    } catch (e) {
                        console.log('Proxy error:', e.message);
                    }
                } else {
                    console.log('No MP4 found in YourUpload');
                }
            } else {
                console.log('No YourUpload server found');
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
})();
