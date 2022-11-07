import { TwitterApi } from 'twitter-api-v2';

import { createClient } from 'redis';
import { TwitterApiCachePluginRedis } from '@twitter-api-v2/plugin-cache-redis';

const bearer = process.env.APP_BEARER_TOKEN ?? '';

const redisInstance = createClient({
  socket: {
    host: '127.0.0.01',
    port: 6379,
  },
});

const client = new TwitterApi(bearer, {
  plugins: [
    new TwitterApiCachePluginRedis(redisInstance as any, {
      ttl: 0,
    }),
  ],
});

export default client;
