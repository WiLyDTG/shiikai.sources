export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*',
      },
    });
  }

  // Get YourUpload embed ID
  const embedId = url.searchParams.get('id');
  
  if (!embedId) {
    return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch YourUpload embed page
    const embedUrl = `https://www.yourupload.com/embed/${embedId}`;
    const embedRes = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const embedHtml = await embedRes.text();
    
    // Extract MP4 URL
    const fileMatch = embedHtml.match(/file\s*:\s*['"]([^'"]+\.mp4[^'"]*)['"]/i);
    
    if (!fileMatch || fileMatch[1].includes('novideo')) {
      return new Response(JSON.stringify({ error: 'Video not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const videoUrl = fileMatch[1];
    
    // Build headers for video request
    const fetchHeaders = {
      'Referer': 'https://www.yourupload.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Origin': 'https://www.yourupload.com',
    };
    
    // Pass Range header for streaming
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    // Fetch video with proper headers
    const videoRes = await fetch(videoUrl, {
      method: request.method,
      headers: fetchHeaders,
    });

    const newHeaders = new Headers(videoRes.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
    newHeaders.delete('Content-Security-Policy');
    newHeaders.delete('X-Frame-Options');

    return new Response(videoRes.body, {
      status: videoRes.status,
      headers: newHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
