/**
 * PdfService
 * Service module for PDF operations.
 * This module encapsulates API calls and can be replaced with a mock
 * during unit testing.
 */

/**
 * compressPdf
 * Sends a PDF file to the server for compression.
 * @param {File} file - PDF file selected by the user
 * Test data:
 * - valid PDF file with small size (up to 1 MB)
 * - valid PDF file with large size (10+ MB)
 * - non-PDF file (error case)
 * - empty or undefined file (error case)
 */
export async function compressPdf(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/compress", {
        method: "POST",
        body: formData
    });

    return response.json();
}


/**
 * mergePdf
 * @param {File[]} files
 * Test data:
 * - array with 2 PDF files
 * - array with more than 5 PDF files
 * - empty array (error case)
 */
export async function mergePdf(files) {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    const response = await fetch("/api/merge", {
        method: "POST",
        body: formData
    });

    return response.json();
}

/**
 * splitPdf
 * @param {File} file
 * @param {number} start
 * @param {number} end
 * Test data:
 * - valid page range
 * - start > end
 * - page range out of bounds
 */
export async function splitPdf(file, start, end) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("start", start);
    formData.append("end", end);

    const response = await fetch("/api/split", {
        method: "POST",
        body: formData
    });

    return response.json();
}
