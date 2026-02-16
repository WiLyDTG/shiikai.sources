# HLS Server (ffmpeg-based)

This small service generates HLS (M3U8 + TS segments) from an input MP4/URL using ffmpeg.

Endpoints:
- `GET /create?url=ENCODED_MP4_URL` — starts ffmpeg to create HLS files, returns JSON `{ id, playlist }` where `playlist` is the m3u8 URL.
- Static HLS served at `/hls/<id>/playlist.m3u8` and segments.

Quick run (local):

```bash
# build
docker build -t shiikai-hls ./hls-server
# run
docker run -p 3000:3000 shiikai-hls
# create HLS
curl 'http://localhost:3000/create?url=https://vidcache.net:8161/a20260215Vj5BxK17e6w/video.mp4'
```

Deployment suggestions:
- Deploy to Cloud Run / Fly.io / Render as a Docker service. Ensure the instance has enough ephemeral storage and CPU for ffmpeg.
- Use an autoscaling plan; ffmpeg is CPU intensive.

Notes:
- This is an on-demand generator and keeps HLS output in `/tmp/hls/<id>` for 30 minutes before cleanup.
- If you want long-term hosting, adapt to store segments in S3-compatible storage and serve from CDN.
