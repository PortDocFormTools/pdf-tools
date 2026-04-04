import { compressPdf } from "../services/pdfService.js";

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("file");
const filePreview = document.getElementById("filePreview");
const removeFileBtn = document.getElementById("removeFileBtn");
const uploadBtn = document.getElementById("uploadBtn");

/* Drag & Drop */
["dragenter", "dragover"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });
});

["dragleave", "drop"].forEach(evt => {
    dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
    });
});

dropZone.addEventListener("drop", e => {
    const files = e.dataTransfer.files;
    if (!files.length) return;
    fileInput.files = files;
    fileInput.dispatchEvent(new Event("change"));
});

/* Preview */
fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;

    document.getElementById("fileName").textContent = file.name;
    document.getElementById("fileSize").textContent =
        (file.size / 1024 / 1024).toFixed(2) + " MB";

    filePreview.style.display = "flex";
};

/* Remove */
removeFileBtn.onclick = () => {
    fileInput.value = "";
    filePreview.style.display = "none";
};

/* Compress */
uploadBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please select a PDF file.");

    uploadBtn.disabled = true;
    uploadBtn.innerText = "Compressing...";

    try {
        const result = await compressPdf(file);
        
        if (result.ok) {

            const bytes = atob(result.pdfBase64);
            const buffer = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) {
                buffer[i] = bytes.codePointAt(i);
            }

            const blob = new Blob([buffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            document.getElementById("previewFrame").src = url;

            const downloadLink = document.getElementById("downloadLink");
            downloadLink.href = url;
            downloadLink.download = result.originalName;

            document.getElementById("oldSize").innerText = result.originalSize;
            document.getElementById("newSize").innerText = result.newSize;

            document.getElementById("resultContainer").style.display = "block";
        } else {
            alert("Error: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Server error occurred.");
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerText = "Upload and Compress";
    }
};
