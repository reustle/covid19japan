/**
 * Embed covid19japan.com into your web app
 */

const element = document.getElementById("covid19japan-embed");
const style = `
    border: 0;
    width: 100%;
    height: 100%;
`;

element.innerHTML = `<iframe src="https://covid19japan.com/embed" style="${style}" />`;
