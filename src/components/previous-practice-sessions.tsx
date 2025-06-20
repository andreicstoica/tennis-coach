"use client";

import { api } from "~/trpc/react";
import { PracticeSummaryExpand } from "~/components/practice-summary-expand";

export function PreviousPracticeSessions() {
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
    <div className="grid w-full grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 md:grid-cols-3">
      {" "}
      {/* Adjusted classes */}{" "}
      {previousPracticeSessions.map((session) => (
        // <PracticeSessionCard key={session.id} session={session} />
        <PracticeSummaryExpand key={session.id} session={session} />
      ))}
    </div>
  );
}
