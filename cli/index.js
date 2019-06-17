const { URL } = require('url');

process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk');
const ora = require('ora');
const yargs = require('yargs');

exports.spinner = ora({ color: 'magenta' });
const spinner = this.spinner;

exports.builder = yargs
  .env('A11YGATOR')
  .option('stack-name', { type: 'string', description: 'Name of CloudFormation stack' })
  .middleware(async (argv) => {
    if (!argv['stack-name'] || argv.stackOutputs) {
      return {};
    }

    const CloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });

    spinner.prefixText = 'Getting Stack outputs...';
    spinner.start();
    const { Stacks } = await CloudFormation.describeStacks({ StackName: argv['stack-name'] }).promise();
    argv.stackOutputs = Stacks[0].Outputs.reduce(
      (outputs, { OutputKey, OutputValue }) => {
        outputs[OutputKey] = OutputValue;

        return outputs;
      },
      {}
    );
    spinner.succeed('done');
  })
  .command(
    'twitter',
    'Manage Twitter webhook',
    (yargs) => yargs
      .option('consumer-key', { type: 'string', description: 'Consumer key of Twitter app' })
      .option('consumer-secret', { type: 'string', description: 'Consumer secret of Twitter app' })
      .option('oauth-token', { type: 'string', description: 'OAuth token of Twitter user' })
      .option('oauth-token-secret', { type: 'string', description: 'OAuth token secret of Twitter user' })
      .group(['consumer-key', 'consumer-secret', 'oauth-token', 'oauth-token-secret'], 'Twitter options:')
      .command(
        'register-webhook',
        'Register the webhook to receive Twitter events',
        (yargs) => yargs
          .option('webhook-url', { description: 'URL of Twitter webhook', coerce: (input) => new URL(input) }),
        (argv) => require('./twitter.js').registerWebhook({
          consumerKey: argv['consumer-key'],
          consumerSecret: argv['consumer-secret'],
          oauthToken: argv['oauth-token'],
          oauthTokenSecret: argv['oauth-token-secret'],
          webhookUrl: argv['webhook-url'] || new URL('api/webhook/twitter', argv.stackOutputs.PublicUrl),
        })
      )
      .command(
        'subscribe',
        'Subscribe to Twitter account events',
        {},
        (argv) => require('./twitter.js').subscribe({
          consumerKey: argv['consumer-key'],
          consumerSecret: argv['consumer-secret'],
          oauthToken: argv['oauth-token'],
          oauthTokenSecret: argv['oauth-token-secret'],
        })
      )
      .demandCommand(),
  )
  .command(
    'reports',
    'Manage reports',
    (yargs) => yargs
      .option('api-url', { description: 'Base API URL for authenticated API requests', coerce: (input) => new URL(input) })
      .command(
        'schedule',
        'Schedule a report',
        {},
        (argv) => require('./reports.js').schedule({
          apiUrl: argv['api-url'] || new URL(argv.stackOutputs.AuthenticatedApiUrl),
        }),
      )
      .demandCommand(),
  )
  .demandCommand()
  .showHelpOnFail(false)
  .help();
