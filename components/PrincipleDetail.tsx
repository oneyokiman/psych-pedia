import React from 'react';
import { Principle } from '../types';
import RichText from './RichText';
import WikiContent from './WikiContent';

interface PrincipleDetailProps {
  principle: Principle;
  onBack?: () => void;
  backLabel?: string | null;
  onNavigate: (type: 'principle', id: string) => void;
  isDarkMode?: boolean;
}

const PrincipleDetail: React.FC<PrincipleDetailProps> = ({ principle, onBack, backLabel, onNavigate, isDarkMode = true }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      
      {/* Back Button */}
      {onBack && backLabel && (
        <button 
          onClick={onBack}
          className="group mb-6 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors bg-white dark:bg-medical-panel border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span>返回 {backLabel}</span>
        </button>
      )}

      <div className="bg-white dark:bg-medical-surface rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-medical-panel p-8 border-b border-slate-200 dark:border-slate-700">
           <div className="flex items-center gap-3 mb-2">
             <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${principle.type === 'receptor' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'}`}>
               {principle.type === 'receptor' ? '基础受体' : '生物学假说'}
             </span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{principle.title}</h1>
           {principle.subtitle && (
             <h2 className="text-xl font-mono text-slate-500 dark:text-slate-400">{principle.subtitle}</h2>
           )}
        </div>

        {/* Content */}
        <div className="p-8">
           <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
              <RichText content={principle.content} onNavigate={onNavigate} />
           </div>
           
           {/* Visual Guide */}
           {principle.visual_guide ? (
              <div className="mt-12">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    图示说明
                 </h3>
                 <div className="bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex justify-center items-center p-4">
                    <img 
                       src={principle.visual_guide} 
                       alt={principle.title}
                       className="max-w-full max-h-[70vh] h-auto object-contain"
                       onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                             parent.innerHTML = '<div class="p-8 text-center"><p class="text-sm text-slate-500">图片加载失败</p><p class="text-xs text-slate-400">图片 URL: ' + principle.visual_guide + '</p></div>';
                          }
                       }}
                    />
                 </div>
              </div>
           ) : (
              <div className="mt-12 p-8 bg-slate-50 dark:bg-black/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                 <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 <p className="text-sm text-slate-500">图示占位符 (Visual Guide Placeholder)</p>
                 <p className="text-xs text-slate-400">暂无图示，可在 JSON 中添加 visual_guide 字段</p>
              </div>
            )}
         </div>
      </div>

      {/* Wiki Content Section */}
      <div className="mt-6">
        <WikiContent
          content={principle.wiki_content}
          title={principle.title}
          isDarkMode={isDarkMode}
          editable={false}
        />
      </div>
    </div>
  );
};

export default PrincipleDetail;