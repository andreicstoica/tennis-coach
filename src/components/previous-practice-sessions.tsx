"use client";

import { api } from "~/trpc/react";
import { PracticeSessionCard } from "./practice-session-card";

export function PreviousPracticeSessions() {
  // need to get last 1-4 practice sessions,
  // say keep practicing if not enough

  // for each session, return a card with focus, date, tl;dr of session

  //let previousPracticeSessions = await api.practiceSession.list();
  const { data, isLoading, error } = api.practiceSession.list.useQuery();

  if (error) {
    return error.message;
  }

  if (isLoading) {
    return <div>keep practicing! :)</div>;
  }

  let previousPracticeSessions = structuredClone(data);

  if (
    previousPracticeSessions === undefined ||
    previousPracticeSessions.length === 0
  ) {
    return <div>loading...</div>;
  }

  if (previousPracticeSessions.length > 6) {
    previousPracticeSessions = previousPracticeSessions.slice(0, 6);
  }

  return (
    <>
      {previousPracticeSessions.map((session) => (
        <PracticeSessionCard key={session.id} session={session} />
      ))}
    </>
  );
}
