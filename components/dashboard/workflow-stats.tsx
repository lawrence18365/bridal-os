import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkflowFilter = "all" | "attention" | "payments" | "fittings";

interface WorkflowStatsProps {
  activeFilter: WorkflowFilter;
  onFilterChange: (filter: WorkflowFilter) => void;
  counts: {
    all: number;
    attention: number;
    payments: number;
    fittings: number;
  };
}

export function WorkflowStats({
  activeFilter,
  onFilterChange,
  counts,
}: WorkflowStatsProps) {
  const filters: {
    id: WorkflowFilter;
    label: string;
    description: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "All Active",
      description: "Current brides",
      count: counts.all,
    },
    {
      id: "attention",
      label: "Requires Attention",
      description: "Onboarding / No Appt",
      count: counts.attention,
    },
    {
      id: "payments",
      label: "Payments Due",
      description: "Outstanding balance",
      count: counts.payments,
    },
    {
      id: "fittings",
      label: "Fittings This Week",
      description: "Upcoming appointments",
      count: counts.fittings,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            "relative flex flex-col items-start p-4 h-full text-left transition-all duration-200 border rounded-xl hover:shadow-md",
            activeFilter === filter.id
              ? "bg-black border-black text-white shadow-lg scale-[1.02]"
              : "bg-white border-stone-100 text-stone-600 hover:border-stone-300"
          )}
        >
          <div className="flex justify-between w-full items-start mb-2">
            <span
              className={cn(
                "text-[10px] uppercase tracking-widest font-bold",
                activeFilter === filter.id ? "text-stone-400" : "text-stone-400"
              )}
            >
              {filter.label}
            </span>
            {activeFilter === filter.id && (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </div>
          <div className="mt-auto">
            <span
              className={cn(
                "text-3xl font-serif block mb-1",
                activeFilter === filter.id ? "text-white" : "text-black"
              )}
            >
              {filter.count}
            </span>
            <span
              className={cn(
                "text-xs",
                activeFilter === filter.id ? "text-stone-300" : "text-stone-500"
              )}
            >
              {filter.description}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
