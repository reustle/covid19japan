const toggleLangPicker = (lang) => {
  // Toggle the lang picker
  if (document.querySelectorAll("a[data-lang-picker]")) {
    document.querySelectorAll("a[data-lang-picker]").forEach((el) => {
      el.className = "";
    });

    const currentLangPicker = document.querySelector(
      `a[data-lang-picker=${lang}]`
    );
    if (currentLangPicker) {
      currentLangPicker.className = "active";
    }
  }
};

export default toggleLangPicker;
