import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { practiceSessions } from '~/server/db/schema';
import { type Context } from "~/server/api/trpc"

type PracticeSession = typeof practiceSessions.$inferSelect

export async function getPracticeSessionById(ctx: Context, id: number): Promise<PracticeSession | null> {
  const session = await ctx.db.query.practiceSessions.findFirst({
    where: eq(practiceSessions.id, id),
  });

  if (!session || session.userId !== ctx.user!.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return session;
}