Resumen de cambios y próximos pasos

- Bumped plugin version: `sources/animeflv/animeflv.json` -> `31.0.0`.
- Añadido endpoint HLS y proxy en `functions/` (Cloudflare Pages) — `/proxy`, `/yourupload`, `/hls`.
- Scaffolded `hls-server/` (Docker + `server.js`) para transmux on-demand usando `ffmpeg`.
- Añadidas instrucciones de despliegue en `hls-server/DEPLOY.md` (Cloud Run y Fly.io).

Pruebas realizadas

- HEAD y Range a través del proxy: `200` para HEAD, `206` para requests con `Range`.
- `/hls` genera playlists m3u8 que apuntan al proxy `/yourupload` como fuente.

Siguientes pasos recomendados

1. Desplegar `hls-server` en Cloud Run o Fly.io usando `hls-server/Dockerfile`.
2. Probar `GET /create?url=` con una URL MP4 válida para generar un `playlist.m3u8` pública.
3. Actualizar `sources/animeflv/animeflv.js` si quieres que apunte al dominio público del HLS (reemplazar `https://shiikai-sources.pages.dev/hls...`).
4. Verificar reproducción en Mojuru; si falla, comprobar logs del HLS server y CORS.

Si quieres, despliego el servicio (si me das acceso o eliges el host) y actualizo `animeflv.js` automáticamente.
