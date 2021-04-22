import React, { useState, useEffect } from "react";
import Select from "react-select";
import { string } from "prop-types";

import { setLang } from "../../index";
import { languageOptions } from "../../data/constants";

const LanguagePicker = ({ lang }) => {
  const [currentLang, setCurrentLang] = useState(
    languageOptions.find((language) => language.value === lang)
  );

  const customStyles = {
    control: (styles) => ({ ...styles, width: "200px", cursor: "pointer" }),
    option: (styles) => ({ ...styles, cursor: "pointer" }),
  };

  useEffect(() => {
    setLang(currentLang.value);
  }, [currentLang]);

  return (
    <Select
      label="Single select"
      styles={customStyles}
      options={languageOptions}
      value={currentLang}
      onChange={setCurrentLang}
    />
  );
};

LanguagePicker.propTypes = {
  lang: string,
};

LanguagePicker.defaultProps = {
  lang: "en",
};

export default LanguagePicker;
