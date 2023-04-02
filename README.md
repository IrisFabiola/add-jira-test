# Add Jira test

Use this tool to automatically fetch and generate a jest test file based on a given jira issue.

You can read an helpful help message with

```
npx add-jira-test --help
```

## How to use

Call using `npx`. All of the configs can be set either using CLI args or in a config file (recommended for auth).

```sh
npx add-jira-test --config example.json --output=example.spec.ts JIRA-123
```

```json
// example.json
{
  "username": "example@example.org",
  "password": "pat123",
  "host": "awesome.atlassian.net",
  "testPlanLabel": "TestPlan"
}
```

```sh
npx add-jira-test --username=example@example.org --password=pat123 --host awesome.atlassian.net --test-plan-label=TestPlan --output=example.spec.ts JIRA-123
```

The given ticket can either be a test case or a test plan. In order to identify which is which, you'll need to add a specific label to the JIRA issue. We require it to be set up as well (either via config or CLI)

## Authentication

In order to authenticate you need to create an [API token](https://id.atlassian.com/manage-profile/security/api-tokens).

[Read how here](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).
