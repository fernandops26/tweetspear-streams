const schedule = require('node-schedule');

import { fromTwitterRule } from '@/utils/functions/twitterRules';
import { getTwitterUsernames } from '@/utils/prisma/users';

import twitterClient from '@/utils/twitter/client';
import { upsertManyTweet } from '@/utils/prisma/tweet';

const pullRecentTweets = async () => {
  const fromQuery = fromTwitterRule(await getTwitterUsernames()); //@todo improve to split all users on arrays of rules

  console.log('from query:', fromQuery);

  const result = await twitterClient.v2.search(fromQuery, {
    expansions: [
      'author_id',
      'edit_history_tweet_ids',
      'attachments.media_keys',
      'attachments.poll_ids',
      'entities.mentions.username',
      'geo.place_id',
      'in_reply_to_user_id',
      'referenced_tweets.id',
      'referenced_tweets.id.author_id',
    ],
    'poll.fields': [
      'duration_minutes',
      'end_datetime',
      'id',
      'options',
      'voting_status',
    ],
    'media.fields': [
      'organic_metrics',
      'preview_image_url',
      'public_metrics',
      'height',
      'width',
      'url',
      'variants',
      'type',
      'media_key',
    ],
    'user.fields': [
      'created_at',
      'description',
      'entities',
      'id',
      'location',
      'name',
      'pinned_tweet_id',
      'profile_image_url',
      'protected',
      'public_metrics',
      'url',
      'username',
      'verified',
    ],
    'tweet.fields': [
      'attachments',
      'author_id',
      'context_annotations',
      'conversation_id',
      'created_at',
      'edit_controls',
      'entities',
      'geo',
      'id',
      'in_reply_to_user_id',
      'lang',
      'possibly_sensitive',
      'public_metrics',
      'reply_settings',
      'referenced_tweets',
      'source',
      'text',
      'withheld',
    ],
  });

  while (!result.done) {
    await result.fetchNext();
  }

  const tweets = result.tweets.map((data) => ({
    id: data.id,
    authorId: data.author_id ?? '',
    conversationId: data.conversation_id ?? '',
    createdAt: new Date(data?.created_at ?? ''),
    text: data.text,
    data,
  }));

  await upsertManyTweet(tweets);
};

const job = schedule.scheduleJob('*/15 * * * *', async function () {
  console.log('Pulling tweets...');

  await pullRecentTweets();

  console.log('Recent tweets pulled!');
});
