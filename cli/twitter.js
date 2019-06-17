const prompts = require('prompts');
const Twit = require('twit');

const { spinner } = require('./index.js');

/** @typedef {{ consumerKey: string, consumerSecret: string, oauthToken: string, oauthTokenSecret: string }} TwitterConfig */

/**
 * Initialize Twitter client.
 *
 * @param {Partial<TwitterConfig>} args Twitter configuration.
 * @returns {Promise<Twit>}
 */
const getTwitterClient = async (config) => {
  if (!config.consumerKey || !config.consumerSecret || !config.oauthToken || !config.oauthTokenSecret) {
    config = await prompts([
      {
        name: 'consumerKey',
        type: 'text',
        message: 'Twitter application Consumer key:',
        initial: config.consumerKey,
      },
      {
        name: 'consumerSecret',
        type: 'password',
        message: 'Twitter application Consumer secret:',
        initial: config.consumerSecret,
      },
      {
        name: 'oauthToken',
        type: 'text',
        message: 'Twitter user OAuth token:',
        initial: config.oauthToken,
      },
      {
        name: 'oauthTokenSecret',
        type: 'password',
        message: 'Twitter user OAuth token secret:',
        initial: config.oauthTokenSecret,
      },
    ]);
  }

  return new Twit({
    consumer_key: config.consumerKey,
    consumer_secret: config.consumerSecret,
    access_token: config.oauthToken,
    access_token_secret: config.oauthTokenSecret,
  });
};

/**
 * Ensure Webhook URL is registered.
 * If necessary, unregister other webhooks.
 *
 * @param {Partial<TwitterConfig> & { webhookUrl?: string | URL }} args Command arguments.
 * @returns {Promise<void>}
 */
exports.registerWebhook = async (args) => {
  const T = await getTwitterClient(args);
  const url = args.webhookUrl;

  // Fetch list of all webhooks.
  spinner.prefixText = 'Fetching webhooks...';
  spinner.start();
  const webhooks = await T.get('account_activity/all/prod/webhooks');
  const found = webhooks.data.find((webhook) => webhook.url === url.toString());
  if (found) {
    // Webhook already exists.
    spinner.info(`webhook already registered [${found.id}]`);

    return;
  }

  spinner.succeed('done');
  if (webhooks.data.length > 0) {
    // Delete other webhooks before registering a new one.
    spinner.prefixText = 'Deleting other webhooks...';
    spinner.start();
    await Promise.all(webhooks.data.map(async (webhook) => await T.delete(`account_activity/all/prod/webhooks/${webhook.id}`)));
    spinner.succeed('done');
  }

  // Register webhook.
  spinner.prefixText = 'Registering new webhook...';
  spinner.start();
  const webhook = await T.post('account_activity/all/prod/webhooks', { url });
  spinner.succeed(`registered [${webhook.data.id}]`);
};

/**
 * Ensure application is registered to Twitter user's account activity.
 *
 * @param {Partial<TwitterConfig>} args Command arguments.
 * @returns {Promise<void>}
 */
exports.subscribe = async (args) => {
  const T = await getTwitterClient(args);
  try {
    // Check if user is already subscribed.
    spinner.prefixText = 'Fetching subscriptions...';
    spinner.start();
    await T.get('account_activity/all/prod/subscriptions');
    spinner.info('user already subscribed');
  } catch {
    // Upon failure, means that the user is not subscribed.
    spinner.succeed('done');
    spinner.prefixText = 'Subscribing user...';
    spinner.start();
    await T.post('account_activity/all/prod/subscriptions');
    spinner.succeed('done');
  }
};
