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
