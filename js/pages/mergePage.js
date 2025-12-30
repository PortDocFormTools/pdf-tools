import { mergePdf } from "../services/pdfService.js";

/* === SVG icons === */
const icons = {
    up: `
    <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M12 5l-7 7h4v7h6v-7h4l-7-7z" fill="currentColor"/>
    </svg>`,
    down: `
    <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M12 19l7-7h-4V5h-6v7H5l7 7z" fill="currentColor"/>
    </svg>`,
    remove: `
    <svg width="16" height="16" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"/>
    </svg>`
};

const fileInput = document.getElementById("files");
const dropZone = document.getElementById("dropZone");
const filesList = document.getElementById("filesList");
const mergeBtn = document.getElementById("mergeBtn");

let selectedFiles = [];

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
    addFiles(e.dataTransfer.files);
});

fileInput.addEventListener("change", () => {
    addFiles(fileInput.files);
});

/* === Add files === */
function addFiles(files) {
    for (let file of files) {
        if (file.type === "application/pdf") {
            selectedFiles.push(file);
        }
    }
    renderFiles();
}

/* === Render list === */
function renderFiles() {
    filesList.innerHTML = "";

    selectedFiles.forEach((file, index) => {
        const item = document.createElement("div");
        item.className = "file-card";

        item.innerHTML = `
            <div class="file-icon">📄</div>

            <div class="file-info">
                <strong>${file.name}</strong>
                <span>${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>

            <div class="file-actions">
                <button data-action="up">${icons.up}</button>
                <button data-action="down">${icons.down}</button>
                <button data-action="remove">${icons.remove}</button>
            </div>
        `;

        item.querySelector('[data-action="up"]').onclick = () => moveUp(index);
        item.querySelector('[data-action="down"]').onclick = () => moveDown(index);
        item.querySelector('[data-action="remove"]').onclick = () => removeFile(index);

        filesList.appendChild(item);
    });
}

/* === Reorder === */
function moveUp(index) {
    if (index === 0) return;
    [selectedFiles[index - 1], selectedFiles[index]] =
    [selectedFiles[index], selectedFiles[index - 1]];
    renderFiles();
}

function moveDown(index) {
    if (index === selectedFiles.length - 1) return;
    [selectedFiles[index + 1], selectedFiles[index]] =
    [selectedFiles[index], selectedFiles[index + 1]];
    renderFiles();
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderFiles();
}

/* === Merge === */
mergeBtn.onclick = async () => {
    if (selectedFiles.length < 2) {
        return alert("Please select at least two PDF files.");
    }

    mergeBtn.innerText = "Merging...";
    mergeBtn.disabled = true;

    try {
        const result = await mergePdf(selectedFiles);

        if (result.ok) {
            const bytes = atob(result.pdfBase64);
            const buffer = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) {
                buffer[i] = bytes.charCodeAt(i);
            }

            const blob = new Blob([buffer], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            document.getElementById("downloadLink").href = url;
            document.getElementById("downloadLink").download = result.originalName;
            document.getElementById("previewFrame").src = url;
            document.getElementById("resultContainer").style.display = "block";
        } else {
            alert("Error: " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Server error occurred.");
    } finally {
        mergeBtn.innerText = "Merge PDFs";
        mergeBtn.disabled = false;
    }
};
