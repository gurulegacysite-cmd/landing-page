# Deploy — GURU Landing en Cloudflare Pages

Sitio **estático** (HTML/CSS/JS, sin dependencias) que se despliega desde GitHub a
**Cloudflare Pages**: gratis, uso comercial permitido, HTTPS automático y auto-deploy en
cada `git push`.

Repo: `github.com/gurulegacysite-cmd/landing-page` (branch `main`).

---

## Cómo se arma el deploy
`build.sh` copia solo los archivos publicables a `dist/` (deja fuera README, DEPLOY,
el prototipo `.dc.html` y `.htaccess`). Cloudflare publica `dist/`. `dist/` está en
`.gitignore` — es un artefacto, no se commitea.

Archivos que SÍ se publican: `index.html`, `404.html`, `styles.css`, `main.js`,
`robots.txt`, `sitemap.xml`, `_headers`, `assets/`.

- `_headers` → cabeceras de seguridad + cache de imágenes (equivalente al viejo `.htaccess`).
- `404.html` → Cloudflare lo sirve automáticamente en rutas inexistentes.
- HTTPS y redirección a HTTPS → automáticos, sin configuración.

---

## Conectar en Cloudflare (una sola vez)
1. Entra a **dash.cloudflare.com** → **Workers & Pages** → **Create** → pestaña **Pages**
   → **Connect to Git**.
2. Autoriza GitHub y elige el repo `landing-page`.
3. Configuración del build:
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** `bash build.sh`
   - **Build output directory:** `dist`
4. **Save and Deploy**. En ~1 min tendrás una URL tipo `landing-page.pages.dev`.

Desde aquí, cada `git push` a `main` redepliega solo. Cada rama/PR genera una preview URL.

---

## Después del primer deploy
1. **URL definitiva:** usa la `*.pages.dev` o añade un **dominio propio** gratis en
   Pages → **Custom domains** (Cloudflare gestiona el DNS y el SSL).
2. **Reemplaza el marcador de dominio** `TU-SITIO.hostingersite.com` por tu URL real en:
   `index.html` (canonical, og:url, og:image, twitter:image), `robots.txt`, `sitemap.xml`.
   Luego `git add -A && git commit && git push` → se publica solo.
3. **Formulario:** la Access Key de Web3Forms ya está puesta, así que entrega correos desde
   el primer deploy. Envía un mensaje de prueba para confirmar que llega.

---

## Checklist post-lanzamiento
- [ ] Carga la home: hero, animaciones y fuentes OK.
- [ ] Envía el formulario y confirma que llega el correo.
- [ ] Visita `/no-existe` → aparece el **404 con marca**.
- [ ] Candado HTTPS en el navegador.
- [ ] Móvil: sin scroll horizontal.
- [ ] Opcional: registra el sitio en Google Search Console y envía `sitemap.xml`.

---

## Flujo de trabajo diario
```bash
# editar archivos…
git add -A
git commit -m "descripción del cambio"
git push          # Cloudflare Pages redepliega en ~1 min
```

## Probar el build localmente
```bash
bash build.sh          # genera dist/
# sirve dist/ para revisarlo:
cd dist && python3 -m http.server 8000   # http://localhost:8000
```
