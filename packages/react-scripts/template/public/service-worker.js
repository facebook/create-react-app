// 引入workbox全局变量
importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
);

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
// set the prefix and suffix of our sw's name
workbox.core.setCacheNameDetails({
  prefix: 'browse-exp',
  suffix: 'v1.0.0',
});
// have our sw update and control a web page as soon as possible.
workbox.skipWaiting();
workbox.clientsClaim();

// 将静态资源进行预缓存
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  try {
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    let notificationData = event.data.json();
    const title = notificationData.title;
    // 可以发个消息通知页面
    //util.postMessage(notificationData);
    // 弹消息框
    event.waitUntil(
      self.registration.showNotification(title, notificationData)
    );
  } catch (e) {
    const title = 'Push Codelab';
    const options = {
      body: 'Yay it works.',
      icon: 'images/icon.png',
      badge: 'images/badge.png',
    };
    self.registration.showNotification(title, options);
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  console.log(`[Service Worker] Push had this data: "${event.notification}"`);

  event.notification.close();

  event.waitUntil(
    clients.openWindow(
      (event.notification.data && event.notification.data.url) ||
        'https://developers.google.com/web/'
    )
  );
});
