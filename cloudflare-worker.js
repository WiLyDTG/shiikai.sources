// Cloudflare Worker - Video Proxy con Headers
// Despliega esto en workers.cloudflare.com

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // CORS headers para permitir acceso desde apps
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get video URL from query param
    const videoUrl = url.searchParams.get('url');
    const referer = url.searchParams.get('referer') || 'https://www.yourupload.com/';

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      // Fetch video with proper headers
      const videoResponse = await fetch(videoUrl, {
        headers: {
          'Referer': referer,
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Range': request.headers.get('Range') || '',
        },
        cf: {
          cacheTtl: 0,
          cacheEverything: false,
        }
      });

      // Clone response with CORS headers
      const newHeaders = new Headers(videoResponse.headers);
      Object.keys(corsHeaders).forEach(key => {
        newHeaders.set(key, corsHeaders[key]);
      });

      return new Response(videoResponse.body, {
        status: videoResponse.status,
        statusText: videoResponse.statusText,
        headers: newHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
