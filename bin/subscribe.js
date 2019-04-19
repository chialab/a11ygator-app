#!/usr/bin/env node

const util = require('util');
const Twit = require('twit');

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.OAUTH_TOKEN,
  access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});

const get = util.promisify(T.get.bind(T));
const post = util.promisify(T.post.bind(T));

(async () => {
  try {
    // Check if user is already subscribed.
    console.log('Fetching subscriptions...');
    await get('account_activity/all/prod/subscriptions');
    console.log('User is already subscribed!');
  } catch {
    // Upon failure, means that the user is not subscribed.
    console.log('Subscribing user...');
    await post('account_activity/all/prod/subscriptions');
    console.log('Subscribed!');
  }
})();
