---
id: adding-css-reset
title: Adding a CSS Reset
sidebar_label: Adding CSS Reset
---

This project setup uses [PostCSS Normalize] for adding a [CSS Reset].

To start using it, add `@import-normalize;` anywhere in your CSS file(s). You only need to include it once and duplicate imports are automatically removed. Since you only need to include it once, a good place to add it is `index.css` or `App.css`.

## `index.css`

```css
@import-normalize; /* bring in normalize.css styles */

/* rest of app styles */
```

> **Tip**: If you see an "_Unknown at rule @import-normalize css(unknownAtRules)_" warning in VSCode, change the `css.lint.unknownAtRules` setting to `ignore`.

You can control which parts of [normalize.css] to use via your project's [browserslist].

Results when [browserslist] is `last 3 versions`:

```css
/**
 * Add the correct display in IE 9-.
 */

audio,
video {
  display: inline-block;
}

/**
 * Remove the border on images inside links in IE 10-.
 */

img {
  border-style: none;
}
```

Results when [browserslist] is `last 2 versions`:

```css
/**
 * Remove the border on images inside links in IE 10-.
 */

img {
  border-style: none;
}
```

## Browser support

Browser support is dictated by what normalize.css [supports]. As of this writing, it includes:

- Chrome (last 3)
- Edge (last 3)
- Firefox (last 3)
- Firefox ESR
- Opera (last 3)
- Safari (last 3)
- iOS Safari (last 2)
- Internet Explorer 9+

[browserslist]: http://browserl.ist/
[css reset]: https://cssreset.com/what-is-a-css-reset/
[normalize.css]: https://github.com/csstools/normalize.css
[supports]: https://github.com/csstools/normalize.css#browser-support
[postcss normalize]: https://github.com/csstools/postcss-normalize
