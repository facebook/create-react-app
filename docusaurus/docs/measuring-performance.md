---
id: measuring-performance
title: Measuring Performance
---

By default, Create React App includes a performance relayer that allows you to measure and analyze
the performance of your application using different metrics.

To measure any of the supported metrics, you only need to pass a function into the `reportWebVitals`
function in `index.js`:

```js
reportWebVitals(console.log);
```

This function is fired when the final values for any of the metrics have finished calculating on the
page. You can use it to log any of the results to the console or send to a particular endpoint.

## Web Vitals

[Web Vitals](https://web.dev/vitals/) are a set of useful metrics that aim to capture the user
experience of a web page. In Create React App, a third-party library is used to measure these
metrics ([web-vitals](https://github.com/GoogleChrome/web-vitals)).

To understand more about the object returned to the function when a metric value is calculated,
refer to the [documentation](https://github.com/GoogleChrome/web-vitals/#types). The [Browser
Support](https://github.com/GoogleChrome/web-vitals/#browser-support) section also explains which browsers are supported.

## Sending results to analytics

With the `reportWebVitals` function, you can send any of results to an analytics endpoint to measure and track real user performance on your site. For example:

```js
function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  const url = 'https://example.com/analytics';

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

reportWebVitals(sendToAnalytics);
```

> **Note:** If you use Google Analytics, use the `id` value to make it easier to construct metric distributions manually (to calculate percentiles, etc…).
>
> ```js
> function sendToAnalytics({ id, name, value }) {
>   ga('send', 'event', {
>     eventCategory: 'Web Vitals',
>     eventAction: name,
>     eventValue: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
>     eventLabel: id, // id unique to current page load
>     nonInteraction: true, // avoids affecting bounce rate
>   });
> }
>
> reportWebVitals(sendToAnalytics);
> ```
>
> Read more about sending results to Google Analytics [here](https://github.com/GoogleChrome/web-vitals#send-the-results-to-google-analytics).
