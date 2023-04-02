import { readFileSync } from 'fs';
import Mustache from 'mustache';
import { groupby, map } from 'itertools';
import path from 'path';
import { type Issue, type Document } from 'jira.js/out/version3/models';

export async function createTestFromIssue(issue: Issue) {
	const parsed = parseIssue(issue);

	const issueTemplateFile = readFileSync(
		path.resolve(__dirname, './test.mustache'),
	).toString();

	return Mustache.render(issueTemplateFile, parsed);
}

export function parseIssue(issue: Issue) {
	const { fields } = issue;

	const { description, summary } = fields;

	if (!description?.content) {
		throw new Error('ticket does not have description');
	}

	const parsed = parseContent(description.content);

	return {
		key: issue.key,
		title: summary,
		...parsed,
	};
}

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
