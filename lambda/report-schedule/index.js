const { URL } = require('url');
const AWS = require('aws-sdk');
const uuid4 = require('uuid/v4');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const SCHEDULED_REPORTS_STATE_MACHINE = process.env.SCHEDULED_REPORTS_STATE_MACHINE;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const StepFunctions = new AWS.StepFunctions({ apiVersion: '2016-11-23' });

/**
 * Start state machine with report generation requests received via API Gateway.
 *
 * @param {{ url: string, schedule: string, mention?: string, config?: { wait?: number, standard?: string } }} event Report generation request.
 * @returns {Promise<{ id: string, url: string }>}
 */
exports.handler = async ({ url, schedule, mention, config }) => {
  url = new URL(url);

  const id = uuid4();
  const hostname = url.hostname;
  const timestamp = Date.now();
  const scheduledFrom = new Date(schedule);
  const source = 'schedule';

  // Save info to DynamoDB.
  const item = {
    Id: id,
    Url: url.toString(),
    Hostname: hostname,
    Timestamp: timestamp,
    ScheduledTimestamp: scheduledFrom.valueOf(),
    Source: source,
  };

  if (mention) {
    item.Mention = mention;
  }

  console.time('Save info');
  await DDB.put({ TableName: REPORTS_TABLE, Item: item }).promise();
  console.timeEnd('Save info');

  const message = JSON.stringify({ id, url, mention, config, source });

  // Start step function that will eventually generate report.
  console.time('Schedule report');
  await StepFunctions.startExecution({
    name: id,
    stateMachineArn: SCHEDULED_REPORTS_STATE_MACHINE,
    input: JSON.stringify({ scheduledFrom, mention, message }),
  }).promise();
  console.timeEnd('Schedule report');

  return { id, url, mention };
};
