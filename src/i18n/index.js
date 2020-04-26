// Add new languages and their emoji flag here. Make sure the array indices line up.
export const LANGUAGES = ["en", "ja"];
export const FLAGS = ["🇺🇸", "🇯🇵"];

const generateExport = () => {
  const resources = {};
  for (const language of LANGUAGES) {
    resources[language] = {
      translation: require(`./${language}.json`),
    };
  }
  return resources;
};

export default generateExport();
