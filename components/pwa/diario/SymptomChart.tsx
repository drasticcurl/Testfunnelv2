'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { subDays, format } from 'date-fns';
import { SymptomLog, formatDateShort } from '@/lib/pwa/diary-helpers';

interface SymptomChartProps {
  logs: SymptomLog[];
  days: 14 | 30;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  bloating_am: number;
  bloating_pm: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-warm rounded-lg shadow-md border border-warm-border p-2 font-body text-xs">
      <p className="font-medium text-charcoal mb-1">{label}</p>
      {payload.map((entry: { color: string; name: string; value: number }) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'bloating_am' ? 'AM' : 'PM'}: {entry.value}/10
        </p>
      ))}
    </div>
  );
}

export default function SymptomChart({ logs, days }: SymptomChartProps) {
  // Filter to only logs within the selected period window
  const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const chartData: ChartDataPoint[] = [...logs]
    .filter((log) => log.date >= cutoffDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      dateLabel: formatDateShort(log.date),
      bloating_am: log.bloating_am,
      bloating_pm: log.bloating_pm,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-3">📊</span>
        <p className="font-body text-charcoal font-medium">Empezá tu primer registro</p>
        <p className="font-body text-sm text-muted mt-1">
          El gráfico aparece después de tu primer entrada
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0E8E4" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10, fill: '#1F2433' }}
            tickLine={false}
            axisLine={{ stroke: '#F0E8E4' }}
          />
          <YAxis
            domain={[1, 10]}
            tick={{ fontSize: 10, fill: '#1F2433' }}
            tickLine={false}
            axisLine={{ stroke: '#F0E8E4' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="bloating_am"
            stroke="#C0553A"
            strokeWidth={2.5}
            dot={{ fill: '#C0553A', r: 4 }}
            activeDot={{ r: 6, stroke: '#C0553A', strokeWidth: 2, fill: '#FFFAF7' }}
            name="bloating_am"
          />
          <Line
            type="monotone"
            dataKey="bloating_pm"
            stroke="#D4785C"
            strokeWidth={2.5}
            dot={{ fill: '#D4785C', r: 4 }}
            activeDot={{ r: 6, stroke: '#D4785C', strokeWidth: 2, fill: '#FFFAF7' }}
            name="bloating_pm"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
