/** Scroll the document to the top once per navigation. */
export function scrollStorefrontToTop(smooth: boolean): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: smooth ? "smooth" : "auto",
  });
}
