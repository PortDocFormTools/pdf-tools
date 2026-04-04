import { splitPdf } from "../services/pdfService.js";

const fileInput = document.getElementById("file");
const dropZone = document.getElementById("dropZone");
const filePreview = document.getElementById("filePreview");
const removeFileBtn = document.getElementById("removeFileBtn");
const splitBtn = document.getElementById("splitBtn");

/* === Drag & Drop === */
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

/* === File preview === */
fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;

    document.getElementById("fileName").textContent = file.name;
    document.getElementById("fileSize").textContent =
        (file.size / 1024 / 1024).toFixed(2) + " MB";

    filePreview.style.display = "flex";
};

/* === Remove file === */
removeFileBtn.onclick = () => {
    fileInput.value = "";
    filePreview.style.display = "none";

    document.getElementById("resultContainer").style.display = "none";
    document.getElementById("previewFrame").src = "";
    document.getElementById("downloadLink").href = "#";
};

/* === Split === */
splitBtn.onclick = async () => {
    const file = fileInput.files[0];
    const start = document.getElementById("from").value;
    const end = document.getElementById("to").value;

    if (!file) return alert("Please select a PDF file.");
    if (!start || !end) return alert("Please specify the page range.");

    splitBtn.innerText = "Splitting...";
    splitBtn.disabled = true;

    try {
        const result = await splitPdf(file, start, end);

        if (result.ok) {
            const url = `data:application/pdf;base64,${result.pdfBase64}`;

            const downloadLink = document.getElementById("downloadLink");
            downloadLink.href = url;
            downloadLink.download = result.originalName;

            document.getElementById("previewFrame").src = url;
            document.getElementById("resultContainer").style.display = "block";
        } else {
            alert("Error: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Server error occurred.");
    } finally {
        splitBtn.innerText = "Split PDF";
        splitBtn.disabled = false;
    }
};
