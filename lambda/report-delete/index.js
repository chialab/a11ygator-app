const AWS = require('aws-sdk');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
const SCHEDULED_REPORTS_STATE_MACHINE = process.env.SCHEDULED_REPORTS_STATE_MACHINE;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const StepFunctions = new AWS.StepFunctions({ apiVersion: '2016-11-23' });

/**
 * Get info stored in DynamoDB for a report.
 *
 * @param {string} id Report ID.
 * @returns {Promise<{ Source: string, CompletedTimestamp?: number, ReportError?: any, ScheduledTimestamp?: number } | null>}
 */
const getInfo = async (id) => {
  console.time('Reading report info from DynamoDB');
  const info = await DDB.get({
    TableName: REPORTS_TABLE,
    Key: { Id: id },
  }).promise();
  console.timeEnd('Reading report info from DynamoDB');
  if (!info.Item) {
    return null;
  }

  return info.Item;
};

/**
 * Delete all report data from S3 (JSON and screenshots).
 *
 * @param {string} id Report ID.
 * @returns {Promise<void>}
 */
const deleteReportData = async (id) => {
  const reportKey = `reports/${id}.json`;
  const screenshotKey = `screenshots/${id}.png`;
  const fullPageScreenshotKey = `screenshots/${id}-full.png`;

  console.time('Deleting report data from S3');
  await Promise.all([
    S3.deleteObject({
      Bucket: S3_BUCKET,
      Key: reportKey,
    }).promise(),
    S3.deleteObject({
      Bucket: S3_BUCKET,
      Key: screenshotKey,
    }).promise(),
    S3.deleteObject({
      Bucket: S3_BUCKET,
      Key: fullPageScreenshotKey,
    }).promise(),
  ]);
  console.timeEnd('Deleting report data from S3');
};

/**
 * Stop step function execution that would eventually enqueue report generation.
 *
 * @param {string} id Report ID.
 * @param {string} cause Abort cause.
 * @returns {Promise<void>}
 */
const stopStepFunction = async (id, cause = 'Aborted via API') => {
  console.time('Listing step function executions');
  const list = await StepFunctions.listExecutions({
    stateMachineArn: SCHEDULED_REPORTS_STATE_MACHINE,
    statusFilter: 'RUNNING',
  }).promise();
  console.timeEnd('Listing step function executions');

  const execution = list.executions.find((exec) => exec.name === id);
  if (!execution) {
    console.error(`Could not find an execution with name "${id}".`);

    return;
  }

  console.time('Stopping step function execution');
  await StepFunctions.stopExecution({
    executionArn: execution.executionArn,
    cause,
  }).promise();
  console.timeEnd('Stopping step function execution');
};

/**
 * Delete report info stored on DynamoDB.
 *
 * @param {string} id Report ID.
 * @returns {Promise<void>}
 */
const deleteInfo = async (id) => {
  console.time('Deleting report info from DynamoDB');
  await DDB.delete({
    TableName: REPORTS_TABLE,
    Key: { Id: id },
  }).promise();
  console.timeEnd('Deleting report info from DynamoDB');
};

/**
 * Start state machine with report generation requests received via API Gateway.
 *
 * @param {{ pathParameters: { id: string }, requestContext: { identity: { userArn: string, sourceIp: string } } }} event API event.
 * @returns {Promise<{ statusCode: number, headers?: { [x: string]: string }, body?: string }>}
 */
exports.handler = async ({ pathParameters, requestContext }) => {
  const { id } = pathParameters;

  const info = await getInfo(id);
  if (!info) {
    // Already deleted.
    return { statusCode: 204 };
  }

  if (info.CompletedTimestamp) {
    // Report was uploaded.
    await deleteReportData(id);
  } else if (info.Source === 'schedule' && info.ScheduledTimestamp > Date.now()) {
    // Abort scheduled report.
    await stopStepFunction(id, `Aborted by ${requestContext.identity.userArn} - IP: ${requestContext.identity.sourceIp}`);
  } else if (!info.ReportError) {
    // Report is neither completed nor scheduled, thus is being generated right now.
    // Refuse to delete a report being generated now to avoid creating orphaned files on S3.
    const message = `Refusing to delete a report that is being generated right now: ${id}`;

    return {
      statusCode: 423,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    };
  }

  // Delete report info from DynamoDB.
  await deleteInfo(id);

  return { statusCode: 204 };
};
