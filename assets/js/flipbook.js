export function initFlipbook(container, pages, config) {

  console.log("initFlipbook ejecutado");

  container.innerHTML = "";

  const pageFlip = new window.St.PageFlip(container, {
    width: 600,
    height: 800,
    size: "fixed",
    showCover: false,
    useMouseEvents: true,
    mobileScrollSupport: false,
    flippingTime: 800
  });

  pageFlip.loadFromHTML(pages);

  return pageFlip;
}
