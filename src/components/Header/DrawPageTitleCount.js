import { PAGE_TITLE } from "../../data/constants";

const drawPageTitleCount = (confirmed, lang) => {
  // Update the number of confirmed cases in the title
  const formatNumber = new Intl.NumberFormat(lang).format;
  document.title = `(${formatNumber(confirmed)}) ${PAGE_TITLE}`;
};

export default drawPageTitleCount;
