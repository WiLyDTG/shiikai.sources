// Test del nuevo script para www3.animeflv.net
const BASE = "https://www3.animeflv.net";

(async () => {
    console.log("=== TEST SEARCH ===");
    const searchRes = await fetch(BASE + "/browse?q=naruto");
    const searchHtml = await searchRes.text();
    
    const regex = /<article class="Anime[^"]*"[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h3 class="Title">([^<]+)<\/h3>/g;
    let match;
    let count = 0;
    while ((match = regex.exec(searchHtml)) !== null && count < 3) {
        console.log("Anime:", match[3].trim());
        console.log("  URL:", match[1]);
        console.log("  Img:", match[2].substring(0, 50) + "...");
        count++;
    }
    
    if (count === 0) {
        console.log("No matches found - saving HTML...");
        require('fs').writeFileSync('search-test.html', searchHtml.substring(0, 50000));
    }
})();
