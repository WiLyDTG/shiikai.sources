async function test() {
  // Test search
  const searchRes = await fetch('https://m.animeflv.net/browse?q=naruto');
  const searchHtml = await searchRes.text();
  const searchRegex = /<li class="Anime">\s*<a href="([^"]+)"[^>]*>[\s\S]*?<img src="([^"]+)"[\s\S]*?<h2 class="Title">([^<]+)<\/h2>/g;
  let match = searchRegex.exec(searchHtml);
  console.log('Search result:', match ? {id: match[1], title: match[3]} : 'NO MATCH');
  
  // Test episodes
  const epRes = await fetch('https://m.animeflv.net/anime/naruto');
  const epHtml = await epRes.text();
  const epRegex = /<li class="Episode"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
  let epMatch = epRegex.exec(epHtml);
  console.log('Episode result:', epMatch ? {href: epMatch[1], text: epMatch[2]} : 'NO MATCH');
  
  // Test video sources
  const vidRes = await fetch('https://m.animeflv.net/ver/naruto-1');
  const vidHtml = await vidRes.text();
  const vidMatch = vidHtml.match(/var videos\s*=\s*(\{[\s\S]*?\});/);
  if (vidMatch) {
    const videos = JSON.parse(vidMatch[1]);
    console.log('Videos SUB:', videos.SUB ? videos.SUB.map(s => ({title: s.title, code: s.code?.substring(0,60)})) : 'NONE');
    console.log('Videos LAT:', videos.LAT ? videos.LAT.map(s => ({title: s.title, code: s.code?.substring(0,60)})) : 'NONE');
  } else {
    console.log('Videos: NO MATCH');
  }
}
test().catch(e => console.log('Error:', e.message));
