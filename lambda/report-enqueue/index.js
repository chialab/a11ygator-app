const { URL } = require('url');
const AWS = require('aws-sdk');
const uuid4 = require('uuid/v4');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const REPORTS_QUEUE = process.env.REPORTS_QUEUE;
const SCHEDULED_REPORTS_STATE_MACHINE = process.env.SCHEDULED_REPORTS_STATE_MACHINE;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });
const StepFunctions = new AWS.StepFunctions({ apiVersion: '2016-11-23' });

/**
 * Send report generation requests received via API Gateway to SQS queue.
 *
 * @param {{ url: string, schedule?: string, config?: { wait?: number, standard?: string } }} event Report generation request.
 * @returns {Promise<{ id: string, url: string }>}
 */
exports.handler = async ({ url, schedule, config }) => {
  url = new URL(url);

  const id = uuid4();
  const hostname = url.hostname;
  const timestamp = Date.now();

  let source = 'api';
  let scheduledFrom = null;
  if (schedule) {
    source = 'schedule';
    scheduledFrom = new Date(schedule);
  }

  // Save info to DynamoDB.
  const item = {
    Id: id,
    Url: url.toString(),
    Hostname: hostname,
    Timestamp: timestamp,
    Source: source,
  };
  if (scheduledFrom) {
    item.ScheduledTimestamp = scheduledFrom.valueOf();
  }
  console.time('Save info');
  await DDB.put({ TableName: REPORTS_TABLE, Item: item }).promise();
  console.timeEnd('Save info');

  const message = JSON.stringify({ id, url, config, source });

  if (scheduledFrom === null) {
    // Send message to queue.
    console.time('Enqueue request');
    await SQS.sendMessage({ QueueUrl: REPORTS_QUEUE, MessageBody: message }).promise();
    console.timeEnd('Enqueue request');
  } else {
    // Start step function that will eventually generate report.
    console.time('Schedule report');
    await StepFunctions.startExecution({
      name: id,
      stateMachineArn: SCHEDULED_REPORTS_STATE_MACHINE,
      input: JSON.stringify({ scheduled_from: scheduledFrom.toISOString(), message }),
    }).promise();
    console.timeEnd('Schedule report');
  }

  return { id, url };
};
