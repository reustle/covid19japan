/**
 * Embed covid19japan.com into your web app
 */

// configure embed
const element = document.getElementById("covid19japan-embed");
const style = `
    border: 0;
    width: 100%;
    height: 100%;
`;
const src =
  window.location.hostname === "" || window.location.hostname === "localhost"
    ? "http://localhost:4000/"
    : "https://covid19japan.com/embed";

// populate embed html
element.innerHTML = `<iframe id="covid19japan-iframe" src="${src}" style="${style}" />`;

// listen for resize
window.addEventListener(
  "message",
  function (e) {
    let frame = document.getElementById("covid19japan-iframe");
    let message = e.data[0];
    let data = e.data[1];
    switch (message) {
      case "setHeight":
        frame.height(data);
        break;
    }
  },
  false
);
