# Chia11y

A web dashboard for accessibility tests results.

## Start the server

```.sh
yarn install
yarn start
```

## App Usage

In local environment, navigate with the browser to

```
https://localhost:9000/app
```

in order to visualize the app home page.

### API Usage

It is also possible to directly use `chia11y` API.

To get an HTML report with default options, make a GET call to

```
https://localhost:9000?url=<site-to-test>
```

To pass options, please make a POST call embedding them on the body reqyest.

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

