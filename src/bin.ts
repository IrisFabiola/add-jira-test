#!/usr/bin/env -S ts-node --files

import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import Mustache from 'mustache';
import { groupby, map } from 'itertools';
import { Version3Client } from 'jira.js';
import { type Document } from 'jira.js/out/version3/models';
import minimist from 'minimist';
import path from 'path';

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

	const { fields } = issue;

	const { description, summary } = fields;

	if (!description?.content) {
		throw new Error('ticket does not have description');
	}

	const parsed = parseContent(description.content);

	const issueTemplateFile = readFileSync(
		path.resolve(__dirname, './test.mustache'),
	).toString();

	const issueTest = Mustache.render(issueTemplateFile, {
		key,
		title: summary,
		...parsed,
	});

	await writeFile(path.resolve(process.cwd(), fileName), issueTest);
})();

function parseContent(content: Array<Omit<Document, 'version'>>) {
	const iterable = content[Symbol.iterator]();

	const grouped = groupby(generateStatements(iterable), ([type]) => type);

	const statementsByType = new Map(
		map(grouped, ([type, typedStatements]) => [
			type,
			map(typedStatements, ([, statement]) => statement),
		]),
	);

	return {
		given: statementsByType.get('GIVEN') ?? [],
		when: statementsByType.get('WHEN') ?? [],
		then: statementsByType.get('THEN') ?? [],
	};
}

function* generateStatements(
	iter: IterableIterator<Omit<Document, 'version'>>,
) {
	let type = '';

	for (const value of iter) {
		if (!type && value.type !== 'heading') {
			continue;
		}

		const isInLastSection = type === 'THEN';

		if (value.type === 'heading' && isInLastSection) {
			return;
		}

		if (
			value.type === 'heading' &&
			value.content?.[0].text &&
			['GIVEN', 'WHEN', 'THEN'].includes(value.content[0].text)
		) {
			type = value.content[0].text;
			continue;
		}

		if (value.type === 'paragraph') {
			yield [type, value.content?.map((c) => c.text).join('')] as const;
			continue;
		}
	}
}
