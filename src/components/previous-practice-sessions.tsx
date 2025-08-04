"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import { NotebookPracticeCard } from "~/components/notebook-practice-card";

interface FilterState {
  year?: number;
  month?: number;
  focusSearch?: string;
  limit: number;
}

export function PreviousPracticeSessions() {
  const [filters, setFilters] = useState<FilterState>({ limit: 6 });

  const { data, isLoading, error } = api.practiceSession.list.useQuery();

  // Filter and limit the sessions client-side
  const filteredSessions = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];

    // Year filter
    if (filters.year) {
      filtered = filtered.filter((session) => {
        const sessionYear = session.createdAt?.getFullYear();
        return sessionYear === filters.year;
      });
    }

    // Month filter (only applies if year is also selected)
    if (filters.month && filters.year) {
      filtered = filtered.filter((session) => {
        const sessionMonth = session.createdAt?.getMonth() + 1; // getMonth() returns 0-11
        return sessionMonth === filters.month;
      });
    }

    // Focus search filter
    if (filters.focusSearch) {
      const searchTerm = filters.focusSearch.toLowerCase();
      filtered = filtered.filter((session) =>
        session.focusArea.toLowerCase().includes(searchTerm),
      );
    }

    // Apply limit
    return filtered.slice(0, filters.limit);
  }, [data, filters]);

  // Generate year options from actual data
  const availableYears = useMemo(() => {
    if (!data) return [];
    const years = new Set(
      data
        .map((session) => session.createdAt?.getFullYear())
        .filter((year) => year !== undefined),
    );
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [data]);

  if (error) {
    return error.message;
  }

  if (isLoading) {
    return <div>keep practicing! :)</div>;
  }

  // Month options
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
      // Reset month if year is cleared
      ...(key === "year" && !value ? { month: undefined } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters({ limit: 6 });
  };

  const hasFilters = filters.year || filters.month || filters.focusSearch;

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Year Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              value={filters.year || ""}
              onChange={(e) =>
                handleFilterChange(
                  "year",
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              value={filters.month || ""}
              onChange={(e) =>
                handleFilterChange(
                  "month",
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              disabled={!filters.year}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">All months</option>
              {monthOptions.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Focus Search */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Search Focus
            </label>
            <input
              type="text"
              placeholder="e.g. backhand, serve..."
              value={filters.focusSearch || ""}
              onChange={(e) =>
                handleFilterChange("focusSearch", e.target.value)
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Limit */}
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">
              Show
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                handleFilterChange("limit", parseInt(e.target.value))
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value={6}>6 sessions</option>
              <option value={12}>12 sessions</option>
              <option value={24}>24 sessions</option>
              <option value={50}>All sessions</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 underline hover:text-gray-800"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredSessions.length === 0 ? (
        <motion.div
          className="ml-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {hasFilters
            ? "No practice sessions found matching your filters."
            : "Your practice session summaries will appear here."}
        </motion.div>
      ) : (
        <motion.div
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                layout
                exit={{ opacity: 0 }}
                transition={{
                  layout: {
                    duration: 0.3,
                    ease: "easeInOut",
                  },
                  opacity: { duration: 0.2 },
                }}
              >
                <NotebookPracticeCard session={session} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
