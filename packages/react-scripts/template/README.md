This project was bootstrapped with [@deskpro/apps-react-scripts](https://github.com/deskpro/apps-create).

# Getting Started

You can modify your code in `src/`. There are three files that exist by default:

* `src/App.js` is your main app component. This is where your app "starts".
* `src/index.js` is where the browser entry point is. This is pre-configured to boot and render your app, and you probably won't need to modify it.
* `src/styles.css` is a CSS file that is imported by default. Use it to add any custom styles you might need.

For more indepth information, you can refer to the [Apps Developer Guide](https://deskpro.gitbook.io/apps-developer-guide).

# Developing Your App

You can use `npm run dev` to start a local development server with a bit of fake data. You don't even need a Deskpro instance to use this. It's useful for quick prototyping and testing, but obviously if you need access to real Deskpro APIs and real data, then you need to run your app against a real Deskpro instance.

To run your app against a real Deskpro instance:

1. Start your app with `npm run start`
2. Go to Deskpro > Admin > Apps > Install Development App

After you install your development app, you can load the Agent Interface and see your app. Your app is being loaded into Deskpro, but the app files are being served from your local computer. As you make changes on your computer, the app in Deskpro will update too.

# Package your app

To build your app, run `npm run package`. This will generate a production-ready ZIP file in the `build/` directory. This ZIP file can then be used to install the app on any Deskpro site.
