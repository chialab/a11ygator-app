#!/usr/bin/env node

const path = require('path');
const { URL } = require('url');

process.env.AWS_SDK_LOAD_CONFIG = '1';
const AWS = require('aws-sdk');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const S3 = new AWS.S3({ apiVersion: '2006-03-01' });

(async () => {
  const reports = await S3.listObjects({ Bucket: S3_BUCKET, Prefix: 'reports/' }).promise();
  await Promise.all(reports.Contents.map(async (object) => {
    const id = path.basename(object.Key, '.json');
    const info = await DDB.get({ TableName: REPORTS_TABLE, Key: { Id: id }}).promise();
    if (info.Item) {
      // Already in DB.
      return;
    }

    const data = await S3.getObject({ Bucket: S3_BUCKET, Key: object.Key }).promise();
    const report = JSON.parse(data.Body.toString());

    const url = new URL(report.pageUrl);
    const hostname = url.hostname;
    const timestamp = report.timestamp || data.LastModified.valueOf();
    const counts = report.counts || report.issues.reduce(
      (counts, issue) => {
        counts[issue.type]++;

        return counts;
      },
      { notice: 0, warning: 0, error: 0 }
    );

    report.counts = counts;
    report.timestamp = timestamp;

    const item = {
      Id: id,
      Url: url.toString(),
      Hostname: hostname,
      Timestamp: timestamp,
      CompletedTimestamp: timestamp,
      Issues: counts,
    };

    await DDB.put({ TableName: REPORTS_TABLE, Item: item }).promise();
    await S3.putObject({ Bucket: S3_BUCKET, Key: object.Key, Body: JSON.stringify(report) }).promise();
  }));
})();
