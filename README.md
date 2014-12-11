Invoicer
========

An utility that watches, logs, aggregates, and reports filesystem changes in a specific directory.

It is intended to be used to create invoices, but could be useful in any sort of audit-related workflow. It's aims are as follows:

1. Provide a way to easily activate a "watch" on a directory that persists across operating system restarts, so that you only have to remember to do it once per machine
2. log those events
3. Group them by date-spans of two weeks
4. Add git commit messages relevant to each date-span
5. Provide a way to aggregate all that information together and generate:
	5.1. A nice web front-end
	5.2. PDFs

