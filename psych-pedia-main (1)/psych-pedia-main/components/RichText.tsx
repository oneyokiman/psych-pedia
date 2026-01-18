import React from 'react';
import { PRINCIPLES } from '../constants';

interface RichTextProps {
  content: string;
  onNavigate: (type: 'principle', id: string) => void;
}

const RichText: React.FC<RichTextProps> = ({ content, onNavigate }) => {
  // Create a regex pattern from all principle IDs and Titles to find matches
  // Sorting by length desc to match longest terms first (e.g. "D2 Receptor" before "D2")
  const patterns = PRINCIPLES.map(p => ({
    id: p.id,
    term: p.title.split(' ')[0], // Match "D2" from "D2 多巴胺受体"
    fullTitle: p.title
  })).sort((a, b) => b.term.length - a.term.length);

  // Simple splitting by spaces/punctuation is tricky in Chinese/English mix.
  // We will manually iterate for known keywords.
  
  // This is a simplified parser. It splits by known keywords.
  let parts: (string | React.ReactNode)[] = [content];

  patterns.forEach(pattern => {
    const keyword = pattern.term; // e.g., "D2", "5HT1A"
    const nextParts: (string | React.ReactNode)[] = [];
    
    parts.forEach(part => {
      if (typeof part !== 'string') {
        nextParts.push(part);
        return;
      }

      // Case insensitive match
      const regex = new RegExp(`(${keyword})`, 'gi');
      const split = part.split(regex);

      split.forEach((s, i) => {
        if (s.toLowerCase() === keyword.toLowerCase()) {
           nextParts.push(
             <span 
               key={`${pattern.id}-${i}`}
               onClick={(e) => {
                 e.stopPropagation();
                 onNavigate('principle', pattern.id);
               }}
               className="text-cyan-600 dark:text-cyan-400 font-bold cursor-pointer hover:underline hover:text-cyan-500 mx-0.5"
               title={`跳转至 ${pattern.fullTitle}`}
             >
               {s}
             </span>
           );
        } else {
           nextParts.push(s);
        }
      });
    });
    parts = nextParts;
  });

  return <p className="text-sm opacity-80 leading-relaxed">{parts}</p>;
};

export default RichText;