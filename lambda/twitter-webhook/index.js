const crypto = require('crypto');
const { URL } = require('url');
const AWS = require('aws-sdk');
const uuid4 = require('uuid/v4');

const REPORTS_TABLE = process.env.REPORTS_TABLE;
const REPORTS_QUEUE = process.env.REPORTS_QUEUE;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

const DDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });

/**
 * Creates a HMAC SHA-256 hash created from a payload and your app Consumer Secret.
 *
 * @param {string} signature The signature provided in incoming POST request headers.
 * @param {string} payload The payload of the incoming POST request.
 * @param {string} consumerSecret App's Consumer Secret.
 * @return {string}
 */
const checkSignature = (signature, payload, consumerSecret) => {
  const prefix = 'sha256=';
  if (!signature.startsWith(prefix)) {
    return false;
  }

  const actual = Buffer.from(signature.substr(prefix.length), 'base64');
  const expected = crypto.createHmac('sha256', consumerSecret)
    .update(payload)
    .digest();

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

/**
 * Remove duplicates from tweets list.
 *
 * @param {{ tweet: { id_str: string } }[]} tweets Array of tweets.
 * @returns {Promise<{ tweet: { id_str: string } }[]>}
 */
const dedupeTweets = async (tweets) => {
  const tweetIds = tweets.map(({ tweet }) => tweet.id_str);
  const keyCondExpr = tweetIds.map((_, idx) => `TweetId = :tweetId${idx}`).join(' OR ');
  const exprAttrValues = tweetIds.reduce((map, tweetId, idx) => {
    map[`:tweetId${idx}`] = tweetId;

    return map;
  }, {});

  console.time('Query database');
  const found = await DDB.query({
    TableName: REPORTS_TABLE,
    IndexName: 'TweetId',
    KeyConditionExpression: keyCondExpr,
    ExpressionAttributeValues: exprAttrValues,
  }).promise();
  console.timeEnd('Query database');
  const alreadyEnqueuedTweetIds = found.Items.map((item) => item.TweetId);

  return tweets.filter(({ tweet }) => !alreadyEnqueuedTweetIds.includes(tweet.id_str));
};

/**
 * Send report generation requests received via Twitter to SQS queue.
 *
 * @param {{ signature: string, body: string }} event Twitter payload.
 * @returns {Promise<void>}
 */
exports.handler = async ({ signature, body }) => {
  // Validate Twitter Webhooks Signature.
  if (!checkSignature(signature, body, CONSUMER_SECRET)) {
    console.error('Bad Twitter Webhooks Signature:', signature);

    throw new Error('Bad X-Twitter-Webhooks-Signature');
  }
  console.log('Twitter Webhooks Signature check OK');

  const data = JSON.parse(body);
  if (!Array.isArray(data.tweet_create_events) || data.tweet_create_events.length === 0) {
    // Nothing to do.
    return;
  }

  // Filter tweets, and prepare messages to be sent to queue.
  const currentUserId = data.for_user_id;
  let tweets = data.tweet_create_events
  .filter((tweet) => {
    console.log(JSON.stringify(tweet))
    if (currentUserId === tweet.user.id_str) {
        // Ignore A11ygator tweets quoting himself.
        return false;
      }

      if (!tweet.entities || !tweet.entities.urls || tweet.entities.urls.length === 0) {
        // Ignore tweets without URLs.
        return false;
      }

      const mentions = tweet.entities.user_mentions || [];
      if (!mentions.some((elem) => elem.id_str === currentUserId)) {
        // Ignore tweets where current user is not amongst mentioned users.
        return false;
      }

      if (tweet.retweeted_status) {
        // Ignore retweets.
        return false;
      }

      return true;
    })
    .map((tweet) => ({
      id: uuid4(),
      date: new Date(tweet.created_at),
      author: `@${tweet.user.screen_name}`,
      url: new URL(tweet.entities.urls[0].expanded_url),
      tweet,
    }));
  if (tweets.length === 0) {
    // Nothing to do.
    return;
  }

  // Remove tweets that had already been enqueued.
  // This is useful in case the webhook is called twice with the same payload.
  tweets = await dedupeTweets(tweets);
  if (tweets.length === 0) {
    // Nothing to do.
    return;
  }

  // Save info to DynamoDB.
  const items = tweets.map(({ id, date, author, url, tweet }) => ({
    PutRequest: {
      Item: {
        Id: id,
        TweetId: tweet.id_str,
        Url: url.toString(),
        Hostname: url.hostname,
        Requester: author,
        Timestamp: date.valueOf(),
        Source: 'twitter',
      },
    },
  }));
  console.time('Save info');
  await DDB.batchWrite({ RequestItems: { [REPORTS_TABLE]: items } }).promise();
  console.timeEnd('Save info');

  // Send messages to queue.
  const messages = tweets.map(({ id, url, tweet }) => ({
    Id: tweet.id_str,
    MessageBody: JSON.stringify({ id, url, tweet, source: 'twitter' }),
  }));
  console.time('Enqueue requests');
  await SQS.sendMessageBatch({ QueueUrl: REPORTS_QUEUE, Entries: messages }).promise();
  console.timeEnd('Enqueue requests');
};
