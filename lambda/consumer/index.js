const Twit = require('twit');
const download = require('./download.js');

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.OAUTH_TOKEN,
  access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});

const A11YGATOR_URL = 'https://a11ygator.chialab.io';

/**
 * Process a Tweet that mentions our bot.
 *
 * @param {Object} tweet Tweet object from Twitter API.
 * @return {void}
 */
const processTweet = async (tweet) => {
  const results = await a11ygate(tweet.entities.urls[0].expanded_url);
  const formattedMessage = formatMessage(results);
  console.log('About to tweet:', formattedMessage);
  const mediaId = await getMediaId(`${A11YGATOR_URL}/${results.screenPath}`);
  return T.post('statuses/update', { status: formattedMessage, in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true, media_ids: mediaId })
    .then((res) => {
      console.log('res', res);
    })
    .catch((err) => {
      console.log('error', err);
    });
};

/**
 * Handler for lambda.
 * @param {Object} event
 * @return {Promise}
 */
exports.handler = async (event) => {
  const messages = event.Records;
  const promises = messages.map((message) => processTweet(JSON.parse(message.body)));
  return Promise.all(promises);
};

/**
 * Unleash the A11ygator against the poor website.
 *
 * @param {string} url url to test
 * @returns {Object} test results
 */
const a11ygate = async (url) => {
  const res = await download(`${A11YGATOR_URL}/report?url=${encodeURIComponent(url)}`);
  console.log('A11yJSON', res.toString().slice(0, 100));

  return JSON.parse(res.toString());
};

/**
 * Format raw results from A11ygator API.
 *
 * @param {Object} results json result from a11ygator
 * @return {string} formatted message
 */
const formatMessage = (results) => {
  const counts = {
    notice: 0,
    warning: 0,
    error: 0,
  };
  results.issues.forEach((issue) => {
    counts[issue['type']]++;
  });

  // TODO differentiate message for high/medium/low number of errors
  return `Here's your report!
  I found ${counts.notice} notices, ${counts.warning} warnings, ${counts.error} errors.
  Click here for the full report => ${A11YGATOR_URL}/report?url=${results.pageUrl}&format=html`;
};

/**
 * Returns media id for embed the media on a Tweet.
 *
 * @param {string} mediaUrl
 * @return {Promise<string>} a Promise that resolves to media id string
 */
const getMediaId = async (mediaUrl) => {
  const binaryImage = await download(mediaUrl);
  console.log('Got the binary image');

  // First we must post the media to Twitter
  const mediaId = await T.post('media/upload', { media_data: binaryImage })
    .then((res) => res.media_id_string)
    .catch((err) => console.error('error in media/upload', err));

  const altText = 'Screenshot of the requested web page to test.';
  const meta_params = { media_id: mediaId, alt_text: { text: altText } }

  // Then we upload metadata for image
  return T.post('media/metadata/create', meta_params)
    .then(() => mediaId)
    .catch((err) => console.error('error in media/metadata/create', err));
};
