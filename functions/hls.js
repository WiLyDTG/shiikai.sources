export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('yourupload_id');
  const video = url.searchParams.get('url');

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  if (!id && !video) {
    return new Response('Missing yourupload_id or url', { status: 400 });
  }

  // Build the target URL for segments
  let segmentUrl;
  if (id) {
    // Point to existing yourupload endpoint which supports Range
    segmentUrl = `${new URL(request.url).origin}/yourupload?id=${encodeURIComponent(id)}`;
  } else {
    // Direct url: point to proxy that supports Range
    segmentUrl = `${new URL(request.url).origin}/proxy?url=${encodeURIComponent(video)}`;
  }

  // Build a minimal HLS playlist with a single segment referencing the MP4 (fMP4/hybrid)
  const playlist = `#EXTM3U\n#EXT-X-VERSION:7\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10.0,\n${segmentUrl}\n#EXT-X-ENDLIST\n`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Expose-Headers', 'Content-Length');

  return new Response(playlist, { status: 200, headers });
}
