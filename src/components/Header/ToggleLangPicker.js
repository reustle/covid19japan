export const toggleLangPicker = (lang) => {
  // Toggle the lang picker
  if (document.querySelectorAll("a[data-lang-picker]")) {
    document.querySelectorAll("a[data-lang-picker]").forEach((el) => {
      el.style.display = "inline";
    });

    const currentLangPicker = document.querySelector(
      `a[data-lang-picker=${lang}]`
    );
    if (currentLangPicker) {
      currentLangPicker.style.display = "none";
    }
  }
};
