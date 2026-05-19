type StatusBadgeProps = {
  status: 'To Do' | 'In Progress' | 'Done' | 'High' | 'Medium' | 'Low';
};

const colorMap: Record<StatusBadgeProps['status'], string> = {
  'To Do': 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-amber-100 text-amber-800',
  Done: 'bg-emerald-100 text-emerald-800',
  High: 'bg-rose-100 text-rose-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-slate-100 text-slate-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorMap[status]}`}>
      {status}
    </span>
  );
}
