---
id: using-https-in-development
title: Using HTTPS in Development
sidebar_label: HTTPS in Development
---

> Note: this feature is available with `react-scripts@0.4.0` and higher.

You may require the dev server to serve pages over HTTPS. One particular case where this could be useful is when using [the "proxy" feature](proxying-api-requests-in-development.md) to proxy requests to an API server when that API server is itself serving HTTPS.

To do this, set the `HTTPS` environment variable to `true`, then start the dev server as usual with `npm start`:

### Windows (cmd.exe)

```cmd
set HTTPS=true&&npm start
```

(Note: the lack of whitespace is intentional.)

### Windows (Powershell)

```Powershell
($env:HTTPS = "true") -and (npm start)
```

### Linux, macOS (Bash)

```sh
HTTPS=true npm start
```

Note that the server will use a self-signed certificate, so your web browser will almost definitely display a warning upon accessing the page.


## Custom SSL certificate

To set a custom certificate, set the `SSL_CRT_FILE` and `SSL_KEY_FILE` environment variables to the path of the certificate and key files in the same way you do for `HTTPS` above. Note that you will also need to set `HTTPS=true`.

### Linux, macOS (Bash)

```bash
HTTPS=true SSL_CRT_FILE=cert.crt SSL_KEY_FILE=cert.key npm start
```


To avoid having to set the environment variable each time, you can either include in the `npm start` script like so:

```json
{
  "start": "HTTPS=true react-scripts start"
}
```

Or you can create a `.env` file with `HTTPS=true` set.
[Learn more about environment variables in CRA](https://create-react-app.dev/docs/adding-custom-environment-variables).

