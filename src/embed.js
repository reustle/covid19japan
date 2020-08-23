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
const src = "https://covid19japan.com/embed";

// populate embed html
element.innerHTML = `<iframe id="covid19japan-iframe" src="${src}" style="${style}" />`;

// listen for resize
window.addEventListener(
  "message",
  function (e) {
    const frame = document.getElementById("covid19japan-iframe");
    const message = e.data;
    switch (message.name) {
      case "setHeight":
        frame.style.height = message.payload;
        break;
    }
  },
  false
);
