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

// 优化后的配色方案 - 更柔和、更现代
const ACTION_CONFIG = {
  agonist: {
    color: { light: '#dc2626', dark: '#ef4444' },      // 红色 - 更深
    label_cn: '激动剂',
    label_en: 'Agonist',
    shape: 'circle'
  },
  partial_agonist: {
    color: { light: '#ea580c', dark: '#f97316' },      // 橙色
    label_cn: '部分激动剂',
    label_en: 'Partial',
    shape: 'circle-half'
  },
  antagonist: {
    color: { light: '#2563eb', dark: '#3b82f6' },      // 蓝色
    label_cn: '拮抗剂',
    label_en: 'Antagonist',
    shape: 'triangle'
  },
  inverse_agonist: {
    color: { light: '#9333ea', dark: '#a855f7' },      // 紫色
    label_cn: '反向激动',
    label_en: 'Inverse',
    shape: 'triangle-down'
  },
  pam: {
    color: { light: '#059669', dark: '#10b981' },      // 绿色
    label_cn: '正向变构',
    label_en: 'PAM',
    shape: 'square'
  },
  nam: {
    color: { light: '#64748b', dark: '#94a3b8' },      // 灰色
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
    const size = 11; // 稍微增大一点

    // Render different shapes based on action type
    switch (config.shape) {
      case 'circle':
        return (
          <g>
            <circle cx={cx} cy={cy} r={size / 2} fill={color} opacity={0.9} />
            <circle cx={cx} cy={cy} r={size / 2 + 1} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
          </g>
        );
      
      case 'circle-half':
        // Partial agonist: circle with half fill
        return (
          <g>
            <circle cx={cx} cy={cy} r={size / 2} fill={color} opacity={0.3} />
            <path 
              d={`M ${cx} ${cy - size / 2} A ${size / 2} ${size / 2} 0 0 1 ${cx} ${cy + size / 2} Z`}
              fill={color} 
              opacity={0.9}
            />
          </g>
        );
      
      case 'triangle':
        // Antagonist: upward triangle
        const h = size * 0.866;
        return (
          <polygon
            points={`${cx},${cy - h / 2} ${cx - size / 2},${cy + h / 2} ${cx + size / 2},${cy + h / 2}`}
            fill={color}
            opacity={0.9}
          />
        );
      
      case 'triangle-down':
        // Inverse agonist: downward triangle
        const h2 = size * 0.866;
        return (
          <polygon
            points={`${cx},${cy + h2 / 2} ${cx - size / 2},${cy - h2 / 2} ${cx + size / 2},${cy - h2 / 2}`}
            fill={color}
            opacity={0.9}
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
            opacity={0.9}
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
          fontSize={13}
          fontWeight={600}
          fontFamily="system-ui, -apple-system, sans-serif"
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
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3"
        >
          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
            {data.subject}
          </p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-1">
            亲和力: <span className="font-mono font-bold">{data.A.toFixed(1)}</span>
          </p>
          {action && (
            <p className="text-xs font-medium" style={{ color: getActionColor(action) }}>
              {ACTION_CONFIG[action].label_cn}
              <span className="ml-1 opacity-70">
                ({ACTION_CONFIG[action].label_en})
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* 雷达图容器 - 背景白框 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="w-full h-[380px] relative select-none">
          <div className="absolute top-0 right-0 text-xs text-slate-400 dark:text-slate-500">
            点击标签查看机制
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
              <PolarGrid stroke={gridColor} strokeWidth={1} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={<CustomTick />}
              />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                name="Receptor Affinity"
                dataKey="A"
                stroke={shapeStroke}
                strokeWidth={2.5}
                fill={shapeFill}
                fillOpacity={0.6}
                isAnimationActive={true}
                dot={hasActionData ? <CustomDot /> : true}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - 在白框内部 */}
        {hasActionData && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
              受体作用类型
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
              {(Object.keys(ACTION_CONFIG) as ReceptorAction[]).map((action) => {
                const config = ACTION_CONFIG[action];
                const color = getActionColor(action);
                
                return (
                  <div key={action} className="flex items-center gap-2">
                    <svg width="14" height="14" className="flex-shrink-0">
                      {config.shape === 'circle' && (
                        <circle cx="7" cy="7" r="5" fill={color} opacity={0.9} />
                      )}
                      {config.shape === 'circle-half' && (
                        <g>
                          <circle cx="7" cy="7" r="5" fill={color} opacity={0.3} />
                          <path d="M 7 2 A 5 5 0 0 1 7 12 Z" fill={color} opacity={0.9} />
                        </g>
                      )}
                      {config.shape === 'triangle' && (
                        <polygon points="7,2 2,12 12,12" fill={color} opacity={0.9} />
                      )}
                      {config.shape === 'triangle-down' && (
                        <polygon points="7,12 2,2 12,2" fill={color} opacity={0.9} />
                      )}
                      {config.shape === 'square' && (
                        <rect x="2" y="2" width="10" height="10" fill={color} opacity={0.9} />
                      )}
                    </svg>
                    <span className="text-xs text-slate-700 dark:text-slate-300">
                      {config.label_cn}
                      <span className="text-slate-400 dark:text-slate-500 ml-1 text-[10px]">
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
    </div>
  );
};

export default RadarViz;
