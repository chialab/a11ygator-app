#!/usr/bin/env node

const util = require('util');
const Twit = require('twit');

const url = process.env.WEBHOOK_URL;
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.OAUTH_TOKEN,
  access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});

const get = util.promisify(T.get.bind(T));
const post = util.promisify(T.post.bind(T));
const del = util.promisify(T.delete.bind(T));

(async () => {
  // Fetch list of all webhooks.
  console.log('Fetching webhooks...');
  const webhooks = await get('account_activity/all/prod/webhooks');
  const found = webhooks.find((webhook) => webhook.url === url);
  if (found) {
    // Webhook already exists
    console.log(`Webhook is already registered with ID ${found.id}`);

    return;
  }

  if (webhooks.length > 0) {
    // Delete other webhooks before registering a new one.
    console.log('Deleting other webhooks...');
    await Promise.all(webhooks.map(async (webhook) => await del(`account_activity/all/prod/webhooks/${webhook.id}`)));
  }

  // Register webhook.
  console.log('Registering new webhook...');
  const webhook = await post('account_activity/all/prod/webhooks', { url });
  console.log(`Registered with ID ${webhook.id}`);
})();
