import React from 'react';

/**
 * Convert numbers in text to subscript format
 * E.g., "D2 Receptor" -> "D₂ Receptor", "5-HT1A" -> "5-HT₁A"
 */
export const formatSubscriptNumbers = (text: string): React.ReactNode => {
  // Split by numbers and reconstruct with subscripts
  const parts = text.split(/(\d+)/);
  
  return parts.map((part, index) => {
    // If it's a number, convert to subscript
    if (/^\d+$/.test(part)) {
      return (
        <span key={index}>
          {part.split('').map((digit, i) => (
            <sub key={`${index}-${i}`}>{digit}</sub>
          ))}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const ENZYME_REGEX = /\b(?:CYP|UGT|MAO|COMT|FMO|CES)\d+[A-Z0-9]*\b/gi;

export const extractEnzymes = (text?: string): string[] => {
  if (!text) return [];
  const matches = text.match(ENZYME_REGEX) ?? [];
  return Array.from(new Set(matches.map(match => match.toUpperCase())));
};
