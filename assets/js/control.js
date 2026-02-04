export function initControls(pageFlip) {

  document.getElementById("prevBtn")
    .addEventListener("click", () => pageFlip.flipPrev());

  document.getElementById("nextBtn")
    .addEventListener("click", () => pageFlip.flipNext());
}
