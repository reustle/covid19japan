import i18next from "i18next";
import tippy from "tippy.js";

export const updateTooltipLang = (tippyInstances) => {
  console.log("tippyInstances", tippyInstances);
  // Destroy current tooltips
  if (Array.isArray(tippyInstances)) {
    tippyInstances.forEach((instance) => instance.destroy());
  }

  // Set tooltip content to current language
  document.querySelectorAll(`[data-tippy-i18n]`).forEach((node) => {
    const i18nKey = node.getAttribute("data-tippy-i18n");
    const dataTippyContent = i18next.t(i18nKey);
    node.setAttribute("data-tippy-content", dataTippyContent);
  });

  // Activate tooltips
  tippyInstances = tippy("[data-tippy-content]");
  return tippyInstances;
};
