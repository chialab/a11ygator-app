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

/**
 * Respond to Twitter CRC challenges.
 *
 * @param {{ crcToken: string }} event CRC token.
 * @returns {Promise<{ responseToken: string }>}
 */
exports.handler = async ({ crcToken }) => {
  const responseToken = `sha256=${getChallengeResponse(crcToken, CONSUMER_SECRET)}`;

  return { responseToken };
};
