<p align="center">
    <img src="public/logo.png" width="100">
</p>
<h1 align="center">A11ygator</h1>
<p align="center">
    <a href="https://chrome.google.com/webstore/detail/a11ygator/imfmlpemomjmfncnmkjdeeinbkichaio">Chrome extension</a> |
    <a href="https://addons.mozilla.org/it/firefox/addon/a11ygator">Firefox extension</a> |
    <a href="https://a11ygator.chialab.io/">WebApp</a> |
    <a href="https://www.w3.org/WAI/standards-guidelines/wcag/">WCAG</a> |
    <a href="https://github.com/chialab/a11ygator-extension">Source</a> |
    <a href="https://www.chialab.io">Authors</a>
</p>

Validate the accessibility of your website against W3C's Web Content Accessibility Guidelines.

A11ygator is a free tool for web developers to check compliance with the WCAG rules.

Simply type an URL and choose the WCAG standard.

![homepage screenshot](a11ygator.png?raw=true "homepage screenshot")


🚀Now also available as Browser Extension! Check out <a href="https://chrome.google.com/webstore/detail/a11ygator/imfmlpemomjmfncnmkjdeeinbkichaio">A11ygator for Chrome</a> and <a href="https://addons.mozilla.org/it/firefox/addon/a11ygator">A11ygator for Firefox</a>.


## Awake the A11ygator

Requirements

* [Node JS](https://nodejs.org/) (>= 8.0.0)
* [Yarn](https://yarnpkg.com/)

Run the server

```.sh
yarn install
yarn build
yarn start
```

In local environment, navigate with the browser to **`https://localhost:3000/`** to visualize the app.

## API Usage

It is also possible to directly use `A11ygator` without filling the form.

To get a raw JSON report with default options, make a GET call to

```http
GET /report?url=<site-to-test> HTTP/1.1
```

To get an HTML report just add query param 'format'

```http
GET /report?url=<site-to-test&format=html> HTTP/1.1
```

To pass options, make a POST call embedding them on the request's body.

Example:

```http
POST /report?url=<site-to-test> HTTP/1.1
Content-Type: application/json
{
    "wait": 5000,
    "timeout": 8000
}
```

## More

Also check out [A11ygator Extension repository](https://github.com/chialab/a11ygator-extension).

## Credits

A11ygator uses [Pa11y](https://github.com/pa11y/pa11y) under the hood.

## License

A11ygator is released under the [MIT](./LICENSE) license.
