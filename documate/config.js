/**
 * Documate site settings
 */

module.exports = {

  // Website's HTML title tag value
  title: "Create React App",

  // Path to site logo, this will be placed in topbar
  logo: "./logo.png",

  // Topbar and (documentation's) Sidebar navigation links
  navs: require("./navs"),

  // GitHub repository
  repoUrl: "https://www.github.com/facebook/create-react-app",

  // Main theme colors
  themeColors: {
    primary: "#61dafb",
    secondary: "#20232a"
  },

  // Syntax highlighting theme in code blocks
  // Check [https://documate.netlify.com/docs/config] for more themes
  codeBlockTheme: "default",

  // This will apear in the footer throughout the site
  footerContent: `
<div class="row">
  <div class="col-md-3">
    <a style="margin-bottom: 15px;display: block;" href="https://raw.githubusercontent.com/bukharim96/create-react-app/master/documate/img/oss_logo.png">
    </a>
    <span>Copyright &copy; ${new Date().getFullYear()} Facebook Inc.</span>
  </div>
  <div class="col-md-3">
    <h3>Docs</h3>
    <ul>
      <li>
        <a href="/docs/getting-started">Getting Started</a>
      </li>
      <li>
        <a href="https://reactjs.org/">Learn React</a>
      </li>
    </ul>
  </div>
  <div class="col-md-3">
    <h3>Community</h3>
    <ul>
      <li>
        <a href="https://stackoverflow.com/questions/tagged/create-react-app">Stack Overflow</a>
      </li>
      <li>
        <a href="https://spectrum.chat/react">Spectrum</a>
      </li>
      <li>
        <a href="https://twitter.com/reactjs">Twitter</a>
      </li>
    </ul>
  </div>
  <div class="col-md-3">
    <h3>More</h3>
    <ul>
      <li>
        <a href="https://www.github.com/facebook/create-react-app">GitHub</a>
      </li>
      <li>
        <a class="github-button" href="https://github.com/facebook/create-react-app" data-icon="octicon-star" data-show-count="true" aria-label="Star facebook/create-react-app on GitHub">Star</a>
      </li>
    </ul>
  </div>
</div>
`
};
