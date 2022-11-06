import prismaClient from '@/utils/prisma/prismaClient';
import { Prisma, Tweet } from '@prisma/client';

export default function upsertTweet(data: Tweet): void {
  prismaClient.tweet.upsert({
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
}
