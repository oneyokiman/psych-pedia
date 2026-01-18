import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DrugDetail from './components/DrugDetail';
import PrincipleDetail from './components/PrincipleDetail';
import { Drug, Principle } from './types';

interface ViewState {
  type: 'drug' | 'principle';
  id: string;
}

const App: React.FC = () => {
  // --- State ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [drugsLoading, setDrugsLoading] = useState(true);
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [principlesLoading, setPrinciplesLoading] = useState(true);
  
  // Router State
  const [currentView, setCurrentView] = useState<ViewState>({
    type: 'drug',
    id: '' // Will be set once drugs are loaded
  });
  const [history, setHistory] = useState<ViewState[]>([]);

  // Sidebar UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile: Closed by default
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop: Expanded by default

  // --- Load Drugs from JSON ---
  useEffect(() => {
    const loadDrugs = async () => {
      try {
        const response = await fetch('/drugs.json');
        if (!response.ok) throw new Error('Failed to load drugs.json');
        const data = await response.json();
        setDrugs(data.drugs);
        if (data.drugs.length > 0) {
          setCurrentView({ type: 'drug', id: data.drugs[0].id });
        }
      } catch (error) {
        console.error('Error loading drugs:', error);
        setDrugs([]);
      } finally {
        setDrugsLoading(false);
      }
    };

    loadDrugs();
  }, []);

  // --- Load Principles from JSON ---
  useEffect(() => {
    const loadPrinciples = async () => {
      try {
        const response = await fetch('/principles.json');
        if (!response.ok) throw new Error('Failed to load principles.json');
        const data = await response.json();
        // Combine receptors and hypotheses into a single array
        const allPrinciples: Principle[] = [
          ...data.receptors.map((r: any) => ({ ...r, type: 'receptor' as const })),
          ...data.hypotheses.map((h: any) => ({ ...h, type: 'hypothesis' as const }))
        ];
        setPrinciples(allPrinciples);
      } catch (error) {
        console.error('Error loading principles:', error);
        setPrinciples([]);
      } finally {
        setPrinciplesLoading(false);
      }
    };

    loadPrinciples();
  }, []);

  // --- Theme Logic ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Router Handlers ---
  
  // Drill-down navigation (Links, Radar) - Pushes to history
  const handleNavigate = (type: 'drug' | 'principle', id: string) => {
    if (currentView.type === type && currentView.id === id) return;
    
    setHistory(prev => [...prev, currentView]);
    setCurrentView({ type, id });
    
    const main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;
  };

  // Top-level navigation (Sidebar) - Resets history (Standard App Behavior)
  // or Pushes to history? For this app, sidebar clicks usually mean a new context.
  // We will reset history to avoid "Back" hell when switching between major drugs.
  const handleSidebarNavigate = (type: 'drug' | 'principle', id: string) => {
    if (currentView.type === type && currentView.id === id) return;
    
    setHistory([]); // Reset history on major sidebar nav
    setCurrentView({ type, id });
    
    const main = document.getElementById('main-content');
    if (main) main.scrollTop = 0;
  };

  // Back Button Logic
  const handleBack = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentView(previous);
  };

  // Helper to get back label
  const getBackLabel = () => {
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    
    if (last.type === 'drug') {
      const d = drugs.find(x => x.id === last.id);
      return d ? d.name_cn : '药物详情';
    } else {
      const p = principles.find(x => x.id === last.id);
      return p ? p.title : '上一页';
    }
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (drugsLoading || principlesLoading) {
      return <div className="p-10 text-center text-slate-500 dark:text-slate-400">加载中...</div>;
    }

    if (currentView.type === 'drug') {
      const drug = drugs.find(d => d.id === currentView.id);
      if (!drug) return <div className="p-10 text-center">Drug not found</div>;
      return <DrugDetail drug={drug} isDarkMode={isDarkMode} onNavigate={handleNavigate} />;
    } else {
      const principle = principles.find(p => p.id === currentView.id);
      if (!principle) return <div className="p-10 text-center">Principle not found</div>;
      return (
        <PrincipleDetail 
          principle={principle} 
          onBack={history.length > 0 ? handleBack : undefined}
          backLabel={getBackLabel()}
          onNavigate={handleNavigate}
        />
      );
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-slate-50 dark:bg-medical-dark transition-colors duration-300">
      
      <Sidebar 
        drugs={drugs}
        principles={principles}
        currentView={currentView}
        onNavigate={handleSidebarNavigate} // Use Sidebar specific handler
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Floating Expand Button - Shows when sidebar is collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden md:flex fixed left-0 top-4 z-40 p-2 rounded-r-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-lg"
          title="Expand Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
          </svg>
        </button>
      )}

      <main 
        id="main-content"
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto transition-all duration-300 relative"
      >
        
        {/* Top Navbar (Hamburger + Theme Toggle) */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-medical-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center h-16 shrink-0">
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
               title="Open Menu"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
             </button>
           </div>

           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             title="切换主题 (Toggle Theme)"
           >
             {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
             ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
             )}
           </button>
        </header>

        {/* Dynamic Content View */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default App;