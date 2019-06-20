<p align="center">
    <img src="./logo.png" width="100">
</p>
<h1 align="center">A11ygator</h1>

An application and Twitter bot that bites websites to taste their accessibility.

Command Line Interface
----------------------

This repository includes a CLI to make zookeeping tasks a breeze.

### Launch the CLI

```
bin/a11ygator
```

#### Loading environment variables

If you have a `.env` file, you can load it setting the flag `--env-file=.env`.

#### Fetching metadata from CloudFormation

If you have deployed A11ygator launching the CloudFormation template provided
in this repository, you can fetch informations in the stack's outputs setting
the `--stack-name` flag, or the `A11YGATOR_STACK_NAME` environment variable.

The URL of the A11ygator API, if not explicitly set with `--api-url`,
will be desumed from CloudFormation stack outputs.

### Reports management

Manage reports.

#### `reports schedule`

Schedules a report for future generation. The CLI will interactively ask the URL
to analyze and the time at which generate the report.

### Twitter management

Manage Twitter bot.

#### Twitter credentials

You can pass Twitter credentials as flags when launching the script
(`--consumer-key`, `--consumer-secret`, `--oauth-token`, `--oauth-token-secret`),
or via environment variables (`A11YGATOR_CONSUMER_KEY`, `A11YGATOR_CONSUMER_SECRET`,
`A11YGATOR_OAUTH_TOKEN`, `A11YGATOR_OAUTH_TOKEN_SECRET`).

If none of these are set, they will be asked interactively.

#### `twitter register-webhook`

Register the Twitter webhook endpoint as a Webhook for the configured Twitter
application.

#### `twitter subscribe`

Subscribe the configured Twitter application for account-related events for
the authenticated Twitter user. Any registered webhook will now be called every
time an event occurs.
