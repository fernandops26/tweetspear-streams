const schedule = require('node-schedule');
import {
  ETwitterStreamEvent,
  TweetStream,
  TwitterApi,
  ETwitterApiError,
} from 'twitter-api-v2';

const bearer = process.env.APP_BEARER_TOKEN ?? '';

const twitterClient = new TwitterApi(bearer);

const getAllRules = async () => {
  const rules = await twitterClient.v2.streamRules();
  console.log({ rules });

  return rules;
};

const deleteAllRules = async (rules: any) => {
  if (!Array.isArray(rules.data)) {
    return;
  }
  console.log({ data: rules.data });

  const ids = rules.data.map((rule: any) => rule.id);

  console.log('to remove ', { ids });

  await twitterClient.v2.updateStreamRules({
    delete: {
      ids,
    },
  });
};

const setRules = async () => {
  const usernamesRule = ['fernandops26']
    .map((user) => `from:${user}`)
    .join(' OR ');

  await twitterClient.v2.updateStreamRules({
    add: [
      {
        value: usernamesRule,
        tag: 'asd',
      },
    ],
  });
};

const job = schedule.scheduleJob('*/1 * * * *', async function () {
  const currentRules = await getAllRules();

  // Delete all rules. Comment the line below if you want to keep your existing rules.
  await deleteAllRules(currentRules);

  // // Add rules to the stream. Comment the line below if you don't want to add new rules.
  await setRules();

  console.log('The answer to life, the universe, and everything!');
});
