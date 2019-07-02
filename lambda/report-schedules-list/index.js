const AWS = require('aws-sdk');

const REPORTS_TABLE = process.env.REPORTS_TABLE;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * List upcoming scheduled reports.
 *
 * @param {{ queryStringParameters?: { filter?: 'future' } }} event API event.
 * @returns {Promise<{ statusCode: number, headers?: { [x: string]: string }, body?: string }>}
 */
exports.handler = async (event) => {
  const allSchedules = await DDB.query({
    TableName: REPORTS_TABLE,
    IndexName: 'Schedule',
    KeyConditionExpression: '#source = :source AND #scheduledTimestamp > :now',
    ExpressionAttributeNames: {
      '#source': 'Source',
      '#scheduledTimestamp': 'ScheduledTimestamp',
    },
    ExpressionAttributeValues: {
      ':source': 'schedule',
      ':now': Date.now(),
    },
  }).promise();

  const items = allSchedules.Items.map((item) => ({ id: item.Id, url: item.Url, schedule: new Date(item.ScheduledTimestamp), mention: item.Mention || null }));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(items),
  };
};
