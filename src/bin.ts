#!/usr/bin/env node

import { writeFile } from 'fs/promises';
import { Version3Client } from 'jira.js';
import { Command } from '@commander-js/extra-typings';
import path from 'path';
import { createTestFromIssue } from './issue';
import { type Issue } from 'jira.js/out/version3/models';
import { createTestPlanFromIssue } from './test-plan';

const program = new Command()
	.version('1.0.0')
	.description('Generate test files from Jira issue keys')
	.argument('<key>', 'Jira key')
	.option('-o, --output <value>', 'Where to write the output')
	.option('-h, --host [value]', 'Jira host [possible to setup using file]')
	.option(
		'--test-plan-label [value]',
		'Jira host [possible to setup using file]',
	)
	.option(
		'-u, --username [value]',
		'Jira username [possible to setup using file]',
	)
	.option(
		'-p, --password [value]',
		'Jira password (needs to be a PAT) [possible to setup using file]',
	)
	.option(
		'-p, --password [value]',
		'Jira password (needs to be a PAT) [possible to setup using file]',
	)
	.option('-c, --config [value]', 'Config file location, keys same as config')
	.action(async (key, cliOptions) => {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const options = {
			...readConfig(cliOptions.config),
			...cliOptions,
		} as Record<keyof typeof cliOptions, string>;

		const keys: Array<keyof typeof cliOptions> = [
			'host',
			'output',
			'password',
			'testPlanLabel',
			'username',
		];

		keys.forEach((key) => {
			if (!options[key]) {
				throw new Error(`${key} is mandatory`);
			}
		});

		const client = new Version3Client({
			host: `https://${options.host}`,
			authentication: {
				basic: {
					username: options.username,
					password: options.password,
				},
			},
		});

		const issue = await client.issues.getIssue({
			issueIdOrKey: key,
		});

		const toRender = isTestPlan(issue, options.testPlanLabel)
			? await createTestPlanFromIssue(issue, client)
			: await createTestFromIssue(issue);

		if (!options.output) {
			console.log(toRender);
			return;
		}

		await writeFile(path.resolve(process.cwd(), options.output), toRender);
	})
	.parse();

function readConfig(configFile?: string | boolean) {
	if (!configFile || typeof configFile === 'boolean') {
		return {};
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
	return require(path.resolve(process.cwd(), configFile)) as Record<
		string,
		unknown
	>;
}

function isTestPlan(issue: Issue, label: string) {
	return issue.fields.labels.includes(label);
}
