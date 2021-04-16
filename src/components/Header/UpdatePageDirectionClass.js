const updatePageDirectionClass = (direction) => {
  const bodyEl = document.querySelector("body");

  bodyEl.dataset.direction = direction;
};

export default updatePageDirectionClass;
