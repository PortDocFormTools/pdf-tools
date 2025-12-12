require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib'); // Библиотека для редактирования
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Отдаем статические файлы (html, css, js)
app.use(express.static(__dirname));
app.use(express.json());
// Отключаем блокировку скриптов (CSP), чтобы работали инлайновые скрипты
app.use(helmet({ contentSecurityPolicy: false }));

// 2. Настройка загрузки (в память)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Хелпер для кодировки имени файла
const fixUtf8 = (str) => Buffer.from(str, 'latin1').toString('utf8');

// === АГРЕССИВНОЕ СЖАТИЕ (Исправленное) ===
app.post('/api/compress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Нет файла' });
        
        // 1. Считаем размер исходника (строго из буфера)
        const sizeBefore = req.file.buffer.length;
        
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const newPdf = await PDFDocument.create();
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => newPdf.addPage(page));

        // Чистим метаданные
        newPdf.setTitle('');
        newPdf.setAuthor('');
        newPdf.setCreator('');
        newPdf.setProducer('');

        const compressedBytes = await newPdf.save({ useObjectStreams: true });
        
        // 2. Считаем размер результата
        const sizeAfter = compressedBytes.length;
        const pdfBase64 = Buffer.from(compressedBytes).toString('base64');

        res.json({ 
            ok: true, 
            originalName: fixUtf8(req.file.originalname), 
            pdfBase64,
            originalSize: sizeBefore, // Явно отправляем размер ДО
            newSize: sizeAfter        // Явно отправляем размер ПОСЛЕ
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// === ЛОГИКА СЛИЯНИЯ (MERGE) ===
app.post('/api/merge', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'Нужно минимум 2 файла' });

        const mergedPdf = await PDFDocument.create();

        for (const file of req.files) {
            const pdf = await PDFDocument.load(file.buffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        res.json({ ok: true, originalName: "merged.pdf", pdfBase64 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// === ЛОГИКА РАЗДЕЛЕНИЯ (SPLIT) ===
app.post('/api/split', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Нет файла' });
        
        const start = parseInt(req.body.start);
        const end = parseInt(req.body.end);
        
        if (!start || !end) return res.status(400).json({ error: 'Укажите страницы' });

        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const totalPages = pdfDoc.getPageCount();

        if (start < 1 || end > totalPages || start > end) {
            return res.status(400).json({ error: `Неверный диапазон (всего страниц: ${totalPages})` });
        }

        const newPdf = await PDFDocument.create();
        const range = [];
        for (let i = start - 1; i < end; i++) range.push(i);

        const copiedPages = await newPdf.copyPages(pdfDoc, range);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
        
        res.json({ 
            ok: true, 
            originalName: `split_${start}-${end}_${fixUtf8(req.file.originalname)}`, 
            pdfBase64 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Маршрутизация HTML файлов
app.get('/compress', (req, res) => res.sendFile(path.join(__dirname, 'compress.html')));
app.get('/merge', (req, res) => res.sendFile(path.join(__dirname, 'merge.html')));
app.get('/split', (req, res) => res.sendFile(path.join(__dirname, 'split.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));