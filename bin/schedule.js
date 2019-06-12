#!/usr/bin/env node

const { URL } = require('url');
const http = require('http');
const https = require('https');

process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk');
const aws4 = require('aws4');
const inquirer = require('inquirer');
inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

/**
 * Load AWS Credentials.
 *
 * @returns {Promise<AWS.Credentials>}
 */
const loadCredentials = () => new Promise((resolve, reject) => {
  AWS.config.getCredentials((err) => {
    if (err) {
      reject(err);
    }
    resolve(AWS.config.credentials);
  });
});

/**
 * Send a request signed with SIGv4.
 *
 * @param {https.RequestOptions & { service?: string, region?: string, body?: Buffer | string }} opts Request options.
 * @param {AWS.Credentials | undefined} credentials
 * @returns {Promise<http.IncomingMessage & { body: Buffer }>}
 */
const request = (requestOptions, credentials) => new Promise((resolve, reject) => {
  requestOptions = aws4.sign(requestOptions, credentials);

  https
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

(async () => {
  const { url, schedule, confirm } = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'What URL would you like A11ygator to check?',
      filter: (input) => new URL(input),
    },
    {
      type: 'datetime',
      name: 'schedule',
      message: 'When would you like to schedule the report?',
      format: ['dd', '/', 'mm', '/', 'yyyy', ' ', 'HH', ':', 'MM'],
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: (answers) => `Do you really want to schedule a report for ${answers.url} on ${answers.schedule.toLocaleString()}?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log('Aborting');

    process.exit(1);
  }

  const credentials = await loadCredentials();
  console.time('Scheduling report');
  const response = await request(
    {
      service: 'execute-api',
      region: 'eu-west-1',
      method: 'POST',
      host: 'sta344f5bg.execute-api.eu-west-1.amazonaws.com',
      path: '/api/schedules',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, schedule }),
    },
    credentials
  );
  console.timeEnd('Scheduling report');

  console.log(`HTTP/${response.httpVersion} ${response.statusCode} ${response.statusMessage}`);
  const report = JSON.parse(response.body);
  console.log(report);
})();
