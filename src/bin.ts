#!/usr/bin/env -S ts-node --files

import * as dotenv from 'dotenv';
import { writeFile } from 'fs/promises';
import { Version3Client } from 'jira.js';
import minimist from 'minimist';
import path from 'path';
import { createTestFromIssue } from './issue';

dotenv.config();

if (!process.env.HOST || !process.env.USERNAME || !process.env.TOKEN) {
	throw new Error('no host provided');
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

	const issueTest = await createTestFromIssue(issue, client);

	await writeFile(path.resolve(process.cwd(), fileName), issueTest);
})();
