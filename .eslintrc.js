module.exports = {
	root: true,
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	env: {
		commonjs: true,
		es6: true,
		node: true,
		mongo: true,
	},
	extends: ["prettier", "plugin:@typescript-eslint/recommended"],
	parserOptions: {
		ecmaVersion: 2021,
	},
	rules: {
		quotes: [2, "double"],
	},
};
