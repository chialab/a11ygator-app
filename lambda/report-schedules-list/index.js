const AWS = require('aws-sdk');

const REPORTS_TABLE = process.env.REPORTS_TABLE;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Start state machine with report generation requests received via API Gateway.
 *
 * @param {{ queryStringParameters?: { filter?: 'future' } }} event API event.
 * @returns {Promise<{ headers: {} }>}
 */
exports.handler = async (event) => {
  const allSchedules = await DDB.query({
    TableName: REPORTS_TABLE,
    IndexName: 'Schedule',
    KeyConditionExpression: 'Source = :source AND ScheduledTimestamp > :now',
    ExpressionAttributeValues: {
      ':source': 'schedule',
      ':now': Date.now(),
    },
  }).promise();

  const items = allSchedules.Items.map((item) => ({ id: item.Id, url: item.Url, schedule: new Date(ScheduledTimestamp), mention: item.Mention || null }));

  return {
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(items),
  };
};
