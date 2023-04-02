module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: ['xo', 'plugin:prettier/recommended'],
	overrides: [
		{
			extends: ['xo-typescript'],
			files: ['*.ts', '*.tsx'],
			rules: {
				'@typescript-eslint/indent': 'off',
				'@typescript-eslint/object-curly-spacing': 'off',
				'@typescript-eslint/naming-convention': [
					'error',
					{
						selector: ['property'],
						format: ['strictCamelCase'],
						filter: {
							// You can expand this regex to add more allowed names
							regex: '^(strictSSL|Authorization)$',
							match: false,
						},
					},
				],
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {},
};
