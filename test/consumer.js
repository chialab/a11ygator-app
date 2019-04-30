const { handler } = require('../lambda/consumer/index');

const tweet = JSON.stringify({
  id_str: '1123245588005490688',
  entities: {
    urls: [
      {
        expanded_url: 'http://chialab.io',
      },
    ],
  },
});
const event = {
  Records: [
    { body: tweet },
  ],
};

handler(event)
  .then(console.log)
  .catch(console.error);
