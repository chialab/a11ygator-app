# a11ygator

A web dashboard for accessibility tests.

## Start the server

```.sh
yarn install
yarn start
```

## App Usage

In local environment, navigate with the browser to **`https://localhost:3000/`** in order to visualize the app home page.

### API Usage

It is also possible to directly use `a11ygator` without filling the form.

To get an HTML report with default options, make a GET call to

```http
GET /report?url=<site-to-test> HTTP/1.1
```

To pass options, please make a POST call embedding them on the body request.

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

See https://github.com/pa11y/pa11y more info.

