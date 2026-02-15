(async () => {
    // Test search
    const searchRes = await fetch('https://m.animeflv.net/browse?q=naruto');
    const searchHtml = await searchRes.text();
    
    const regex = /<li class="Anime">\s*<a href="([^"]+)">\s*<figure class="Image"><img src="([^"]+)"[^>]*>[\s\S]*?<\/figure>\s*<h2 class="Title">([^<]+)<\/h2>/g;
    let match = regex.exec(searchHtml);
    if (match) {
        console.log('Search OK - Found:', match[3].trim());
        const animeUrl = 'https://m.animeflv.net' + match[1].trim();
        console.log('URL:', animeUrl);
        
        // Test episodes
        const epRes = await fetch(animeUrl);
        const epHtml = await epRes.text();
        const epRegex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
        let epMatch = epRegex.exec(epHtml);
        if (epMatch) {
            console.log('Episode found:', epMatch[2].trim());
            const epUrl = 'https://m.animeflv.net' + epMatch[1].trim();
            console.log('Episode URL:', epUrl);
            
            // Test video extraction
            const vidRes = await fetch(epUrl);
            const vidHtml = await vidRes.text();
            const vidMatch = vidHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
            if (vidMatch) {
                console.log('Videos JSON found!');
                const videos = JSON.parse(vidMatch[1]);
                console.log('SUB:', videos.SUB ? videos.SUB.length + ' servers' : 'none');
                console.log('LAT:', videos.LAT ? videos.LAT.length + ' servers' : 'none');
                if (videos.SUB && videos.SUB[0]) {
                    console.log('First SUB server:', JSON.stringify(videos.SUB[0]));
                }
            } else {
                console.log('No videos var found');
                // Check if page requires different parsing
                if (vidHtml.includes('video')) {
                    console.log('HTML contains "video" somewhere');
                }
                console.log('HTML length:', vidHtml.length);
            }
        } else {
            console.log('No episodes found');
        }
    } else {
        console.log('No search results');
    }
})();
