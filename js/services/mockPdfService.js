/**
 * MockPdfService
 * Mock implementation of PDF service for unit testing.
 * Does not perform real API calls.
 */

export async function compressPdf(file) {
    /**
     * Test data:
     * - valid PDF file
     * - empty file
     * - non-PDF file (error case)
     */
    return {
        ok: true,
        originalName: file?.name || "mock.pdf",
        originalSize: 1024 * 1024,
        newSize: 512 * 1024,
        pdfBase64: ""
    };
}

export async function mergePdf(files) {
    /**
     * Test data:
     * - array with 2 PDF files
     * - array with multiple PDF files
     * - empty array (error case)
     */
    return {
        ok: true,
        originalName: "merged_mock.pdf",
        pdfBase64: ""
    };
}

export async function splitPdf(file, start, end) {
    /**
     * Test data:
     * - valid page range
     * - start > end (error case)
     * - page range out of bounds
     */
    return {
        ok: true,
        originalName: "split_mock.pdf",
        pdfBase64: ""
    };
}
