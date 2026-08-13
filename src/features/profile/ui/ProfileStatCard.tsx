type ProfileStatCardProps = {
  label: string;
  value: string;
};

export function ProfileStatCard({ label, value }: ProfileStatCardProps) {
  return (
    <div className="liquid-glass isolate overflow-hidden rounded-3xl p-5 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-2 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6">
      <p className="relative z-[2] font-big-fat-boii text-[11px] font-normal tracking-wide text-gray-700 uppercase sm:text-xs">
        {label}
      </p>
      <p className="relative z-[2] mt-2 font-big-fat-boii text-2xl font-normal tracking-wide text-gray-900 sm:mt-3 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
