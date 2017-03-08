'use strict';

const { danger, fail, warn } = require('danger');

// Make sure there are changelog entries
const hasChangelog = danger.git.modified_files.includes('changelog.md');
if (!hasChangelog) {
  fail('No Changelog changes!');
}

// Make sure someone is assigned
if (danger.github && !danger.github.pr.assignees.length) {
  warn('This PR does not have any assignees yet.');
}

// Check if an issue is referenced
{
  const exp = /#[0-9]+/;
  const hasIssueReferenced = exp.test(danger.git.description);
  if (!hasIssueReferenced) {
    const message = 'There is no issue referenced in this PR';
    warn(`${message}`);
  }
}

// PR Mergable?
{
  if (danger.github && !danger.github.pr.mergeable) {
    warn('This PR cannot be merged yet.');
  }
}

// Make sure yarn.lock is updated
{
  const packageChanged = danger.git.modified_files.includes('package.json');
  const lockfileChanged = danger.git.modified_files.includes('yarn.lock');

  if (packageChanged && !lockfileChanged) {
    const message = 'Changes were made to package.json, but not to yarn.lock';
    const idea = 'Perhaps you need to run `yarn install`?';
    fail(`${message} - <i>${idea}</i>`);
  }
}
