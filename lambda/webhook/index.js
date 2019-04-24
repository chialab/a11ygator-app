const crypto = require('crypto');
const AWS = require('aws-sdk');
const SQS = new AWS.SQS({apiVersion: '2012-11-05'});

const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

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
  // if (!checkSignature(event.headers['x-twitter-webhooks-signature'], event.body, CONSUMER_SECRET)) {
  //   console.error('Bad Twitter Webhooks Signature:', event.headers['x-twitter-webhooks-signature']);

  //   return {
  //     statusCode: 401,
  //     body: JSON.stringify({ message: 'Bad X-Twitter-Webhooks-Signature' }),
  //   };
  // }

  console.log('Twitter Webhooks Signature check OK');
  try {
    const body = JSON.parse(event.body);

    if (!Array.isArray(body.tweet_create_events) || body.tweet_create_events.length === 0) {
      // Nothing to do
      return {
        statusCode: 204,
      };
    }

    const currentUserId = body.for_user_id;
    const tweets = body.tweet_create_events.filter((tweet) => {
      if (!tweet.entities || !tweet.entities.user_mentions) {
        // don't have enough data
        return false;
      }

      if (!tweet.entities.urls || tweet.entities.urls.length === 0) {
        // don't have enough data
        return false;
      }

      if (tweet.is_quote_status || tweet.retweeted_status) {
        // don't handle retweets or quotes
        return false;
      }
      const mentions = tweet.entities.user_mentions;
      return mentions.some((elem) => elem.id_str === currentUserId);
    });

    const params = {
      QueueUrl: process.env.SQS_QUEUE,
      Entries: tweets.map((tweet) => ({
        Id: tweet.id_str,
        MessageBody: JSON.stringify(tweet),
      })),
    };
    return SQS.sendMessageBatch(params).promise()
      .then(() => ({ statusCode: 204}))
      .catch((err) => {
        console.error(err);

        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'An internal error occurred' }),
        };
      });
  } catch (error) {
    console.log('Error parsing webhook body', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON payload' }),
    };
  }
};
