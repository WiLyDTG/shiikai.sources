Cloud Run

- Build & push (using Cloud Build):

```bash
# from repository root
gcloud builds submit --tag gcr.io/PROJECT_ID/shiikai-hls ./hls-server
gcloud run deploy shiikai-hls --image gcr.io/PROJECT_ID/shiikai-hls \
  --platform managed --region us-central1 --allow-unauthenticated \
  --memory=2Gi --cpu=1 --concurrency=1
```

- Notes:
  - Replace `PROJECT_ID` with your GCP project. Increase `--memory`/`--cpu` for better ffmpeg performance.
  - Cloud Run provides ephemeral storage (default 2GB). If you need more storage or persistent segments, push to an object store (S3/GCS) and serve via CDN.

Fly.io

- Build & deploy with `flyctl` (recommended for simple VMs):

```bash
cd hls-server
flyctl launch --name shiikai-hls --region ord
# When prompted, select Dockerfile, no persistent volume needed for short-lived HLS
flyctl deploy
```

- Tips:
  - Use machines with more CPU for ffmpeg (e.g., flyctl scale vm shared-cpu-2).
  - If segments must persist between restarts, attach a volume and update `server.js` to write to it.

General recommendations

- Use a domain and HTTPS; update `animeflv.js` PROXY/HLS endpoints to point to the deployed domain.
- Monitor CPU and scale horizontally; consider pre-warming ffmpeg or keeping short-lived instances for low latency.
- For production, prefer storing generated segments in an object store and serve static files via CDN.
