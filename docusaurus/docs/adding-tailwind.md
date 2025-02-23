---
id: adding-tailwind
title: Adding Tailwind
---

> Note: this feature is available with `react-scripts@5.0.0` and higher.

[Tailwind](https://tailwindcss.com/) is a utility-first CSS framework packed with classes.

## Installation

```sh
npm install -D tailwindcss
```

## Usage

1. You can use tailwind css simply adding `tailwind.config.js` in your root directory.

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

2. Import tailwind stylesheet.

```css
/* App.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. Example

```javascript
// App.js
import './App.css';

function App() {
  return (
    <div>
      <h1 class="text-3xl font-bold underline">Hello world!</h1>
    </div>
  );
}

export default App;
```

---

- Here is more guide for tailwind css configuration. [A guide to configuring and customizing your Tailwind installation.](https://tailwindcss.com/docs/configuration)

- If you are using under `react-scripts@5.0.0` version, follow this step. [Install Tailwind CSS with Create React App](https://tailwindcss.com/docs/guides/create-react-app)
