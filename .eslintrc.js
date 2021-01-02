module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    mongo: true,
  },
  extends: "prettier",
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    quotes: [2, "backtick"],
  },
};
