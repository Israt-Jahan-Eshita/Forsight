import { StatCard } from '../ui/StatCard';
import { Users, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export function StatsSummaryRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Students"
        value="1,240"
        icon={<Users className="w-5 h-5" />}
        trend={{ value: 2, label: 'from last month' }}
      />
      <StatCard
        title="Safe"
        value="850"
        icon={<ShieldCheck className="w-5 h-5 text-color-success" />}
        trend={{ value: 5, label: 'from last month' }}
      />
      <StatCard
        title="Watch"
        value="230"
        icon={<AlertTriangle className="w-5 h-5 text-color-warning" />}
      />
      <StatCard
        title="At-Risk & Critical"
        value="160"
        icon={<AlertOctagon className="w-5 h-5 text-color-danger" />}
        trend={{ value: -12, label: 'from last month' }}
      />
    </div>
  );
}
