import prismaClient from '@/utils/prisma/prismaClient';

export async function getTwitterUsernames(): Promise<Array<string>> {
  const data: Array<{ username: string }> = await prismaClient.user.findMany({
    select: {
      username: true,
    },
  });

  return data.map((item) => item.username);
}
