import * as pdfjsLib from "../../vendor/pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "../../vendor/pdfjs/pdf.worker.mjs";

export async function renderPDFPages(pdfPath, scale = 1) {

  console.log("Render iniciando...");

  const pdf = await pdfjsLib.getDocument(pdfPath).promise;

  console.log("PDF cargado. Páginas:", pdf.numPages);

  const pages = [];

  let originalWidth = 0;
  let originalHeight = 0;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Guardamos dimensiones reales de la primera página
    if (pageNum === 1) {
      originalWidth = viewport.width;
      originalHeight = viewport.height;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const wrapper = document.createElement("div");
    wrapper.classList.add("page");
    wrapper.appendChild(canvas);

    pages.push(wrapper);
  }

  console.log("Render finalizado");

  return {
    pages,
    width: originalWidth,
    height: originalHeight,
    ratio: originalWidth / originalHeight
  };
}

