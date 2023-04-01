module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: ['plugin:prettier/recommended', 'xo'],
	overrides: [
		{
			extends: ['xo-typescript'],
			files: ['*.ts', '*.tsx'],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {},
};
