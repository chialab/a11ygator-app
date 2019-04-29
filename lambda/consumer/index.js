const util = require('util');
const Twit = require('twit');

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.OAUTH_TOKEN,
  access_token_secret: process.env.OAUTH_TOKEN_SECRET,
});
const post = util.promisify(T.post.bind(T));

const processTweet = (tweet) => {
  const status = `Il mio primo tweet! Che bello questo url => ${tweet.entities.urls[0].expanded_url}`;
  return post('statuses/update', { status, in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true })
    .then((res) => {
      console.log('res', res);
    })
    .catch((err) => {
      console.log('error', err);
    });
};

exports.handler = async(event) => {
  const messages = event.Records;
  const promises = messages.map((message) => processTweet(JSON.parse(message.body)));
  return Promise.all(promises);
};
