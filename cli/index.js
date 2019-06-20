const { URL } = require('url');

process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk');
const ora = require('ora');
const yargs = require('yargs');

exports.spinner = ora({ color: 'magenta' });
const spinner = this.spinner;

/**
 * Load defaults from CloudFormation Stack outputs.
 *
 * @param {yargs.Argv} argv Parsed arguments.
 * @returns {Promise<{ 'api-url'?: URL }>}
 */
const stackOutputsMiddleware = async (argv) => {
  if (!argv['stack-name'] || argv['api-url']) {
    return {};
  }

  const CloudFormation = new AWS.CloudFormation({ apiVersion: '2010-05-15' });

  spinner.prefixText = 'Getting Stack outputs...';
  spinner.start();
  const { Stacks } = await CloudFormation.describeStacks({ StackName: argv['stack-name'] }).promise();
  const outputs = Stacks[0].Outputs.reduce(
    (outputs, { OutputKey, OutputValue }) => {
      outputs[OutputKey] = OutputValue;

      return outputs;
    },
    {}
  );
  spinner.succeed('done');

  return { 'api-url': new URL(outputs.AuthenticatedApiUrl) };
};

exports.builder = yargs
  .env('A11YGATOR')
  .option('stack-name', { description: 'Name of CloudFormation stack', string: true })
  .option('api-url', { description: 'Base API URL for API requests', coerce: (input) => new URL(input), defaultDescription: '(from CloudFormation)' })
  .command(
    'reports',
    'Manage reports',
    (yargs) => yargs
      .command(
        'schedule',
        'Schedule a report',
        {},
        (argv) => require('./reports.js').schedule({
          apiUrl: argv['api-url'],
        }),
        [stackOutputsMiddleware],
      )
      .demandCommand(),
  )
  .command(
    'twitter',
    'Manage Twitter webhook',
    (yargs) => yargs
      .option('consumer-key', { description: 'Consumer key of Twitter app', string: true })
      .option('consumer-secret', { description: 'Consumer secret of Twitter app', string: true })
      .option('oauth-token', { description: 'OAuth token of Twitter user', string: true })
      .option('oauth-token-secret', { description: 'OAuth token secret of Twitter user', string: true })
      .group(['consumer-key', 'consumer-secret', 'oauth-token', 'oauth-token-secret'], 'Twitter options:')
      .command(
        'register-webhook',
        'Register the webhook to receive Twitter events',
        {},
        (argv) => require('./twitter.js').registerWebhook({
          consumerKey: argv['consumer-key'],
          consumerSecret: argv['consumer-secret'],
          oauthToken: argv['oauth-token'],
          oauthTokenSecret: argv['oauth-token-secret'],
          apiUrl: argv['api-url'],
        }),
        [stackOutputsMiddleware],
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
        }),
      )
      .demandCommand(),
  )
  .demandCommand()
  .showHelpOnFail(false)
  .help();
