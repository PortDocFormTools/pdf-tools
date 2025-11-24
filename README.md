# PDF backend (minimal)

Routes:
- POST /api/upload
  - form field name: file
  - returns JSON: { ok, originalName, storedName, pages, fileUrl, textSnippet }

- GET /api/files/:storedName
  - serves uploaded PDF as inline

Run locally:
1. Copy .env.example -> .env and edit if needed (порт 5000)
2. npm install
3. npm run dev   # requires nodemon
   or
   npm start

Test with curl:
curl -F "file=@/path/to/test.pdf" http://localhost:5000/api/upload

# Frontend (initial setup)

The directory contains the client-side part of the project. It provides the initial UI structure for interacting with PDF tools and is designed to be expanded as backend features grow.

- frontend/
  - index.html — Main landing page
  - css/
    - style.css — Global styles
  - js/
    - main.js — Component loader and basic scripts
  - components/
    - header.html — Header component
    - tool-card.html — Template for PDF tool cards
    - footer.html — Footer component
  - pages/
    - compress.html — Placeholder for PDF compression tool
    - merge.html — Placeholder for PDF merging tool
    - split.html — Placeholder for PDF splitting tool
  - img/ — Static assets
