module.exports = function (api) {
  api.cache(false);
  return {
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
