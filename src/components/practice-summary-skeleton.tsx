import { Skeleton } from "~/components/ui/skeleton";

export function PracticeSummarySkeleton() {
  return (
    <div className="border-l p-4">
      <Skeleton className="mb-4 h-8 w-36 rounded-md" />
      <div className="space-y-4">
        {/* Simulate a few accordion items */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48 rounded-md" />
              <Skeleton className="h-4 w-4 rounded-md" />
            </div>
            <div className="space-y-2 rounded-md border p-3">
              <Skeleton className="mb-2 h-4 w-32 rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
