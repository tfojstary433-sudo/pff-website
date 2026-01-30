'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import { teams } from '@/lib/data';
import { useState, useEffect } from 'react';

export default function KlubyPage() {
  const displayTeams = [
    'Zawisza Bydgoszcz',
    'Arka Gdynia',
    'Unia Skierniewice',
    'Legia Warszawa',
    'Lech Poznań',
    'Pogoń Szczecin',
    'Zagłębie Lubin',
    'Lechia Gdańsk',
    'Wisła Kraków',
    'Sokół Olsztyn',
    'Grom Nowy Staw',
    'Motor Lublin',
    'Olimpia Elbląg',
    'Chojniczanka Chojnice',
    'Jagiellonia Białystok',
    'Wisła Płock'
  ];

  const filteredTeams = teams.filter(team =>
    displayTeams.includes(team.name)
  );

  const [playerCounts, setPlayerCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Fetch player counts for all teams
    const fetchPlayerCounts = async () => {
      const counts: { [key: string]: number } = {};

      for (const team of filteredTeams) {
        try {
          const response = await fetch(`/api/club/players/${team.id}`);
          const data = await response.json();
          counts[team.id] = data.players ? data.players.length : 0;
        } catch (error) {
          console.error('Error fetching players for', team.id, ':', error);
          counts[team.id] = 0;
        }
      }

      setPlayerCounts(counts);
    };

    fetchPlayerCounts();
  }, [filteredTeams]);

  return (
    <>
      <Navbar />
      
      <div className="relative py-10 overflow-hidden bg-[#003087]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/30 via-blue-800/40 to-blue-900/30 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
                <img 
                  src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png" 
                  alt="Logo" 
                  className="h-14 w-auto"
                />
              </div>
              
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                KLUBY 2025/2026
              </h1>
              
              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="relative min-h-screen bg-cover bg-center py-16"
        style={{
          backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <Link
                key={team.id}
                href={`/klub/${team.id}`}
                className="bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 shadow-xl flex flex-col items-center justify-center min-h-[250px] backdrop-blur-sm group"
              >
                <div className="mb-6 relative">
                  <div 
                    className="absolute inset-0 blur-2xl opacity-20 scale-150 rounded-full"
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <img 
                    src={team.logo} 
                    alt={team.name}
                    className="relative z-10 w-24 h-24 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-logo.png';
                    }}
                  />
                </div>
                
                <h2 className="text-white font-black text-xl text-center uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                  {team.name}
                </h2>

                <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mb-3"></div>

                <div className="text-center">
                  <div className="text-gray-400 text-xs font-bold tracking-widest uppercase">
                    {playerCounts[team.id] !== undefined ? (
                      <span>{playerCounts[team.id]} ZAWODNIKÓW</span>
                    ) : (
                      <span>Ładowanie...</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
