/**
 * Documate site settings
 */

module.exports = {

  // Website's HTML title tag value
  title: "Documate",

  // Path to site logo, this will be placed in topbar
  logo: "./logo.png",

  // Topbar and (documentation's) Sidebar navigation links
  navs: require("./navs"),

  // GitHub repository
  repoUrl: "http://github.com/bukharim96/documate",

  // Main theme colors
  themeColors: {
    primary: "#61dafb",
    secondary: "#20232a"
  },

  // Syntax highlighting theme in code blocks
  // Check [https://documate.netlify.com/docs/config] for more themes
  codeBlockTheme: "default",

  // This will apear in the footer throughout the site
  footerContent: `<div style="color: #fff; text-align: center;">&copy; Copyright ${new Date().getFullYear()}</div>`
};
