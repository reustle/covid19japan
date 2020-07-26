import React from "react";
import { bool } from "prop-types";

const Loader = ({ isLoaded }) => {
  if (!isLoaded) return null;

  return (
    <div className="loader">
      <div className="lds-dual-ring"></div>
    </div>
  );
};

Loader.propTypes = {
  isLoaded: bool.isRequired,
};

export default Loader;
