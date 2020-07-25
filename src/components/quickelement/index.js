export const el = (tag, klass, attributes, contents) => {
  const element = document.createElement(tag);
  if (attributes && attributes.className) {
    element.classList.add(attributes.className);
  }
  if (klass && typeof klass == "string") {
    element.classList.add(klass);
  }
  if (klass && typeof klass == "object" && klass.length > 0) {
    element.classList.add(...klass);
  }
  if (attributes) {
    for (let attrKey of Object.keys(attributes)) {
      if (attrKey == "className") {
        continue;
      }
      element.setAttribute(attrKey, attributes[attrKey]);
    }
  }
  if (!!contents) {
    if (typeof contents == "string") {
      let textNode = document.createElement("span");
      textNode.innerHTML = contents;
      element.appendChild(textNode);
    } else if (typeof contents == "object" && contents.length) {
      for (let child of contents) {
        if (child && typeof child == "object") {
          element.appendChild(child);
        }
      }
    }
  }
  return element;
};

export const td = (klass, attributes, contents) =>
  el("td", klass, attributes, contents);
export const tr = (klass, attributes, contents) =>
  el("tr", klass, attributes, contents);
export const div = (klass, attributes, contents) =>
  el("div", klass, attributes, contents);
export const span = (klass, attributes, contents) =>
  el("span", klass, attributes, contents);
export const img = (klass, attributes, contents) =>
  el("img", klass, attributes, contents);
