import { PAGE_TITLE } from "../../data/constants";

const drawPageTitleCount = (confirmed) => {
  // Update the number of confirmed cases in the title

  document.title = `(${confirmed}) ${PAGE_TITLE}`;
};

export default drawPageTitleCount;
