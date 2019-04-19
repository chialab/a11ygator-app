const crypto = require('crypto');

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
  if (!checkSignature(event.headers['x-twitter-webhooks-signature'], event.body, CONSUMER_SECRET)) {
    console.error('Bad Twitter Webhooks Signature:', event.headers['x-twitter-webhooks-signature']);

    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Bad X-Twitter-Webhooks-Signature' }),
    };
  }

  console.log('Twitter Webhooks Signature check OK');
  console.log(event.body);

  return {
    statusCode: 204,
  };
};
