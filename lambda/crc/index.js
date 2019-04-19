const crypto = require('crypto');

const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

/**
 * Creates a HMAC SHA-256 hash created from the challenge token and your app Consumer Secret.
 *
 * @param {string} crcToken The token provided by the incoming GET request.
 * @param {string} consumerSecret App's Consumer Secret.
 * @return {string}
 */
const getChallengeResponse = (crcToken, consumerSecret) => crypto.createHmac('sha256', consumerSecret)
  .update(crcToken)
  .digest('base64');

exports.handler = async (event) => {
  const crcToken = event.queryStringParameters.crc_token;
  const responseToken = `sha256=${getChallengeResponse(crcToken, CONSUMER_SECRET)}`;

  return {
    statusCode: 200,
    body: JSON.stringify({ response_token: responseToken }),
  };
};
