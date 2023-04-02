#!/usr/bin/env -S ts-node --files

import * as dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import { Version3Client } from 'jira.js';
import minimist from 'minimist';
import path from 'path';
import { createTestFromIssue } from './issue';
import { type Issue } from 'jira.js/out/version3/models';
import { createTestPlanFromIssue } from './test-plan';

dotenv.config();

if (
	!process.env.HOST ||
	!process.env.USERNAME ||
	!process.env.TOKEN ||
	!process.env.TEST_PLAN_LABEL
) {
	throw new Error('missing configs');
}

const client = new Version3Client({
	host: `https://${process.env.HOST}`,
	authentication: {
		basic: {
			username: process.env.USERNAME,
			password: process.env.TOKEN,
		},
	},
});

(async () => {
	const args = minimist(process.argv.slice(2));
	const key = args.key as string;
	const fileName = args.output as string;

	const issue = await client.issues.getIssue({
		issueIdOrKey: key,
	});

	const toRender = isTestPlan(issue)
		? await createTestPlanFromIssue(issue, client)
		: await createTestFromIssue(issue);

	await writeFile(path.resolve(process.cwd(), fileName), toRender);
})();

function isTestPlan(issue: Issue) {
	return issue.fields.labels.includes(process.env.TEST_PLAN_LABEL);
}
