const schedule = require('node-schedule');

import { FROM_RULES, TO_RULES } from '@/utils/constants/twitter';
import { fromTwitterRule, toTwitterRule } from '@/utils/functions/twitterRules';
import { getTwitterUsernames } from '@/utils/prisma/users';
import { TwitterApi } from 'twitter-api-v2';

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
  const fromRules = fromTwitterRule(await getTwitterUsernames()); //@todo improve to split all users on arrays of rules
  const toRules = toTwitterRule(await getTwitterUsernames()); //@todo improve to split all users on arrays of rules

  await twitterClient.v2.updateStreamRules({
    add: [
      {
        value: fromRules,
        tag: FROM_RULES,
      },
      {
        value: toRules,
        tag: TO_RULES,
      },
    ],
  });
};

schedule.scheduleJob('*/1 * * * *', async function () {
  console.log('Updating rules...');
  const currentRules = await getAllRules();

  // Delete all rules. Comment the line below if you want to keep your existing rules.
  await deleteAllRules(currentRules);

  // // Add rules to the stream. Comment the line below if you don't want to add new rules.
  await setRules();

  console.log('Rules Updated!');
});
