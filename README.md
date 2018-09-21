# Chia11y

A web dashboard for accessibility tests results.

## Start the server

```.sh
yarn install
yarn start
```

## Usage

In local environment, navigate with the browser to

```
https://localhost:9000?url=<site-to-test>
```

Currently it is possible to pass more info to the server with a `POST` request.
Options can be passed on the `body` of the Request.

Example:

```
POST https://localhost:9000?url=<site-to-test>
body: {
    includeNotices: false,
    includeWarnings: false,
    wait: 10000,
    // ...
}
```

See https://github.com/pa11y/pa11y more info.

