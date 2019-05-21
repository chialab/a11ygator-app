const AWS = require('aws-sdk');
const Twit = require('twit');

const S3_BUCKET = process.env.S3_BUCKET;
const HOSTNAME = process.env.HOSTNAME;

const S3 = new AWS.S3({ apiVersion: '2006-03-01' });

/** @typedef {'notice' | 'warning' | 'error'} IssueType */
/** @typedef {{ issues: { type: IssueType }[], counts: { [x in IssueType]: number } }} Report */

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.OAUTH_TOKEN,
  access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});

/**
 * Format raw report from A11ygator into a tweet.
 *
 * @param {string} id Analysis ID.
 * @param {Report} report Report data.
 * @return {string}
 */
const formatMessage = (id, report) => {
  const counts = report.counts;
  console.log(`Report: ${counts.error} ERRORS / ${counts.warning} WARNINGS / ${counts.notice} NOTICES`);

  // TODO differentiate message for high/medium/low number of errors
  return `Here's your report!\nI found ${counts.notice} notices, ${counts.warning} warnings, ${counts.error} errors.\nClick here for the full report => https://${HOSTNAME}/api/reports/${id}?format=html`;
};

/**
 * Upload a media on Twitter, and return media ID.
 *
 * @param {string} url The analyzed URL.
 * @param {string} key The S3 key where screenshot is saved.
 * @return {Promise<string>}
 */
const uploadMedia = async (url, key) => {
  console.log(`Fetching s3://${S3_BUCKET}/${key} ...`);
  console.time('Fetch from S3');
  const screenshot = await S3.getObject({ Bucket: S3_BUCKET, Key: key }).promise();
  const size = screenshot.Body.byteLength;
  const mimeType = screenshot.ContentType || 'image/png';
  console.time('Fetch from S3');

  const chunkSize = 1024 * 512; // 512 kb
  let offset = 0;
  const chunks = [];
  while (offset < size) {
    chunks.push(screenshot.Body.slice(offset, offset + chunkSize));
    offset += chunkSize;
  }

  console.log('Uploading media to Twitter...');
  console.time('Media');
  console.timeLog('Media', 'INIT START');
  const init = await T.post('media/upload', { command: 'INIT', total_bytes: size, media_type: mimeType });
  const mediaId = init.data.media_id_string;
  console.timeLog('Media', 'INIT END', mediaId);
  await Promise.all(
    chunks.map(async (chunk, idx) => {
      console.timeLog('Media', `CHUNK ${idx} START`);
      await T.post('media/upload', { command: 'APPEND', media_id: mediaId, media_data: chunk.toString('base64'), segment_index: idx });
      console.timeLog('Media', `CHUNK ${idx} END`);
    })
  );
  console.timeLog('Media', 'FINALIZE START');
  await T.post('media/upload', { command: 'FINALIZE', media_id: mediaId });
  console.timeLog('Media', 'FINALIZE END');
  console.timeEnd('Media');

  const altText = `Screenshot of ${url} as it was tested by Allygator.`;
  console.log(`Setting alt-text for image ${mediaId}...`);
  console.time('Media Alt');
  try {
    await T.post('media/metadata/create', { media_id: mediaId, alt_text: { text: altText } });
  } catch (err) {
    console.error(`Unable to set alt-text for ${mediaId}!`, err);
  }
  console.timeEnd('Media Alt');

  return mediaId;
};

/**
 * Tweet answer to a tweet for which report was successfully generated.
 *
 * @param {{ id: string, url: string, report: Report, tweet: {}, files: { report: string, screenshot: string } }} data Data.
 * @return {Promise<void>}
 */
const tweetReport = async ({ id, url, report, tweet, files }) => {
  const formattedMessage = formatMessage(id, report);
  const mediaId = await uploadMedia(url, files.screenshot);

  console.time('Tweeting');
  await T.post('statuses/update', { status: formattedMessage, in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true, media_ids: mediaId });
  console.timeEnd('Tweeting');
};

/**
 * Lambda handler.
 *
 * @param {{ Records: { Sns: { Message: string } }[] }} event SNS event.
 * @returns {Promise<void>}
 */
exports.handler = async (event) => Promise.all(
  event.Records.map(async (evt) => {
    const data = JSON.parse(evt.Sns.Message);
    try {
      if (data.report) {
        console.log(`Report ${data.id} was successfully generated`);
        await tweetReport(data);
      } else {
        console.log(`Report ${data.id} resulted in an error`, data.error);
        // TODO;
      }
    } catch (err) {
      console.error(`Unable to generate report for request ${data.id}!`, JSON.stringify(data));
      console.error(err);
    }
  })
);
