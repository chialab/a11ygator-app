const AWS = require('aws-sdk');
const uuid4 = require('uuid/v4');

const REPORTS_QUEUE = process.env.REPORTS_QUEUE;

const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });

/**
 * Send report generation requests received via API Gateway to SQS queue.
 *
 * @param {{ url: string, config?: { wait?: number, standard?: string } }} event Report generation request.
 * @returns {Promise<{ id: string, url: string }>}
 */
exports.handler = async ({ url, config }) => {
  const id = uuid4();
  const message = { id, url, config };

  console.time('Send messages');
  await SQS.sendMessage({ QueueUrl: REPORTS_QUEUE, MessageBody: JSON.stringify(message) }).promise();
  console.timeEnd('Send messages');

  return { id, url };
};
