'use client';

import React from 'react';

interface PlayerFieldProps {
  position?: string;
}

const positionCoordinates: Record<string, { top: string; left: string; label: string }> = {
  'GK': { top: '85%', left: '50%', label: 'BR' },
  'CB': { top: '70%', left: '50%', label: 'ŚO' },
  'LB': { top: '70%', left: '20%', label: 'LO' },
  'RB': { top: '70%', left: '80%', label: 'PO' },
  'CDM': { top: '55%', left: '50%', label: 'DP' },
  'CM': { top: '45%', left: '50%', label: 'ŚP' },
  'CAM': { top: '35%', left: '50%', label: 'OP' },
  'LM': { top: '45%', left: '20%', label: 'LP' },
  'RM': { top: '45%', left: '80%', label: 'PP' },
  'LW': { top: '20%', left: '20%', label: 'LN' },
  'RW': { top: '20%', left: '80%', label: 'PN' },
  'ST': { top: '15%', left: '50%', label: 'N' },
  'CF': { top: '25%', left: '50%', label: 'ŚN' },
};

// Default mappings for general positions
const generalMappings: Record<string, string> = {
  'Bramkarz': 'GK',
  'Obrońca': 'CB',
  'Pomocnik': 'CM',
  'Napastnik': 'ST',
  'BR': 'GK',
  'ŚO': 'CB',
  'LO': 'LB',
  'PO': 'RB',
  'DP': 'CDM',
  'ŚP': 'CM',
  'OP': 'CAM',
  'LP': 'LM',
  'PP': 'RM',
  'LN': 'LW',
  'PN': 'RW',
  'N': 'ST',
  'ŚN': 'CF',
  '---': 'CM'
};

export const PlayerField: React.FC<PlayerFieldProps> = ({ position = '---' }) => {
  // Normalize position
  let posKey = position.toUpperCase();
  if (!positionCoordinates[posKey]) {
    posKey = generalMappings[position] || 'CM';
  }

  const activePos = positionCoordinates[posKey] || positionCoordinates['CM'];
  const hasPosition = position && position !== '---';

  return (
    <div className="relative w-full aspect-[3/4] bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden p-4">
      {/* Field Background */}
      <div className="absolute inset-4 border-2 border-white/10 rounded-sm">
        {/* Halfway line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10" />
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/10 rounded-full flex items-center justify-center">
          <img 
            src="https://i.ibb.co/W4P6qbPc/image.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain opacity-20"
          />
        </div>
        {/* Penalty areas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 border-2 border-t-0 border-white/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 border-2 border-b-0 border-white/10" />
      </div>

      {/* Main Position */}
      {hasPosition && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-500 w-10 h-10 bg-red-900 text-white font-black z-20 scale-110 shadow-[0_0_20px_rgba(153,27,27,0.5)] rounded-full text-xs uppercase italic"
          style={{ top: activePos.top, left: activePos.left }}
        >
          {activePos.label}
        </div>
      )}
    </div>
  );
};
