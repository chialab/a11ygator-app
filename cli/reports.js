const { URL } = require('url');
const http = require('http');
const https = require('https');

process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk');
const aws4 = require('aws4');
const prompts = require('prompts');
const { spinner } = require('./index.js');

/**
 * Load AWS Credentials.
 *
 * @returns {Promise<AWS.Credentials>}
 */
const loadCredentials = () => new Promise((resolve, reject) => {
  spinner.prefixText = 'Loading AWS credentials...';
  spinner.start();
  AWS.config.getCredentials((err) => {
    if (err) {
      spinner.fail('failed');
      reject(err);
    } else {
      spinner.succeed('done');
      resolve(AWS.config.credentials);
    }
  });
});

/**
 * Send a request signed with SIGv4.
 *
 * @param {http.RequestOptions & { service?: string, region?: string, body?: Buffer | string }} opts Request options.
 * @param {AWS.Credentials | undefined} credentials
 * @returns {Promise<http.IncomingMessage & { body: Buffer }>}
 */
const request = (requestOptions, credentials) => new Promise((resolve, reject) => {
  requestOptions = aws4.sign(requestOptions, credentials);

  (requestOptions.protocol === 'https:' ? https : http)
    .request(requestOptions, (res) => {
      let body = Buffer.alloc(0);
      res
        .on('data', (chunk) => {
          body = Buffer.concat([body, chunk]);
        })
        .on('end', () => {
          res.body = body;
          resolve(res);
        });
    })
    .on('error', reject)
    .end(requestOptions.body || '');
});

/**
 * Schedule a report.
 *
 * @param {{ apiUrl: URL }} argv Command arguments.
 * @returns {Promise<boolean>}
 */
exports.schedule = async ({ apiUrl }) => {
  const { url, schedule, confirm, mention } = await prompts([
    {
      type: 'text',
      name: 'url',
      message: 'What URL would you like A11ygator to check?',
      format: (input) => new URL(input),
      validate: (input) => {
        try {
          new URL(input);

          return true;
        } catch (err) {
          return err.message;
        }
      },
    },
    {
      type: 'date',
      name: 'schedule',
      message: 'When would you like to schedule the report?',
      initial: new Date(),
      validate: (date) => date <= new Date() ? 'Unable to schedule a report for a past date' : true,
    },
    {
      type: 'text',
      name: 'mention',
      message: 'Which account would you like A11ygator to mention on the report tweet? (optional)',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (_, answers) => {
        let text = `Do you really want to schedule a report for ${answers.url} on ${answers.schedule.toLocaleString()}`;
        const mention = answers.mention || '';
        if (mention) {
          text += ` mentioning ${mention}`;
        }
        return text += '?';
      },
      initial: true,
    },
  ]);
  if (!confirm) {
    console.log('Aborting');
    return false;
  }

  const scheduleUrl = new URL('schedules', apiUrl);
  const credentials = await loadCredentials();

  spinner.prefixText = 'Scheduling report...';
  spinner.start();

  const body = mention ? JSON.stringify({ url, schedule, mention }) : JSON.stringify({ url, schedule });
  const response = await request(
    {
      service: 'execute-api',
      region: 'eu-west-1',
      method: 'POST',
      protocol: scheduleUrl.protocol,
      host: scheduleUrl.host,
      path: scheduleUrl.pathname,
      headers: { 'Content-Type': 'application/json' },
      body,
    },
    credentials
  );
  if (response.statusCode >= 400) {
    spinner.fail('fail');

    throw new Error(`Got error ${response.statusCode} ${response.statusMessage}`);
  }

  spinner.succeed('done');

  return true;
};
