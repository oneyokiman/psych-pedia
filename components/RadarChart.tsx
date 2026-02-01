import React, { useState, useEffect } from 'react';
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
  // State for tracking mouse position and hover detection
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);
  
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

  // Custom Dot component - hidden by default
  const CustomDot = (props: any) => {
    // Dots are hidden, information shown via tooltip on hover
    return null;
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

  // Custom tooltip to show action type - only show when very close to a data point
  const CustomTooltip = ({ active, payload, coordinate }: any) => {
    // Only show tooltip if actively hovering AND mouse is very close to the data point
    if (active && payload && payload.length && mousePos && coordinate && showTooltip) {
      const data = payload[0].payload;
      const action = data.action as ReceptorAction | undefined;
      
      // Calculate distance from mouse to tooltip coordinate
      const distance = Math.sqrt(
        Math.pow(mousePos.x - coordinate.x, 2) + 
        Math.pow(mousePos.y - coordinate.y, 2)
      );
      
      // Much stricter distance requirement - only show when very close
      if (distance > 30) {
        return null;
      }
      
      return (
        <div
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            opacity: 1,
            animation: 'none',
            transform: 'none'
          }}
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
    <div className="w-full h-full flex flex-col">
      {/* 雷达图容器 - 背景白框，占满可用空间 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex-1 flex flex-col">
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-2 h-5">
          点击标签查看机制
        </div>
        <div 
          className="flex-1 relative select-none min-h-0"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const newMousePos = {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            };
            setMousePos(newMousePos);
            
            // Clear existing timeout
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
            }
            
            // Show tooltip immediately
            setShowTooltip(true);
          }}
          onMouseLeave={() => {
            // Debounce hide to prevent flickering
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
            }
            hideTimeoutRef.current = setTimeout(() => {
              setShowTooltip(false);
              setMousePos(null);
            }, 100);
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="75%" 
              data={chartData}
            >
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
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={false}
                animationDuration={0}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RadarViz;
