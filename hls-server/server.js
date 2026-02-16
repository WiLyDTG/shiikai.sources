const express = require('express');
const morgan = require('morgan');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(morgan('tiny'));

const WORK_DIR = '/tmp/hls';
if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });

// Serve static HLS directories
app.use('/hls', express.static(WORK_DIR, { index: false }));

// Create HLS from input URL
app.get('/create', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  const id = uuidv4();
  const dir = path.join(WORK_DIR, id);
  fs.mkdirSync(dir, { recursive: true });

  const playlist = path.join(dir, 'playlist.m3u8');
  const segPattern = path.join(dir, 'segment_%03d.ts');

  // Spawn ffmpeg to transmux to HLS
  // -c:v copy -c:a copy to avoid re-encoding when possible
  const args = [
    '-hide_banner',
    '-y',
    '-i', url,
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_list_size', '0',
    '-hls_segment_filename', segPattern,
    playlist
  ];

  const ff = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  ff.stderr.on('data', (chunk) => {
    // stream ffmpeg logs if needed
    // console.error(chunk.toString());
  });

  ff.on('close', (code) => {
    console.log('ffmpeg finished', id, code);
  });

  // Return the playlist URL immediately (segments will arrive shortly)
  const host = req.get('host');
  const proto = req.protocol;
  const playlistUrl = `${proto}://${host}/hls/${id}/playlist.m3u8`;
  res.json({ id, playlist: playlistUrl });
});

// Simple cleanup job
setInterval(() => {
  const files = fs.readdirSync(WORK_DIR);
  const now = Date.now();
  for (const f of files) {
    const p = path.join(WORK_DIR, f);
    try {
      const stat = fs.statSync(p);
      // remove dirs older than 30 minutes
      if (now - stat.mtimeMs > 1000 * 60 * 30) {
        fs.rmSync(p, { recursive: true, force: true });
        console.log('cleaned', p);
      }
    } catch (e) {}
  }
}, 1000 * 60 * 5);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('HLS server listening on', PORT));
