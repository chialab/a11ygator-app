const AWS = require('aws-sdk');
const htmlReporter = require('./reporter.js');

const S3_BUCKET = process.env.S3_BUCKET;
const HOSTNAME = process.env.HOSTNAME;

const S3 = new AWS.S3({ apiVersion: '2006-03-01' });

/** @typedef {'notice' | 'warning' | 'error'} IssueType */
/** @typedef {{ issues: { type: IssueType }[], counts: { [x in IssueType]: number } }} Report */

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
  const report = await S3.getObject({ Bucket: S3_BUCKET, Key: key })
    .promise()
    .catch((err) => {
      console.error('Error from S3, assuming report not ready.', err);

      return { Body: Buffer.from(JSON.stringify('null')) };
    });
  console.timeEnd('Fetch from S3');

  return JSON.parse(report.Body.toString());
}

/**
 * Get and format report data.
 *
 * @param {{ pathParameters: { id: string }, queryStringParameters: { format?: 'html' | 'json' } }} event Report view event.
 * @returns {Promise<{ report: string }>}
 */
exports.handler = async (event) => {
  const id = event.pathParameters.id;
  const format = event.queryStringParameters.format || 'json';
  const report = await getReport(id);

  switch (format) {
    case 'html':
      {
        const headers = { 'Content-Type': 'text/html' };
        if (report === null) {
          return { statusCode: 404, headers, body: `<!DOCTYPE html><html><head><title>Report not found</title><body><h1>Report not found</h1></body></html>` };
        }

        report.screenPath = `https://${HOSTNAME}/screenshots/${id}-full.png`; // TODO
        const html = await htmlReporter.results(report);

        return { statusCode: 200, headers, body: html };
      }

    case 'json':
    default:
      {
        const headers = { 'Content-Type': 'application/json' };
        if (report === null) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: 'Report not found' }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify(report) };
      }
  }
};
