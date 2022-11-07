import prismaClient from '@/utils/prisma/prismaClient';
import { Prisma, Tweet } from '@prisma/client';

export async function upsertTweet(data: Tweet): Promise<void> {
  const res = await prismaClient.tweet.upsert({
    where: {
      id: data.id,
    },
    update: {
      authorId: data.authorId,
      conversationId: data.conversationId,
      createdAt: data.createdAt,
      text: data.text,
      data: data.data as Prisma.InputJsonValue,
    },
    create: {
      id: data.id,
      authorId: data.authorId,
      conversationId: data.conversationId,
      createdAt: data.createdAt,
      text: data.text,
      data: data.data as Prisma.InputJsonValue,
    },
  });

  console.log({ res });
}

export async function upsertManyTweet(tweets: Array<any>): Promise<void> {
  const res = await prismaClient.$transaction(
    tweets.map((data) => {
      return prismaClient.tweet.upsert({
        where: {
          id: data.id,
        },
        update: {
          authorId: data.authorId,
          conversationId: data.conversationId,
          createdAt: data.createdAt,
          text: data.text,
          data: data,
        },
        create: {
          id: data.id,
          authorId: data.authorId,
          conversationId: data.conversationId,
          createdAt: data.createdAt,
          text: data.text,
          data: data,
        },
      });
    })
  );

  console.log({ res });
}
