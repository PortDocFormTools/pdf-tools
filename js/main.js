// Динамічне завантаження компонентів
async function loadComponent(id, file) {
    const html = await fetch(`/components/${file}`).then(res => res.text());
    document.getElementById(id).innerHTML = html;
}

loadComponent("header", "header.html");
loadComponent("footer", "footer.html");

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

loadTools();

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
