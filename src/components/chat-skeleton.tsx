import React from "react";
import { Skeleton } from "~/components/ui/skeleton";

export function ChatSkeleton() {
  return (
    <div className="flex w-full flex-col space-y-4 p-4">
      {/* AI messages */}
      <div className="flex items-start space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-6 w-full max-w-sm rounded-md" />
          <Skeleton className="h-6 w-full max-w-xs rounded-md" />
        </div>
      </div>

      {/* user messages */}
      <div className="flex items-start justify-end space-x-4">
        <div className="flex-1 flex-col items-end space-y-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-6 w-full max-w-md rounded-md" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* another AI message */}
      <div className="flex items-start space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-6 w-full max-w-lg rounded-md" />
        </div>
      </div>

      {/* another user messages */}
      <div className="flex items-start justify-end space-x-4">
        <div className="flex-1 flex-col items-end space-y-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-6 w-full max-w-md rounded-md" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
}
