export const LANGUAGES = ["en", "ja"];

const generateExport = () => {
  let resources = {};
  for (let language of LANGUAGES) {
    resources[language] = {
      translation: require(`./${language}.json`),
    };
  }
  return resources;
};

export default generateExport();
