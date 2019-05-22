const { URL } = require('url');
const AWS = require('aws-sdk');
const uuid4 = require('uuid/v4');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const REPORTS_QUEUE = process.env.REPORTS_QUEUE;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });

/**
 * Send report generation requests received via API Gateway to SQS queue.
 *
 * @param {{ url: string, config?: { wait?: number, standard?: string } }} event Report generation request.
 * @returns {Promise<{ id: string, url: string }>}
 */
exports.handler = async ({ url, config }) => {
  url = new URL(url);

  const id = uuid4();
  const hostname = url.hostname;
  const timestamp = Date.now();

  // Save info to DynamoDB.
  const item = {
    Id: id,
    Url: url.toString(),
    Hostname: hostname,
    Timestamp: timestamp,
    Source: 'api',
  };
  console.time('Save info');
  await DDB.put({ TableName: REPORTS_TABLE, Item: item }).promise();
  console.timeEnd('Save info');

  // Send message to queue.
  const message = { id, url, config, source: 'api' };
  console.time('Enqueue request');
  await SQS.sendMessage({ QueueUrl: REPORTS_QUEUE, MessageBody: JSON.stringify(message) }).promise();
  console.timeEnd('Enqueue request');

  return { id, url };
};
