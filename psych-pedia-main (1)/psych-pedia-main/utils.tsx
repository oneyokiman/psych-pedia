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
