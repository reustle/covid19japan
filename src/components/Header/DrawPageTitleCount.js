import { PAGE_TITLE } from "../../data/constants";
import { maybeIntlNumberFormat } from "../../i18n";

const drawPageTitleCount = (confirmed, lang) => {
  // Update the number of confirmed cases in the title
  const formatNumber = maybeIntlNumberFormat(lang);
  document.title = `(${formatNumber(confirmed)}) ${PAGE_TITLE}`;
};

export default drawPageTitleCount;
