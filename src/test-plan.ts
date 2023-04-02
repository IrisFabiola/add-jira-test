import { readFileSync } from 'fs';
import Mustache from 'mustache';
import { groupby, map } from 'itertools';
import path from 'path';
import { type Version3Client } from 'jira.js';
import { type Issue, type Document } from 'jira.js/out/version3/models';
import { parseIssue } from './issue';

export async function createTestPlanFromIssue(
	issue: Issue,
	client: Version3Client,
) {
	const { fields } = issue;

	const { summary, subtasks } = fields;

	const testCases = await Promise.all(
		subtasks.map(async (subtask) => {
			const subIssue = await client.issues.getIssue({
				issueIdOrKey: subtask.key,
			});

			return parseIssue(subIssue);
		}),
	);

	const planTemplateFile = readFileSync(
		path.resolve(__dirname, './test-plan.mustache'),
	).toString();
	const issueTemplateFile = readFileSync(
		path.resolve(__dirname, './test.mustache'),
	).toString();

	return Mustache.render(
		planTemplateFile,
		{
			key: issue.key,
			title: summary,
			testCases,
		},
		{
			test: issueTemplateFile,
		},
	);
}
