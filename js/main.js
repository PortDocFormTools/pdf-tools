// Динамічне завантаження компонентів
async function loadComponent(id, path) {
    const el = document.getElementById(id);
    if (!el) return;

    const response = await fetch(path);
    el.innerHTML = await response.text();
}

// Завантаження карток інструментів
async function loadTools() {
    const container = document.getElementById("tools");
    if (!container) return;

    const cardTemplate = await fetch("/components/tool-card.html").then(res => res.text());

    const tools = [
        { title: "Compress PDF", link: "/pages/compress.html", testId: "compress" },
        { title: "Merge PDF", link: "/pages/merge.html", testId: "merge" },
        { title: "Split PDF", link: "/pages/split.html", testId: "split" }
    ];

    container.innerHTML = tools.map(t => {
        return cardTemplate
            .replace("{{title}}", t.title)
            .replace("{{link}}", t.link)
            .replace("{{testid}}", t.testId);
    }).join("");
}

// Інтеграція з backend API
async function uploadPDF(file) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: form
    });

    return await res.json();
}

loadComponent("header", "/components/header.html");
loadComponent("footer", "/components/footer.html");

loadTools();
