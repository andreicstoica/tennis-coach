/*
this router will handle the retrieval and updating of the court badges for the user

it will take in a userId and return the court badges array for that user

*/

import { eq } from "drizzle-orm";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { courtBadges, type CourtBadge } from "~/server/db/schema";

export const courtBadgesRouter = createTRPCRouter({
    getCourtBadges: protectedProcedure.query(async ({ ctx }) => {
        const courtBadgesArr = await ctx.db.query.courtBadges.findFirst({
            where: eq(courtBadges.userId, ctx.user.id),
        });

        return courtBadgesArr?.courtBadges || [];
    }),

    updateCourtBadges: protectedProcedure
        .input(z.object({ courtName: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Get current court badges for user
            const currentBadges = await ctx.db.query.courtBadges.findFirst({
                where: eq(courtBadges.userId, ctx.user.id),
            });

            let updatedBadges: CourtBadge[] = [];

            if (currentBadges?.courtBadges) {
                // Check if court already exists in badges
                const existingCourtIndex = currentBadges.courtBadges.findIndex(
                    badge => badge.courtName === input.courtName
                );

                if (existingCourtIndex >= 0) {
                    // Court exists, increment timesVisited
                    updatedBadges = currentBadges.courtBadges.map((badge, index) => {
                        if (index === existingCourtIndex) {
                            return {
                                courtName: badge.courtName,
                                firstUnlockedAt: badge.firstUnlockedAt,
                                timesVisited: badge.timesVisited + 1
                            };
                        }
                        return badge;
                    });
                } else {
                    // Court doesn't exist, add new court with timesVisited = 1
                    updatedBadges = [
                        ...currentBadges.courtBadges,
                        {
                            courtName: input.courtName,
                            firstUnlockedAt: new Date().toISOString(),
                            timesVisited: 1
                        }
                    ];
                }
            } else {
                // No existing badges, create first one
                updatedBadges = [{
                    courtName: input.courtName,
                    firstUnlockedAt: new Date().toISOString(),
                    timesVisited: 1
                }];
            }

            // Upsert the court badges
            await ctx.db
                .insert(courtBadges)
                .values({
                    userId: ctx.user.id,
                    courtBadges: updatedBadges,
                })
                .onConflictDoUpdate({
                    target: courtBadges.userId,
                    set: {
                        courtBadges: updatedBadges,
                        updatedAt: new Date(),
                    }
                });
        }),


});