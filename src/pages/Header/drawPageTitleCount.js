import { PAGE_TITLE } from "../../data/constants";

export const drawPageTitleCount = (confirmed) => {
  // Update the number of confirmed cases in the title

  document.title = `(${confirmed}) ${PAGE_TITLE}`;
};
