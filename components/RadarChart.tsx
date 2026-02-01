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
import { StahlRadarData, ReceptorAction } from '../types';

interface RadarVizProps {
  data: StahlRadarData;
  onLabelClick: (linkId: string) => void;
  isDarkMode: boolean;
}

// Action type colors and labels
const ACTION_CONFIG = {
  agonist: {
    color: { light: '#ef4444', dark: '#f87171' },
    label_cn: '激动剂',
    label_en: 'Agonist',
    shape: 'circle'
  },
  partial_agonist: {
    color: { light: '#f97316', dark: '#fb923c' },
    label_cn: '部分激动剂',
    label_en: 'Partial Agonist',
    shape: 'circle-half'
  },
  antagonist: {
    color: { light: '#3b82f6', dark: '#60a5fa' },
    label_cn: '拮抗剂',
    label_en: 'Antagonist',
    shape: 'triangle'
  },
  inverse_agonist: {
    color: { light: '#a855f7', dark: '#c084fc' },
    label_cn: '反向激动剂',
    label_en: 'Inverse Agonist',
    shape: 'triangle-down'
  },
  pam: {
    color: { light: '#10b981', dark: '#34d399' },
    label_cn: '正向变构',
    label_en: 'PAM',
    shape: 'square'
  },
  nam: {
    color: { light: '#6b7280', dark: '#9ca3af' },
    label_cn: '负向变构',
    label_en: 'NAM',
    shape: 'square'
  }
} as const;

const RadarViz: React.FC<RadarVizProps> = ({ data, onLabelClick, isDarkMode }) => {
  // Check if we have the new bindings format or legacy format
  const hasActionData = data.bindings && data.bindings.length > 0;
  
  // Transform data for Recharts - support both formats
  const chartData = hasActionData 
    ? data.bindings!.map((binding) => ({
        subject: binding.label,
        A: binding.value,
        fullMark: 10,
        linkId: binding.link_id,
        action: binding.action
      }))
    : (data.labels || []).map((label, index) => ({
        subject: label,
        A: (data.values || [])[index],
        fullMark: 10,
        linkId: (data.link_ids || [])[index],
        action: undefined
      }));

  const axisColor = isDarkMode ? "#94a3b8" : "#475569";
  const gridColor = isDarkMode ? "#334155" : "#e2e8f0";
  const shapeFill = isDarkMode ? "rgba(14, 165, 233, 0.3)" : "rgba(14, 165, 233, 0.2)";
  const shapeStroke = isDarkMode ? "#0ea5e9" : "#0284c7";

  // Get action color based on mode
  const getActionColor = (action?: ReceptorAction) => {
    if (!action) return shapeStroke;
    const config = ACTION_CONFIG[action];
    return isDarkMode ? config.color.dark : config.color.light;
  };

  // Custom Dot component to render action-specific shapes
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const action = payload.action as ReceptorAction | undefined;
    
    if (!action) {
      // Legacy format: simple dot
      return <circle cx={cx} cy={cy} r={4} fill={shapeStroke} />;
    }

    const config = ACTION_CONFIG[action];
    const color = getActionColor(action);
    const size = 10;

    // Render different shapes based on action type
    switch (config.shape) {
      case 'circle':
        return <circle cx={cx} cy={cy} r={size / 2} fill={color} />;
      
      case 'circle-half':
        // Partial agonist: circle with gradient
        return (
          <g>
            <circle cx={cx} cy={cy} r={size / 2} fill={color} opacity={0.5} />
            <circle cx={cx} cy={cy} r={size / 2} fill={color} clipPath={`circle(${size / 2}px at ${cx - size / 4}px ${cy}px)`} />
          </g>
        );
      
      case 'triangle':
        // Antagonist: upward triangle
        const h = size * 0.866; // height of equilateral triangle
        return (
          <polygon
            points={`${cx},${cy - h / 2} ${cx - size / 2},${cy + h / 2} ${cx + size / 2},${cy + h / 2}`}
            fill={color}
          />
        );
      
      case 'triangle-down':
        // Inverse agonist: downward triangle
        const h2 = size * 0.866;
        return (
          <polygon
            points={`${cx},${cy + h2 / 2} ${cx - size / 2},${cy - h2 / 2} ${cx + size / 2},${cy - h2 / 2}`}
            fill={color}
          />
        );
      
      case 'square':
        // PAM/NAM: square
        return (
          <rect
            x={cx - size / 2}
            y={cy - size / 2}
            width={size}
            height={size}
            fill={color}
          />
        );
      
      default:
        return <circle cx={cx} cy={cy} r={size / 2} fill={color} />;
    }
  };

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

  // Custom tooltip to show action type
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const action = data.action as ReceptorAction | undefined;
      
      return (
        <div
          style={{
            backgroundColor: isDarkMode ? '#1e232b' : '#ffffff',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            borderRadius: '8px',
            padding: '8px 12px',
            border: '1px solid',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontFamily: 'JetBrains Mono'
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>
            {data.subject}
          </p>
          <p style={{ margin: '4px 0 0 0', color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
            亲和力: {data.A.toFixed(1)}
          </p>
          {action && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: getActionColor(action) }}>
              {ACTION_CONFIG[action].label_cn} ({ACTION_CONFIG[action].label_en})
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
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
              dot={hasActionData ? <CustomDot /> : true}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend - only show if we have action data */}
      {hasActionData && (
        <div className="w-full px-4">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
            受体作用类型 Receptor Actions:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(ACTION_CONFIG) as ReceptorAction[]).map((action) => {
              const config = ACTION_CONFIG[action];
              const color = getActionColor(action);
              
              return (
                <div key={action} className="flex items-center gap-2 text-xs font-mono">
                  <svg width="16" height="16" className="flex-shrink-0">
                    {config.shape === 'circle' && (
                      <circle cx="8" cy="8" r="6" fill={color} />
                    )}
                    {config.shape === 'circle-half' && (
                      <g>
                        <circle cx="8" cy="8" r="6" fill={color} opacity={0.5} />
                        <path d="M 8 2 A 6 6 0 0 1 8 14 Z" fill={color} />
                      </g>
                    )}
                    {config.shape === 'triangle' && (
                      <polygon points="8,3 3,13 13,13" fill={color} />
                    )}
                    {config.shape === 'triangle-down' && (
                      <polygon points="8,13 3,3 13,3" fill={color} />
                    )}
                    {config.shape === 'square' && (
                      <rect x="3" y="3" width="10" height="10" fill={color} />
                    )}
                  </svg>
                  <span className="text-slate-700 dark:text-slate-300">
                    {config.label_cn}
                    <span className="text-slate-400 dark:text-slate-500 ml-1">
                      {config.label_en}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarViz;
