'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  type PieLabelRenderProps,
} from 'recharts';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { Task } from '@/types';

interface Props {
  tasks: Task[];
}

/* ── Pie: status distribution ─────────────────────────── */
const STATUS_COLORS = {
  Pending: '#F59E0B',
  'In Progress': '#3B82F6',
  Completed: '#22C55E',
};

/* ── Custom tooltip shared style ─────────────────────── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string; fill?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '8px 12px',
        boxShadow: 'var(--shadow-md)',
        fontSize: 13,
        color: 'var(--text-primary)',
      }}
    >
      {label && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>
          {label}
        </p>
      )}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Custom pie label ─────────────────────────────────── */
function PieLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
  if ((percent as number) < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius =
    (innerRadius as number) +
    ((outerRadius as number) - (innerRadius as number)) * 0.55;
  const x = (cx as number) + radius * Math.cos(-(midAngle as number) * RADIAN);
  const y = (cy as number) + radius * Math.sin(-(midAngle as number) * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={700}>
      {`${((percent as number) * 100).toFixed(0)}%`}
    </text>
  );
}

export function AnalyticsCharts({ tasks }: Props) {
  /* Pie data */
  const pieData = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'PENDING').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    return [
      { name: 'Pending', value: pending },
      { name: 'In Progress', value: inProgress },
      { name: 'Completed', value: completed },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  /* Priority pie data */
  const priorityData = useMemo(() => {
    const high = tasks.filter((t) => t.priority === 'HIGH').length;
    const medium = tasks.filter((t) => t.priority === 'MEDIUM').length;
    const low = tasks.filter((t) => t.priority === 'LOW').length;
    return [
      { name: 'High', value: high },
      { name: 'Medium', value: medium },
      { name: 'Low', value: low },
    ].filter((d) => d.value > 0);
  }, [tasks]);

  const PRIORITY_COLORS = { High: '#EF4444', Medium: '#F59E0B', Low: '#22C55E' };

  /* Line chart: tasks created per day over last 7 days */
  const lineData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const label = format(date, 'MMM d');
      const created = tasks.filter((t) => isSameDay(parseISO(t.createdAt), date)).length;
      const completed = tasks.filter(
        (t) => t.status === 'COMPLETED' && isSameDay(parseISO(t.updatedAt), date)
      ).length;
      const overdue = tasks.filter(
        (t) =>
          t.dueDate &&
          isSameDay(parseISO(t.dueDate), date) &&
          t.status !== 'COMPLETED'
      ).length;
      return { date: label, Created: created, Completed: completed, Overdue: overdue };
    });
    return days;
  }, [tasks]);

  const hasData = tasks.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-7"
    >
      {/* Line chart — spans 2 cols */}
      <div className="card p-5 lg:col-span-2">
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">Activity — last 7 days</p>
        <p className="text-xs text-[var(--text-muted)] mb-4">Tasks created vs completed</p>
        {hasData ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)', paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="Created"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Completed"
                stroke="#22C55E"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#22C55E', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Overdue"
                stroke="#EF4444"
                strokeWidth={2.5}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart />
        )}
      </div>

      {/* Pie charts stacked in 1 col */}
      <div className="flex flex-col gap-4">
        {/* Status pie */}
        <div className="card p-5 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">By Status</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">Task distribution</p>
          {hasData && pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart small />
          )}
          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {Object.entries(STATUS_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Priority pie */}
        <div className="card p-5 flex-1">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">By Priority</p>
          <p className="text-xs text-[var(--text-muted)] mb-3">Task distribution</p>
          {hasData && priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  dataKey="value"
                  labelLine={false}
                  label={PieLabel}
                  strokeWidth={0}
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart small />
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {Object.entries(PRIORITY_COLORS).map(([name, color]) => (
              <span key={name} className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyChart({ small }: { small?: boolean }) {
  return (
    <div
      className="flex items-center justify-center text-[var(--text-muted)] text-xs"
      style={{ height: small ? 130 : 180 }}
    >
      No data yet
    </div>
  );
}
