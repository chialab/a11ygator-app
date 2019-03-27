# A11ygator

A web dashboard for accessibility tests.

![homepage screenshot](a11ygator.png?raw=true "Title")

## Awake the A11ygator

Run the server

```.sh
yarn install
yarn build
yarn start
```

In local environment, navigate with the browser to **`https://localhost:3000/`** in order to visualize the app.

## API Usage

It is also possible to directly use `A11ygator` without filling the form.

To get an HTML report with default options, make a GET call to

```http
GET /report?url=<site-to-test> HTTP/1.1
```

To pass options, make a POST call embedding them on the request's body.

Example:

```http
POST /report?url=<site-to-test> HTTP/1.1
Content-Type: application/json

{
    "includeNotices": false,
    "includeWarnings": false,
    "wait": 10000,
    // ...
}
```

See https://github.com/pa11y/pa11y for more info.
