const AWS = require('aws-sdk');
const htmlReporter = require('./reporter.js');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
const HOSTNAME = process.env.HOSTNAME;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const S3 = new AWS.S3({ apiVersion: '2006-03-01' });

/** @typedef {'notice' | 'warning' | 'error'} IssueType */
/** @typedef {{ issues: { type: IssueType }[], counts: { [x in IssueType]: number }, timestamp: number }} Report */

const CONTENT_TYPE = {
  html: 'text/html',
  json: 'application/json',
};

/** Error representing a missing report. */
class ReportNotFoundError extends Error {
  constructor() {
    super('Record not found');
  }
}

/**
 * Check if report is ready.
 *
 * @param {string} id Report ID.
 * @returns {Promise<boolean>}
 */
const isReportReady = async (id) => {
  console.time('Get info');
  const info = await DDB.get({ TableName: REPORTS_TABLE, Key: { Id: id } }).promise();
  console.timeEnd('Get info');

  if (!info.Item) {
    throw new ReportNotFoundError();
  }
  if (info.Item.ReportError) {
    throw new Error(info.Item.ReportError);
  }

  return !!info.Item.CompletedTimestamp;
};

/**
 * Fetch report data from ID.
 *
 * @param {string} id Report ID.
 * @returns {Promise<Report | null>}
 */
const getReport = async (id) => {
  const key = `reports/${id}.json`;
  console.log(`Fetching s3://${S3_BUCKET}/${key} ...`);
  console.time('Fetch from S3');
  const report = await S3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
  console.timeEnd('Fetch from S3');

  return JSON.parse(report.Body.toString());
};

/**
 * Get and format report data.
 *
 * @param {{ httpMethod: 'HEAD' | 'GET', pathParameters: { id: string }, queryStringParameters?: { format?: 'html' | 'json' } }} event Report view event.
 * @returns {Promise<{ statusCode: number, headers?: { [x: string]: string }, body?: string }>}
 */
exports.handler = async (event) => {
  const method = event.httpMethod;
  const id = event.pathParameters.id;
  const format = event.queryStringParameters && event.queryStringParameters.format || 'json';
  const headers = { 'Content-Type': CONTENT_TYPE[format] };

  try {
    const isReady = await isReportReady(id);
    if (!isReady) {
      return {
        statusCode: 204,
        headers: {
          'Expires': 'Mon, 26 Jul 1997 05:00:00 GMT',
          'Last-Modified': (new Date()).toGMTString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
        },
      };
    }

    let body = undefined;
    if (method === 'GET') {
      const report = await getReport(id);
      body = JSON.stringify(report);
      if (format === 'html') {
        report.screenPath = `https://${HOSTNAME}/screenshots/${id}-full.png`;
        body = await htmlReporter.results(report);
      }
    }

    return { statusCode: 200, headers, body };
  } catch (err) {
    let statusCode = 422;
    if (err instanceof ReportNotFoundError) {
      statusCode = 404;
    }

    let body = JSON.stringify({ message: err.message });
    if (format === 'html') {
      body = `<!DOCTYPE html><html><head><title>${err.message}</title><body><h1>${err.message}</h1></body></html>`;
    }

    return { statusCode, headers, body };
  }
};
