const AWS = require('aws-sdk');
const chromium = require('chrome-aws-lambda');
const pa11y = require('pa11y');
const puppeteer = require('puppeteer');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const S3_BUCKET = process.env.S3_BUCKET;
const SNS_TOPIC = process.env.SNS_TOPIC;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

/** @typedef {'Section508' | 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA'} Standard */
/** @typedef {'notice' | 'warning' | 'error'} IssueType */
/** @typedef {{ issues: { type: IssueType }[], counts: { [x in IssueType]: number }, timestamp: number, standard: Standard }} Report */

const PA11Y_CONFIG = {
  includeNotices: true,
  includeWarnings: true,
  standard: 'WCAG2AA',
  wait: 2000,
  timeout: 15000,
  log: {
    debug: console.log.bind(console, '[Pa11y | Debug]'),
    error: console.error.bind(console, '[Pa11y | Error]'),
    info: console.log.bind(console, '[Pa11y | Info]'),
  },
};

/** Promise that will be resolved as soon as the browser has started. */
const browserDfd = chromium.executablePath
  .then((executablePath) => puppeteer.launch({ executablePath, args: chromium.args }));

/**
 * Generate a report for an enqueued message.
 *
 * @param {{ url: string, config?: { wait?: number, standard?: Standard } }} data Enqueued message data.
 * @returns {Promise<{ report: Report, screenshot: Buffer, fullPageScreenshot: Buffer }>}
 */
const newReport = async ({ url, config = {} }) => {
  // Open new page.
  console.time('Pa11y');

  console.time('Open Browser');
  const browser = await browserDfd;
  // const context = await browser.createIncognitoBrowserContext();
  const page = await browser.newPage();
  console.timeEnd('Open Browser');

  // Generate report and take screenshot afterwards.
  try {
    config = Object.assign({}, PA11Y_CONFIG, config, { browser, page });
    console.log(`Generating new report for ${url} (wait ${config.wait}ms)...`);

    console.time('Report');
    const report = await pa11y(url, config);
    report.timestamp = Date.now();
    report.standard = config.standard;
    report.counts = report.issues.reduce(
      (counts, issue) => {
        counts[issue.type]++;

        return counts;
      },
      { notice: 0, warning: 0, error: 0 }
    );
    console.timeEnd('Report');

    console.time('Screenshot');
    const [ screenshot, fullPageScreenshot ] = await Promise.all([
      page.screenshot({ fullPage: false, encoding: 'binary' }),
      page.screenshot({ fullPage: true, encoding: 'binary' }),
    ]);
    console.timeEnd('Screenshot');

    return { report, screenshot, fullPageScreenshot };
  } catch (err) {
    console.error('Pa11y failure', err);

    throw err;
  } finally {
    await page.close();
    // await context.close();
    console.timeEnd('Pa11y');
  }
};

/**
 * Save report and screenshot to S3.
 *
 * @param {stromg} id Report ID.
 * @param {Report} report Report data.
 * @param {Buffer} screenshot Screenshot binary data.
 * @param {Buffer} fullPagescreenshot Full-page screenshot binary data.
 * @returns {Promise<{ report: string, screenshot: string, fullPageScreenshot: string }>}
 */
const uploadReport = async (id, report, screenshot, fullPageScreenshot) => {
  const reportKey = `reports/${id}.json`;
  const screenshotKey = `screenshots/${id}.png`;
  const fullPageScreenshotKey = `screenshots/${id}-full.png`;

  console.time('Upload to S3');
  await Promise.all([
    S3.putObject({
      Bucket: S3_BUCKET,
      Key: reportKey,
      ContentType: 'application/json',
      Body: JSON.stringify(report),
    }).promise(),
    S3.putObject({
      Bucket: S3_BUCKET,
      Key: screenshotKey,
      ContentType: 'image/png',
      Body: screenshot,
    }).promise(),
    S3.putObject({
      Bucket: S3_BUCKET,
      Key: fullPageScreenshotKey,
      ContentType: 'image/png',
      Body: fullPageScreenshot,
    }).promise(),
  ]);
  console.timeEnd('Upload to S3');

  return { report: reportKey, screenshot: screenshotKey, fullPageScreenshot: fullPageScreenshotKey };
};

/**
 * Update report info in DynamoDB.
 *
 * @param {{ id: string, report?: Report, error?: Error }} data Report data.
 * @returns {Promise<void>}
 */
const updateInfo = async ({ id, report, error }) => {
  if (error) {
    await DDB.update({
      TableName: REPORTS_TABLE,
      Key: { Id: id },
      UpdateExpression: 'SET ReportError = :error',
      ExpressionAttributeValues: { ':error': error },
    }).promise();

    return;
  }

  await DDB.update({
    TableName: REPORTS_TABLE,
    Key: { Id: id },
    UpdateExpression: 'SET CompletedTimestamp = :timestamp, Issues = :issues, Standard = :standard',
    ExpressionAttributeValues: { ':timestamp': report.timestamp, ':issues': report.counts, ':standard': report.standard },
  }).promise();
};

/**
 * Generate reports for one or more enqueued messages.
 *
 * @param {{ Records: { body: string }[] }} event SQS messages.
 * @returns {Promise<string[]>}
 */
exports.handler = (event) => Promise.all(
  event.Records.map(async (message) => {
    const data = JSON.parse(message.body);
    try {
      const { report, screenshot, fullPageScreenshot } = await newReport(data);
      const files = await uploadReport(data.id, report, screenshot, fullPageScreenshot);
      delete report.issues; // Report was saved to S3. For SNS only keep aggregate data.
      data.report = report;
      data.files = files;
    } catch (err) {
      console.error('Got error', err);
      data.error = err.message;
      if (/net::[a-zA-Z0-9_]+/.test(err.message)) {
        data.error = /(net::[a-zA-Z0-9_]+)/.exec(err.message)[0];
      }
    }

    console.time('Update info');
    await updateInfo(data);
    console.timeEnd('Update info');

    console.time('Publish message');
    await SNS.publish({
      TopicArn: SNS_TOPIC,
      Message: JSON.stringify(data),
      MessageAttributes: {
        source: { DataType: 'String', StringValue: data.source },
      },
    }).promise();
    console.timeEnd('Publish message');

    return data.id;
  })
);
