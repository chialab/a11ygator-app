const Twit = require('twit');

const HOSTNAME = process.env.HOSTNAME;

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
  return `Here's your report!\nI found ${counts.error} errors, ${counts.warning} warnings, ${counts.notice} notices.\nVisit the link below to access the complete report https://${HOSTNAME}/api/reports/${id}?format=html`;
};

/**
 * Tweet answer to a tweet for which report was successfully generated.
 *
 * @param {{ id: string, url: string, report: Report, tweet: { id_str: string }, files: { report: string, screenshot: string } }} data Data.
 * @return {Promise<void>}
 */
const tweetReport = async ({ id, report, tweet }) => {
  const formattedMessage = formatMessage(id, report);
  console.time('Tweeting');
  await T.post('statuses/update', { status: formattedMessage, in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true});
  console.timeEnd('Tweeting');
};

/**
 * Tweet reply to a tweet for which report could not be generated because some error occurred.
 *
 * @param {{ url: string, tweet: { id_str: string } }} data Data.
 * @returns {Promise<void>}
 */
const tweetError = async ({ url, tweet }) => {
  const errorMessages = [
    'Oops something went wrong. Did you type a working address or are you just kidding me?',
    `Oops I couldn't reach ${url}.\nAre you sure it is correct?`,
    `Oops something went wrong reaching ${url}. It doesn't look like a working address to me... I hope you know what you are doing, mate.`,
    `Oops I couldn't reach ${url}.\nMaybe you mistyped it?`,
  ];

  // randomly select an error message
  const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];

  console.time('Tweeting');
  await T.post('statuses/update', { status: message, in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true });
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
        await tweetError(data);
      }
    } catch (err) {
      console.error(`Unable to generate report for request ${data.id}!`, JSON.stringify(data));
      console.error(err);
    }
  })
);
