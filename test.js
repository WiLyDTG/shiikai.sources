(async () => {
    // Test if YourUpload URL is accessible
    const videoUrl = 'https://vidcache.net:8161/a20260215sDn03151oQ0/video.mp4';
    
    try {
        // Test HEAD request
        const res = await fetch(videoUrl, {
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.yourupload.com/'
            }
        });
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));
        console.log('Content-Length:', res.headers.get('content-length'));
    } catch (err) {
        console.log('Error:', err.message);
    }
    
    // Try without referer
    try {
        const res2 = await fetch(videoUrl, { method: 'HEAD' });
        console.log('Without referer - Status:', res2.status);
    } catch (err) {
        console.log('Without referer - Error:', err.message);
    }
})();
