const grid = document.getElementById("grid");
const count = document.getElementById("count");
const empty = document.getElementById("empty");
const loadError = document.getElementById("loadError");

const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
}[char]));

function validLink(item) {
    if (!item || typeof item !== "object") return false;
    if (typeof item.name !== "string" || !item.name.trim()) return false;
    if (typeof item.url !== "string") return false;

    try {
        const url = new URL(item.url);
        return ["http:", "https:"].includes(url.protocol);
    } catch {
        return false;
    }
}

function render(links) {
    const safeLinks = links.filter(validLink);
    count.textContent = safeLinks.length;

    grid.innerHTML = safeLinks.map(item => {
        const name = escapeHTML(item.name.trim());
        const description = escapeHTML(item.description || item.url);
        const icon = escapeHTML(item.icon || item.name.trim().charAt(0).toUpperCase() || "↗");
        const url = escapeHTML(new URL(item.url).href);

        return `
            <article class="card">
                <div class="card-top">
                    <div class="site-icon">${icon}</div>
                    <span class="external-mark" aria-hidden="true">↗</span>
                </div>
                <h3 class="card-title">${name}</h3>
                <p class="card-desc">${description}</p>
                <div class="card-bottom">
                    <span class="tag">DESTINO</span>
                    <a class="open" href="${url}" target="_blank" rel="noopener noreferrer">
                        ABRIR DESTINO ↗
                    </a>
                </div>
            </article>
        `;
    }).join("");

    empty.hidden = safeLinks.length !== 0;
}

async function loadLinks() {
    try {
        const response = await fetch("links.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const links = await response.json();
        if (!Array.isArray(links)) throw new Error("El archivo debe contener una lista JSON.");

        render(links);
    } catch (error) {
        console.error("Error al cargar links.json:", error);
        grid.innerHTML = "";
        count.textContent = "0";
        empty.hidden = true;
        loadError.hidden = false;
    }
}

loadLinks();
