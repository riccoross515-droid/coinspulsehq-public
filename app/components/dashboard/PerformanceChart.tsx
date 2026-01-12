"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface PerformanceChartProps {
  data?: { date: string; value: number }[];
  color?: string;
  height?: number | string;
}

export function PerformanceChart({ 
  data = [], 
  color = "#c99400", // Default to the yellow/gold theme
  height = 300 
}: PerformanceChartProps) {
  
  // Custom Tooltip component
  interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { date: string; value: number } }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border/50 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm font-black text-foreground">
            ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: height }} className="animate-in fade-in duration-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            vertical={false} 
            strokeDasharray="3 3" 
            stroke="currentColor" 
            className="text-border/20" 
          />
          <XAxis 
            dataKey="date" 
            hide 
          />
          <YAxis 
            hide 
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
