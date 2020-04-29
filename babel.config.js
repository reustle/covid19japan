module.exports = function (api) {
  api.cache(false);
  return {
    plugins: [
      "lodash", // transforms/strips unused lodash deps.
      "date-fns",
    ],
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          targets: { chrome: "58", ie: "11" },
        },
      ],
    ],
  };
};
