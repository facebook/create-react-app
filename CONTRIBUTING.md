# Contribution guidelines

These guidelines outline our conventions and should help you produce code that looks and feels consistent with other contributors.

## Basics

Write valid, semantic and accessible code.

* **Valid:** Rely on official specification. You can safely ignore for example IE errors on self closing `<path>` tags. Consider using a browser extension that validates your code (e.g. http://www.validity.org.uk/)
* **Semantic:**  Where appropriate, take advantage of HTML5 semantic elements like `<header>, <nav>, <article>, <aside>, <figure> etc...`. Don't be afraid to use tables for displaying structured data.
* **Accessible:** Always cater users with disabilities. Accessibility should not be an additional feature but a quality of your code.

## Components

Structure components with appropriate granularity and balance flexibility with ease-of-use. Existing components can be used as good example how to structure code.

### Folder Structure

```
components/
  MyComponent/
    MyComponent.docs.mdx
    MyComponent.js
    index.js
```
* `MyComponent.docs.mdx` - component documentation
* `MyComponent.js` - component definition
* `index.js` - component public API

### Do's

* try to write expressive and readable code 
* Specify component API with prop-types ([see props naming](#props-naming))
* Specify default values for props if it is possible
* Prefer `node` instead `element` prop-type
* Write UI components as functions as much as possible
* Use [`classnames`](https://github.com/JedWatson/classnames) library to specify classes for styling

### Dont's

* Don't mix business logic with UI logic

### Props naming

Use expressive names. Name itself should be self explaining.

Naming patterns:

* **Array** - use plural nouns. e.g. items
* **Number** - use prefix num or postfix count, index etc that can imply a number. e.g. numItems, itemCount, itemIndex
* **Bool** - use prefix is, can, has  
  is: for visual/behavior variations. e.g. isVisible, isEnable, isActive  
  can: fore behavior variations or conditional visual variations. e.g. canToggle, canExpand, canHaveCancelButton  
  has: for toggling UI elements. e.g. hasCancelButton, hasHeader  
* **Object** - use noun. e.g. item
* **Enum** - use noun. e.g. item
* **Node** - use prefix node. containerNode
* **Element** - use prefix element. hoverElement
* **Function** - use prefix on, render  
  on: for describing callback event. e.g. onOpen, onChange  
  render: for rendering custom content inside component on specific place. e.g. renderLabel, renderHeader 

## Styles

To style components we are using CSS-in-JS library called [styled-components](https://www.styled-components.com/).

### Read more on how to use styled-components

* https://medium.com/@pitipatdop/10-useful-tips-for-styled-components-b7710b021e6a
* https://levelup.gitconnected.com/building-a-reusable-component-system-with-react-js-and-styled-components-4e9f1018a31c

## Linter

Our framework features a rather strict linter, that enforces common practices for everyone. I does not even allow you to commit code that does not pass the rules.

For better experience, consider installing an extension to your editor. It can fix most formatting issues automatically. You'll need ESLint (https://eslint.org/docs/user-guide/integrations) integrations.

## Git

We use Git for version control and Bitbucket pull requests for code review.

Each time you're writing code for a new feature or squashing a bug, create your own branch. Give it a meaningful name, e.g. `feat/carousel` or `fix/ie-bugs`.

Then write some code. Commit it and provide a meaningful description, of what you've created. For example `Product card markup and styles`, `Add button documentation ` or `Tweak list paddings`.

When you think you're done, review your code. Check if it makes sense and follows our conventions. Test across browsers. Then submit a pull request on Bitbucket against:
* `master` branch if your code do not introduce breaking change

If you are not sure what breaking change is, code reviewer should help you decide.

## Code review

All code should be reviewed twice. First, you should review (and test!) your own code before each commit. Second, on each merge request, another developer will take a look.

Keep in mind, **code review** takes a look at the code. It's not evaluation of your performance. The aim of code review is to improve the code, not find faults.

The reason code is reviewed, is to assure better quality, readability and knowledge sharing. The best thing about code review is, that no longer there is a line of code that only one person knows about.

### Preparing for code review
* Merge request should generally be shorter than 400 lines of code.
* Read your code. Refactor if you think it's not right.
* Check if your code performs well, across all browsers.
* Is your code well documented?

### Having your code reviewed
* Take a look at the comments the reviewer has made
* Reply where necessary (additional questions, clarify assumptions)
* Refactor where indicated by the reviewer
* Commit changes
* Repeat until merged

### Reviewing code

* Take a look at the overall structure. Is everything in place?
* Are components structured appropriately and flexible enough? 
* Check the semantics. Is there code that does something else than the class name suggests?
* Test it across all browsers.
* Found something nice? Appreciate it!
* Try to respond within 24 hours

## Versioning

[Semantic versioning (semver)](https://semver.org/) must be followed in process of releasing new version of this repository.

### When to update version

After meaningful batch of work. Depends on project plan, but usually as soon as project/feature/fix is ready to be evaluated by other parties or publicly.

### How to determine version number

* Follow [Semantic versioning (semver)](https://semver.org/) strictly.
* In initial stage of project (pre 1.0.0) it's ok to make breaking changes without changing first digit of version (major). Same applies to beta versions.
* Don't be afraid to change major version if you introduce breaking change (is the breaking change necessary?).

### How to update version

1. Update `CHANGELOG.md` file with summary of changes since last version. Good example of how changelog should look like is [Create React App changelog](https://github.com/facebook/create-react-app/blob/master/CHANGELOG.md). Distinguish between packages with package name prefix such as `lighter-styleguide`, or `lighter-react-scripts`. Also reference pull request via link.
2. Update version in `package.json` of each package which should be updated.
3. If you have npm publish rights publish each updated package on npm via `npm publish --access public` or ask somebody who has publish rights.
