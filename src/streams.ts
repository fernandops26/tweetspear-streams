import {
  ETwitterStreamEvent,
  TweetStream,
  TwitterApi,
  ETwitterApiError,
} from 'twitter-api-v2';

const bearer = process.env.APP_BEARER_TOKEN ?? '';

const twitterClient = new TwitterApi(bearer);

export default async function () {
  const stream = await twitterClient.v2.searchStream({
    expansions: ['author_id', 'edit_history_tweet_ids'],
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
    (eventData) => console.log('Twitter has sent something:', eventData)
  );

  stream.on(
    // Emitted when a Twitter sent a signal to maintain connection active
    ETwitterStreamEvent.DataKeepAlive,
    () => console.log('Twitter has a keep-alive packet.')
  );

  stream.autoReconnect = true;
}
