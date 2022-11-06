import {
  ETwitterStreamEvent,
  TweetStream,
  TwitterApi,
  ETwitterApiError,
  TweetV2SingleStreamResult,
} from 'twitter-api-v2';

import { writeFileSync, readFileSync } from 'fs';
import { FROM_RULES, TO_RULES } from '@/utils/constants/twitter';
import { Prisma, Tweet } from '@prisma/client';
import upsertTweet from '@/utils/prisma/tweet';
// import path from 'path';

const bearer = process.env.APP_BEARER_TOKEN ?? '';

const twitterClient = new TwitterApi(bearer);

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
      'non_public_metrics',
      'organic_metrics',
      'possibly_sensitive',
      'promoted_metrics',
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
      console.log('Twitter has sent something:', eventData);
      const content = readFileSync('./data.json', {
        encoding: 'utf8',
      });
      console.log('current current: ', { content });

      const file = JSON.parse(content);
      file.push(eventData);

      writeFileSync('./data.json', JSON.stringify(file));
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
  const ruleTags = tweetData.matching_rules.map((item) => item.tag);

  const { data } = tweetData;

  if (ruleTags.includes(FROM_RULES)) {
    const tweet: Tweet = {
      id: data.id,
      authorId: data.author_id ?? '',
      conversationId: data.conversation_id ?? '',
      createdAt: new Date(data?.created_at ?? ''),
      text: data.text,
      data: data as unknown as Prisma.JsonObject,
    };

    upsertTweet(tweet);
  }

  if (ruleTags.includes(TO_RULES)) {
  }
};
