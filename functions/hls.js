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

  // Try to determine the actual MP4 URL and size so we can produce byte-range segments
  try {
    let mp4Url = null;
    if (id) {
      // Fetch the YourUpload embed page and extract MP4 URL
      const embedUrl = `https://www.yourupload.com/embed/${encodeURIComponent(id)}`;
      const embedRes = await fetch(embedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const embedHtml = await embedRes.text();
        let fileMatch = embedHtml.match(/file\s*:\s*['"]([^'\"]+\.mp4[^'\"]*)['"]/i);
        if (!fileMatch) {
          fileMatch = embedHtml.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+\.mp4)["']/i);
        }
        if (!fileMatch) {
          fileMatch = embedHtml.match(/<meta[^>]+content=["']([^"']+\.mp4)["'][^>]*property=["']og:video["']/i);
        }
        if (fileMatch) mp4Url = fileMatch[1];
    } else if (video) {
      mp4Url = video;
    }

    let total = NaN;
    if (mp4Url) {
      // HEAD the real MP4 URL to get content-length; include Referer when fetching from YourUpload
      const head = await fetch(mp4Url, { method: 'HEAD', headers: { 'Referer': 'https://www.yourupload.com/' } });
      const lenHeader = head.headers.get('content-length');
      total = lenHeader ? parseInt(lenHeader, 10) : NaN;
    }

    if (!isNaN(total) && total > 0) {
      // Choose a reasonable segment byte size (approx 512KB)
      const segBytes = Math.max(256 * 1024, Math.min(1024 * 1024, Math.floor(total / 20)));
      const segments = [];
      let offset = 0;
      // Limit number of segments to avoid huge playlists; provide first 8 segments
      const maxSegments = 8;
      let count = 0;
      while (offset < total && count < maxSegments) {
        const remain = total - offset;
        const thisLen = Math.min(segBytes, remain);
        // Use EXTINF with an estimated duration (unknown, so set 10s)
        segments.push({ offset, length: thisLen, duration: 10 });
        offset += thisLen;
        count++;
      }

      // Build playlist using EXT-X-BYTERANGE for each segment pointing to the same resource
      let playlist = '#EXTM3U\n#EXT-X-VERSION:7\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n';
      for (const seg of segments) {
        playlist += `#EXTINF:${seg.duration.toFixed(3)},\n`;
        playlist += `#EXT-X-BYTERANGE:${seg.length}@${seg.offset}\n`;
        playlist += `${segmentUrl}\n`;
      }
      playlist += '#EXT-X-ENDLIST\n';

      const headers = new Headers();
      headers.set('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Expose-Headers', 'Content-Length');

      return new Response(playlist, { status: 200, headers });
    }
  } catch (e) {
    // fallthrough to simple playlist
  }

  // Fallback: Build a minimal HLS playlist with a single segment referencing the MP4 (some players may accept)
  const playlist = `#EXTM3U\n#EXT-X-VERSION:7\n#EXT-X-TARGETDURATION:10\n#EXT-X-MEDIA-SEQUENCE:0\n#EXTINF:10.0,\n${segmentUrl}\n#EXT-X-ENDLIST\n`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Expose-Headers', 'Content-Length');

  return new Response(playlist, { status: 200, headers });
}
