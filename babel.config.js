module.exports = function(api) {
  api.cache(false);
  return {
    plugins: [
      "lodash"  // transforms/strips unused lodash deps.
    ],
    presets: [
      [
        "@babel/preset-env",
        {
          useBuiltIns: "entry",
          targets: { chrome: "58", ie: "11" }
        }
      ]
    ]
  }
}