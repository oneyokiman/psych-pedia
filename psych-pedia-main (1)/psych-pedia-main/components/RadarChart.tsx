import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { StahlRadarData } from '../types';

interface RadarVizProps {
  data: StahlRadarData;
  onLabelClick: (linkId: string) => void;
  isDarkMode: boolean;
}

const RadarViz: React.FC<RadarVizProps> = ({ data, onLabelClick, isDarkMode }) => {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => ({
    subject: label,
    A: data.values[index],
    fullMark: 10,
    linkId: data.link_ids[index]
  }));

  const axisColor = isDarkMode ? "#94a3b8" : "#475569";
  const gridColor = isDarkMode ? "#334155" : "#e2e8f0";
  const shapeFill = isDarkMode ? "rgba(14, 165, 233, 0.3)" : "rgba(14, 165, 233, 0.2)";
  const shapeStroke = isDarkMode ? "#0ea5e9" : "#0284c7";

  // Custom Tick Component to make labels interactive
  const CustomTick = (props: any) => {
    const { payload, x, y, textAnchor } = props;
    
    // Find the linkId corresponding to this label
    const item = chartData.find(d => d.subject === payload.value);
    const linkId = item ? item.linkId : '';

    return (
      <g 
        className="cursor-pointer" 
        onClick={() => linkId && onLabelClick(linkId)}
      >
        <text
          x={x}
          y={y}
          textAnchor={textAnchor}
          fill={axisColor}
          fontSize={12}
          fontWeight={600}
          fontFamily="JetBrains Mono"
          className="hover:fill-cyan-500 transition-colors duration-200"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="w-full h-[350px] md:h-[400px] relative select-none">
       <div className="absolute top-0 right-0 text-xs text-slate-400 dark:text-slate-600 font-mono">
         Click labels for mechanism
       </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={<CustomTick />}
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Receptor Affinity"
            dataKey="A"
            stroke={shapeStroke}
            strokeWidth={3}
            fill={shapeFill}
            fillOpacity={0.6}
            isAnimationActive={true}
          />
          <Tooltip 
             cursor={false}
             contentStyle={{ 
               backgroundColor: isDarkMode ? '#1e232b' : '#ffffff',
               borderColor: isDarkMode ? '#334155' : '#e2e8f0',
               color: isDarkMode ? '#f1f5f9' : '#0f172a',
               borderRadius: '8px',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
             }}
             itemStyle={{ color: isDarkMode ? '#38bdf8' : '#0284c7' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarViz;