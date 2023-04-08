---
name: Bug report
about: Create a report to help us improve
labels: 'issue: bug report, needs triage'
---

<!--
    Please note that your issue will be fixed much faster if you spend about
    half an hour preparing it, including the exact reproduction steps and a demo.

    If you're in a hurry or don't feel confident, it's fine to report bugs with
    less details, but this makes it less likely they'll get fixed soon.

    In either case, please use this template and fill in as many fields below as you can.

    Note that we don't provide help for webpack questions after ejecting.
    You can find webpack docs at https://webpack.js.org/.
-->

### Describe the bug

(Write your answer here.)

### Did you try recovering your dependencies?

<!--
  Your module tree might be corrupted, and that might be causing the issues.
  Let's try to recover it. First, delete these files and folders in your project:

    * node_modules
    * package-lock.json
    * yarn.lock

  Then you need to decide which package manager you prefer to use.
  We support both npm (https://npmjs.com) and yarn (https://yarnpkg.com/).
  However, **they can't be used together in one project** so you need to pick one.

  If you decided to use npm, run this in your project directory:

    npm install -g npm@latest
    npm install

  This should fix your project.

  If you decided to use yarn, update it first (https://yarnpkg.com/en/docs/install).
  Then run in your project directory:

    yarn

  This should fix your project.

  Importantly, **if you decided to use yarn, you should never run `npm install` in the project**.
  For example, yarn users should run `yarn add <library>` instead of `npm install <library>`.
  Otherwise your project will break again.

  Have you done all these steps and still see the issue?
  Please paste the output of `npm --version` and/or `yarn --version` to confirm.
-->

(Write your answer here.)

### Which terms did you search for in User Guide?

<!--
  There are a few common documented problems, such as watcher not detecting changes, or build failing.
  They are described in the Troubleshooting section of the User Guide:

  https://facebook.github.io/create-react-app/docs/troubleshooting

  Please scan these few sections for common problems.
  Additionally, you can search the User Guide itself for something you're having issues with:

  https://facebook.github.io/create-react-app/

  If you didn't find the solution, please share which words you searched for.
  This helps us improve documentation for future readers who might encounter the same problem.
-->

(Write your answer here if relevant.)

### Environment

<!--
  To help identify if a problem is specific to a platform, browser, or module version, information about your environment is required.
  This enables the maintainers quickly reproduce the issue and give feedback.

  Run the following command in your React app's folder in terminal.
  Note: The result is copied to your clipboard directly.

  `npx create-react-app --info`

  Paste the output of the command in the section below.
-->

(paste the output of the command here.)

### Steps to reproduce

<!--
  How would you describe your issue to someone who doesn’t know you or your project?
  Try to write a sequence of steps that anybody can repeat to see the issue.
-->

(Write your steps here:)

1.
2.
3.

### Expected behavior

<!--
  How did you expect the tool to behave?
  It’s fine if you’re not sure your understanding is correct.
  Just write down what you thought would happen.
-->

(Write what you thought would happen.)

### Actual behavior

<!--
  Did something go wrong?
  Is something broken, or not behaving as you expected?
  Please attach screenshots if possible! They are extremely helpful for diagnosing issues.
-->

(Write what happened. Please add screenshots!)

### Reproducible demo

<!--
  If you can, please share a project that reproduces the issue.
  This is the single most effective way to get an issue fixed soon.

  There are two ways to do it:

    * Create a new app and try to reproduce the issue in it.
      This is useful if you roughly know where the problem is, or can’t share the real code.

    * Or, copy your app and remove things until you’re left with the minimal reproducible demo.
      This is useful for finding the root cause. You may then optionally create a new project.

  This is a good guide to creating bug demos: https://stackoverflow.com/help/mcve
  Once you’re done, push the project to GitHub and paste the link to it below:
-->

(Paste the link to an example project and exact instructions to reproduce the issue.)

<!--
  What happens if you skip this step?

  We will try to help you, but in many cases it is impossible because crucial
  information is missing. In that case we'll tag an issue as having a low priority,
  and eventually close it if there is no clear direction.

  We still appreciate the report though, as eventually somebody else might
  create a reproducible example for it.

  Thanks for helping us help you!
-->
