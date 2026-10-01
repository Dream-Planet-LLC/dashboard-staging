import { cn } from "@/lib/utils";

export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded bg-[#EEEEEE]", className)}
  />
);

export const TableSkeletonRows = ({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) => (
  <>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <tr key={rowIndex} className="border-b border-[#EEEEEE]">
        {Array.from({ length: columns }, (_, columnIndex) => (
          <td key={columnIndex} className="px-4 py-5">
            <SkeletonBlock
              className={columnIndex === 0 ? "h-5 w-32" : "h-5 w-20"}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const OverviewSkeleton = () => (
  <div aria-label="Loading engagement overview" className="space-y-8">
    <section className="grid gap-5 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className={
            index === 0 ? "" : "sm:border-l sm:border-[#EEEEEE] sm:pl-5"
          }
        >
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="mt-2 h-8 w-28" />
        </div>
      ))}
    </section>
    <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.85fr)]">
      <div className="rounded-[8px] border border-[#E4E4E4] p-5">
        <SkeletonBlock className="h-6 w-44" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex items-center gap-4">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-4 flex-1" />
              <SkeletonBlock className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[8px] border border-[#E4E4E4] p-5">
        <SkeletonBlock className="h-6 w-52" />
        <SkeletonBlock className="mx-auto mt-6 h-44 w-44 rounded-full" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock key={index} className="h-5 w-full" />
          ))}
        </div>
      </div>
    </section>
  </div>
);
