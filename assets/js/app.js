import { renderPDFPages } from "./pdf-renderer.js";
import { initFlipbook } from "./flipbook.js";

const CONFIG = {
    pdfPath: "assets/pdf/catalogo-2026.pdf",
    scale: 2,
    flippingTime: 600,
    mobileScrollSupport: true
};

async function init() {
    try {
        console.log("INIT ejecutado");

        const container = document.getElementById("book");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const pageCounter = document.getElementById("pageCounter");

        if (!container) {
            throw new Error("No se encontró el elemento #book");
        }

        /* =========================
           LOADING
        ========================= */
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <span>Cargando Catálogo...</span>
            </div>
        `;

        /* =========================
           1. RENDER PDF
        ========================= */
        const pdfData = await renderPDFPages(CONFIG.pdfPath, CONFIG.scale);

        const { pages, width, height, ratio } = pdfData;

        console.log("PDF renderizado:", {
            pages: pages.length,
            width,
            height,
            ratio
        });

        if (!pages || pages.length === 0) {
            throw new Error("No se pudieron generar páginas del PDF");
        }

        const isMobile = window.innerWidth < 900;

        const flipbook = initFlipbook(container, pages, {
            ...CONFIG,
            width,
            height,
            maintainRatio: true,
            pageRatio: ratio,
            size: "fixed",
            usePortrait: isMobile,
            showCover: true   // 👈 ESTA es la clave
        });


        const pageFlip = flipbook.instance;

        console.log("Flipbook inicializado", pageFlip);

        /* =========================
           3. CONTROLES
        ========================= */
        if (prevBtn && nextBtn && pageCounter) {
            setupNavigation(pageFlip, pages.length, prevBtn, nextBtn, pageCounter);
        }

        /* =========================
           4. RESIZE
        ========================= */
        const resizeHandler = () => {
            console.log("Redimensionando flipbook...");
            flipbook.updateSize();
        };

        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeHandler, 250);
        });

        setTimeout(() => {
            flipbook.updateSize();
        }, 300);

        /* =========================
           DEBUG
        ========================= */
        window.flipbookApp = {
            pageFlip,
            flipbook,
            pdfData,
            goToPage: (pageNum) => {
                if (pageFlip && pageNum >= 1 && pageNum <= pages.length) {
                    pageFlip.flip(pageNum - 1);
                }
            },
            getCurrentPage: () =>
                pageFlip ? pageFlip.getCurrentPageIndex() + 1 : 1
        };

        console.log("Aplicación inicializada correctamente");

    } catch (error) {
        console.error("ERROR DETECTADO:", error);
        showError(error.message);
    }
}

/* =========================
   NAVEGACIÓN
========================= */
function setupNavigation(pageFlip, totalPages, prevBtn, nextBtn, pageCounter) {
    if (!pageFlip) return;

    const updatePageCounter = () => {
        const currentPage = pageFlip.getCurrentPageIndex() + 1;
        pageCounter.textContent = `Página ${currentPage} de ${totalPages}`;

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    };

    prevBtn.addEventListener("click", () => {
        if (!prevBtn.disabled) pageFlip.flipPrev();
    });

    nextBtn.addEventListener("click", () => {
        if (!nextBtn.disabled) pageFlip.flipNext();
    });

    document.addEventListener("keydown", (e) => {
        if (!pageFlip) return;

        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                pageFlip.flipPrev();
                break;
            case "ArrowRight":
                e.preventDefault();
                pageFlip.flipNext();
                break;
            case "Home":
                e.preventDefault();
                pageFlip.flip(0);
                break;
            case "End":
                e.preventDefault();
                pageFlip.flip(totalPages - 1);
                break;
        }
    });

    pageFlip.on("flip", updatePageCounter);
    pageFlip.on("changeState", updatePageCounter);

    updatePageCounter();
}

/* =========================
   ERROR UI
========================= */
function showError(message) {
    const container = document.getElementById("book");
    if (!container) return;

    container.innerHTML = `
        <div style="
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:100%;
            color:#ff6b6b;
            text-align:center;
            padding:20px;">
            <h3>⚠️ Error al cargar el flipbook</h3>
            <p style="color:#ccc;margin:15px 0;">${message}</p>
            <button onclick="location.reload()"
                style="
                    background:#FFD700;
                    color:#000;
                    border:none;
                    padding:10px 25px;
                    border-radius:5px;
                    cursor:pointer;
                    font-weight:bold;">
                Reintentar
            </button>
        </div>
    `;
}

/* =========================
   INIT
========================= */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

console.log("app.js cargado correctamente");
