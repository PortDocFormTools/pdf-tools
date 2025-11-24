require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || `http://localhost:${PORT}`;

app.use('/api/', rateLimit({ windowMs: 60_000, max: 60 }));

// Multer memoryStorage - файли тільки в пам'яті
const storage = multer.memoryStorage();
const MAX_BYTES = parseInt(process.env.MAX_FILE_BYTES || String(50 * 1024 * 1024), 10);

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// POST /api/upload - завантаження PDF
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const info = await pdf(req.file.buffer);
    const pages = info.numpages || null;
    const textSnippet = (info.text || '').slice(0, 1000);

    // Перетворюємо PDF в base64, щоб фронтенд міг створити blob URL
    const pdfBase64 = req.file.buffer.toString('base64');

    return res.json({
      ok: true,
      originalName: req.file.originalname,
      pages,
      textSnippet,
      pdfBase64
    });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

// Запуск сервера
app.listen(PORT, () => console.log(`PDF backend listening on ${HOST}`));
