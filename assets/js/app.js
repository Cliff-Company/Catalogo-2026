import { renderPDFPages } from "./pdf-renderer.js";
import { initFlipbook } from "./flipbook.js";

const CONFIG = {
    pdfPath: "assets/pdf/catalogo-ejemplo.pdf",
    scale: 1,
    // Agregar configuraciones para el flipbook
    flippingTime: 600,
    mobileScrollSupport: true,
    minWidth: 280,
    maxWidth: 1400,
    minHeight: 400,
    maxHeight: 1000
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

        // Mostrar loading
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <span>Cargando PDF...</span>
            </div>
        `;

        // 1. Renderizar páginas del PDF
        const pages = await renderPDFPages(CONFIG.pdfPath, CONFIG.scale);
        console.log("Páginas generadas:", pages.length);

        if (pages.length === 0) {
            throw new Error("No se pudieron generar páginas del PDF");
        }

        // 2. Inicializar flipbook (ASÍ ES COMO DEBES LLAMARLO)
        const flipbook = initFlipbook(container, pages, CONFIG);
        
        // flipbook ahora es un objeto con { instance, updateSize, destroy }
        const pageFlip = flipbook.instance;
        
        console.log("Flipbook inicializado:", pageFlip);

        // 3. Configurar controles de navegación
        if (prevBtn && nextBtn && pageCounter) {
            setupNavigation(pageFlip, pages.length, prevBtn, nextBtn, pageCounter);
        }

        // 4. Configurar redimensionamiento CORRECTO
        const resizeHandler = () => {
            console.log("Redimensionando...");
            // Usar updateSize del objeto flipbook
            flipbook.updateSize();
        };

        // Usar debounce para evitar muchas llamadas
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeHandler, 250);
        });

        // 5. Forzar un primer redimensionamiento después de un delay
        setTimeout(() => {
            flipbook.updateSize();
        }, 500);

        console.log("Aplicación inicializada correctamente");

        // 6. Exponer para debug
        window.flipbookApp = {
            pageFlip,
            flipbook,
            pages,
            goToPage: (pageNum) => {
                if (pageFlip && pageNum >= 1 && pageNum <= pages.length) {
                    pageFlip.flip(pageNum - 1);
                }
            },
            getCurrentPage: () => pageFlip ? pageFlip.getCurrentPageIndex() + 1 : 1
        };

    } catch (error) {
        console.error("ERROR DETECTADO:", error);
        showError(error.message);
    }
}

// Función para configurar navegación
function setupNavigation(pageFlip, totalPages, prevBtn, nextBtn, pageCounter) {
    if (!pageFlip) return;

    // Actualizar contador
    const updatePageCounter = () => {
        const currentPage = pageFlip.getCurrentPageIndex() + 1;
        pageCounter.textContent = `Página ${currentPage} de ${totalPages}`;
        
        // Actualizar estado de botones
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
    };

    // Event listeners para botones
    prevBtn.addEventListener("click", () => {
        if (!prevBtn.disabled) {
            pageFlip.flipPrev();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (!nextBtn.disabled) {
            pageFlip.flipNext();
        }
    });

    // Navegación con teclado
    document.addEventListener("keydown", (e) => {
        if (!pageFlip) return;
        
        switch(e.key) {
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

    // Escuchar eventos del flipbook
    pageFlip.on("flip", updatePageCounter);
    pageFlip.on("changeState", updatePageCounter);

    // Inicializar contador
    updatePageCounter();
}

// Función para mostrar errores
function showError(message) {
    const container = document.getElementById("book");
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-container" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #ff6b6b;
            text-align: center;
            padding: 20px;
        ">
            <h3 style="margin-bottom: 15px;">⚠️ Error al cargar el flipbook</h3>
            <p style="margin-bottom: 20px; color: #ccc;">${message}</p>
            <button onclick="location.reload()" style="
                background: #FFD700;
                color: #000;
                border: none;
                padding: 10px 25px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">
                Reintentar
            </button>
        </div>
    `;
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Opcional: para depuración
console.log("app.js cargado");