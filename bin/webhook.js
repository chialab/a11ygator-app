#!/usr/bin/env node

const Twit = require('twit');

const url = process.env.WEBHOOK_URL;
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.OAUTH_TOKEN,
  access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});

(async () => {
  // Fetch list of all webhooks.
  console.log('Fetching webhooks...');
  const webhooks = await T.get('account_activity/all/prod/webhooks');
  const found = webhooks.data.find((webhook) => webhook.url === url);
  if (found) {
    // Webhook already exists
    console.log(`Webhook is already registered with ID ${found.id}`);

    return;
  }

  if (webhooks.data.length > 0) {
    // Delete other webhooks before registering a new one.
    console.log('Deleting other webhooks...');
    await Promise.all(webhooks.data.map(async (webhook) => await T.delete(`account_activity/all/prod/webhooks/${webhook.id}`)));
  }

  // Register webhook.
  console.log('Registering new webhook...');
  const webhook = await T.post('account_activity/all/prod/webhooks', { url });
  console.log(`Registered with ID ${webhook.data.id}`);
})();
