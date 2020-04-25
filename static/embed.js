/**
 * Embed covid19japan.com into your web app
 */

const element = document.getElementById("covid19japan-embed");
const style = `
    border: 0;
    width: 100%;
    height: 100%;
`;
const src =
  window.location.hostname === "localhost"
    ? "http://localhost:4000/embed"
    : "https://covid19japan.com/embed";

element.innerHTML = `<iframe src="${src}" style="${style}" />`;
