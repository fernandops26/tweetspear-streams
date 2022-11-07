import { ETwitterStreamEvent, TweetV2SingleStreamResult } from 'twitter-api-v2';

import { FROM_RULES, TO_RULES } from '@/utils/constants/twitter';
import { Prisma, Tweet } from '@prisma/client';
import { upsertTweet } from '@/utils/prisma/tweet';

import twitterClient from '@/utils/twitter/client';

export default async function () {
  const stream = await twitterClient.v2.searchStream({
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

  console.log('start stream');

  stream.on(
    // Emitted when Node.js {response} emits a 'error' event (contains its payload).
    ETwitterStreamEvent.ConnectionError,
    (err) => console.log('Connection error!', err)
  );

  stream.on(
    // Emitted when Node.js {response} is closed by remote or using .close().
    ETwitterStreamEvent.ConnectionClosed,
    () => console.log('Connection has been closed.')
  );

  stream.on(
    // Emitted when a Twitter payload (a tweet or not, given the endpoint).
    ETwitterStreamEvent.Data,
    (eventData) => {
      processTwitterData(eventData).then(() => console.log('stored'));
    }
  );

  stream.on(
    // Emitted when a Twitter sent a signal to maintain connection active
    ETwitterStreamEvent.DataKeepAlive,
    () => console.log('Twitter has a keep-alive packet.')
  );

  stream.autoReconnect = true;
}

const processTwitterData = async (tweetData: TweetV2SingleStreamResult) => {
  const { data, matching_rules } = tweetData;
  const ruleTags = matching_rules.map((item) => item.tag);

  if (ruleTags.includes(FROM_RULES)) {
    const tweet: Tweet = {
      id: data.id,
      authorId: data.author_id ?? '',
      conversationId: data.conversation_id ?? '',
      createdAt: new Date(data?.created_at ?? ''),
      text: data.text,
      data: data as unknown as Prisma.JsonObject,
    };

    await upsertTweet(tweet);
  }

  if (ruleTags.includes(TO_RULES)) {
    const tweet: Tweet = {
      id: data.id,
      authorId: data.author_id ?? '',
      conversationId: data.conversation_id ?? '',
      createdAt: new Date(data?.created_at ?? ''),
      text: data.text,
      data: data as unknown as Prisma.JsonObject,
    };

    await upsertTweet(tweet);
  }
};
