# GDGTASK - Design Canvas SPA

A single-page design canvas application inspired by lightweight visual editors.

## Features
- Central editable canvas area with clear visual boundary.
- Add elements: rectangle, text block, image placeholder.
- Select elements with highlighted border and resize handles.
- Drag to move selected elements.
- Resize from 4 corner handles with real-time updates.
- Layer management panel showing stacking order.
- Deletion via button and keyboard (`Delete` / `Backspace`).
- Duplicate selected element via `Ctrl/Cmd + D`.
- Properties panel for precise X/Y/W/H edits.

## Run locally
```bash
python3 -m http.server 4173
```
Then open: `http://localhost:4173`

## Deployment (Vercel or Netlify)
This app is fully static (`index.html`, `styles.css`, `app.js`) and can be deployed directly.

### Vercel
1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Framework preset: **Other**.
4. Build command: *(leave empty)*
5. Output directory: `.`

### Netlify
1. Push this repository to GitHub.
2. Import in Netlify.
3. Build command: *(leave empty)*
4. Publish directory: `.`

> Note: Deployment link depends on your Vercel/Netlify account connection.
