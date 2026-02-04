import { renderPDFPages } from "./pdf-renderer.js";
import { initFlipbook } from "./flipbook.js";

const CONFIG = {
  pdfPath: "assets/pdf/catalogo-ejemplo.pdf",
  scale: 1
};

async function init() {

  try {

    console.log("INIT ejecutado");

    const container = document.getElementById("book");

    const pages = await renderPDFPages(CONFIG.pdfPath, CONFIG.scale);

    console.log("Páginas generadas:", pages.length);

    const pageFlip = initFlipbook(container, pages, CONFIG);

    console.log("DESPUÉS de initFlipbook");

  } catch (error) {
    console.error("ERROR DETECTADO:", error);
  }
}

init();
