const crypto = require('crypto');
const AWS = require('aws-sdk');

const SQS_QUEUE = process.env.SQS_QUEUE;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

const SQS = new AWS.SQS({ apiVersion: '2012-11-05' });

/**
 * Standardize headers by turning all keys to lower-case.
 *
 * @param {{[x: string]: string}} headers Headers.
 * @returns {{[x: string]: string}}
 */
const stdHeaders = (headers) => {
  const stdHeaders = {};
  Object.keys(headers).forEach((key) => {
    stdHeaders[key.toLowerCase()] = headers[key];
  });

  return stdHeaders;
};

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

exports.handler = async (event) => {
  // Validate Twitter Webhooks Signature.
  const headers = stdHeaders(event.headers || {});
  const signature = headers['x-twitter-webhooks-signature'];
  if (!signature || !checkSignature(signature, event.body, CONSUMER_SECRET)) {
    console.error('Bad Twitter Webhooks Signature:', signature);

    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Bad X-Twitter-Webhooks-Signature' }),
    };
  }

  console.log('Twitter Webhooks Signature check OK');
  try {
    const body = JSON.parse(event.body);

    if (!Array.isArray(body.tweet_create_events) || body.tweet_create_events.length === 0) {
      // Nothing to do.
      return { statusCode: 204 };
    }

    // Filter tweets, and prepare messaged to be sent to queue.
    const currentUserId = body.for_user_id;
    const messages = body.tweet_create_events
      .filter((tweet) => {
        if (tweet.is_quote_status || tweet.retweeted_status) {
          // Ignore retweets and quoted tweets.
          return false;
        }

        if (!tweet.entities || !tweet.entities.urls || tweet.entities.urls.length === 0) {
          // Ignore tweets without URLs.
          return false;
        }

        // Check if current user is among mentioned users.
        const mentions = tweet.entities.user_mentions || [];

        return mentions.some((elem) => elem.id_str === currentUserId);
      })
      .map((tweet) => ({ Id: tweet.id_str, MessageBody: JSON.stringify(tweet) }));

    if (messages.length === 0) {
      // Nothing to do.
      return { statusCode: 204 };
    }

    // Send messages to queue.
    await SQS.sendMessageBatch({ QueueUrl: SQS_QUEUE, Entries: messages }).promise();

    return { statusCode: 204 };
  } catch (error) {
    console.log('Error', error);

    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid JSON payload' }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An internal error occurred' }),
    };
  }
};
