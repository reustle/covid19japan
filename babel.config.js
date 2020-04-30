module.exports = function (api) {
  api.cache(false);
  return {
    plugins: ["date-fns"],
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
