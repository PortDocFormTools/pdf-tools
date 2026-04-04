import 'dotenv/config';
import express from 'express';
import multer, { memoryStorage } from 'multer';
import { PDFDocument } from 'pdf-lib'; // Library for PDF manipulation
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// 1. Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));
app.use(express.json());
// Disable script blocking (CSP) to allow inline scripts
app.use(helmet({ contentSecurityPolicy: false }));

// 2. Configure file upload (in-memory storage)
const upload = multer({
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper function for file name encoding
const fixUtf8 = (str) => Buffer.from(str, 'latin1').toString('utf8');

// === PDF Compression Logic (Optimized) ===
app.post('/api/compress', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        
        // 1. Calculate original file size (strictly from buffer)
        const sizeBefore = req.file.buffer.length;
        
        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const newPdf = await PDFDocument.create();
        
        const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => newPdf.addPage(page));

        // Clear metadata
        newPdf.setTitle('');
        newPdf.setAuthor('');
        newPdf.setCreator('');
        newPdf.setProducer('');

        const compressedBytes = await newPdf.save({ useObjectStreams: true });
        
        // 2. Calculate compressed file size
        const sizeAfter = compressedBytes.length;
        const pdfBase64 = Buffer.from(compressedBytes).toString('base64');

        res.json({ 
            ok: true, 
            originalName: fixUtf8(req.file.originalname), 
            pdfBase64,
            originalSize: sizeBefore, // Explicitly send original size
            newSize: sizeAfter        // Explicitly send compressed size
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// === PDF Merge Logic ===
app.post('/api/merge', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'At least 2 files required' });

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

// === PDF Split Logic ===
app.post('/api/split', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file provided' });
        
        const start = Number.parseInt(req.body.start);
        const end = Number.parseInt(req.body.end);
        
        if (!start || !end) return res.status(400).json({ error: 'Specify page range' });

        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const totalPages = pdfDoc.getPageCount();

        if (start < 1 || end > totalPages || start > end) {
            return res.status(400).json({ error: `Invalid range (total pages: ${totalPages})` });
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

// HTML file routing
app.get('/compress', (_, res) => res.sendFile(join(__dirname, 'compress.html')));
app.get('/merge', (_, res) => res.sendFile(join(__dirname, 'merge.html')));
app.get('/split', (_, res) => res.sendFile(join(__dirname, 'split.html')));
app.get('/', (_, res) => res.sendFile(join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));