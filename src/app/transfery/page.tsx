'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { DateBar } from '@/components/date-bar';
import { RobloxAvatar } from '@/components/roblox-avatar';
import { API_ENDPOINTS } from '@/lib/constants';
import { teams, Team } from '@/lib/data';
import { mapPositionToPolish } from '@/lib/utils';

interface Transfer {
  id: string;
  player: string;
  position: string;
  from: string;
  to: string;
  fromLogo: string;
  toLogo: string;
  robloxUsername: string;
  date: string;
  timestamp: number;
}

export default function TransferyPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing' | 'loans'>('all');

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PLAYERS_HISTORY);
        if (response.ok) {
          const data = await response.json();
          const allTransfers: Transfer[] = [];

          if (data.players) {
            Object.entries(data.players).forEach(([userId, player]: [string, any]) => {
              if (player.matches && player.matches.length > 0) {
                // Sort matches by date ascending
                const sortedMatches = [...player.matches].sort((a: any, b: any) => 
                  new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()
                );

                let lastTeamName = '';
                
                sortedMatches.forEach((match: any) => {
                  const currentTeamName = match.playerTeam;
                  
                  if (lastTeamName && currentTeamName !== lastTeamName) {
                    const fromTeam = teams.find(t => t.name === lastTeamName || t.id === lastTeamName);
                    const toTeam = teams.find(t => t.name === currentTeamName || t.id === currentTeamName);

                    allTransfers.push({
                      id: `${userId}-${match.playedAt}`,
                      player: player.name || 'Nieznany',
                      position: mapPositionToPolish(player.position || match.position || '---'),
                      from: fromTeam?.name || lastTeamName,
                      to: toTeam?.name || currentTeamName,
                      fromLogo: fromTeam?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
                      toLogo: toTeam?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png',
                      robloxUsername: player.name,
                      date: match.playedAt ? new Date(match.playedAt).toLocaleDateString('pl-PL') : '---',
                      timestamp: new Date(match.playedAt).getTime()
                    });
                  }
                  lastTeamName = currentTeamName;
                });
              }
            });
          }

          // Sort all transfers by timestamp descending
          setTransfers(allTransfers.sort((a, b) => b.timestamp - a.timestamp));
        }
      } catch (error) {
        console.error('Error fetching transfers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const filteredTransfers = transfers; // Simplification for now as history doesn't specify loan/transfer type

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
                TRANSFERY 2025/2026
              </h1>

              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Transfer tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 justify-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'incoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Przybyli
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'outgoing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Odeszli
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'loans'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Wypożyczenia
              </button>
            </div>

            {/* Transfer list */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => (
                  <div key={transfer.id} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative flex-shrink-0">
                          <RobloxAvatar
                            username={transfer.robloxUsername}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-500"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-bold text-base sm:text-lg truncate">{transfer.player}</h3>
                          <p className="text-gray-400 text-sm">{transfer.position}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-4 sm:gap-12 flex-grow max-w-2xl">
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                          <img
                            src={transfer.fromLogo}
                            alt={transfer.from}
                            className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                          />
                          <div className="text-center">
                            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Z</div>
                            <div className="text-white font-black text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{transfer.from}</div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="text-2xl sm:text-4xl text-green-400 font-light tracking-tighter">→</div>
                        </div>

                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                          <img
                            src={transfer.toLogo}
                            alt={transfer.to}
                            className="w-6 h-6 sm:w-10 sm:h-10 object-contain"
                          />
                          <div className="text-center">
                            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest">DO</div>
                            <div className="text-white font-black text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">{transfer.to}</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center sm:text-right flex-shrink-0 min-w-[100px]">
                        <div className="text-white font-black text-sm sm:text-lg tracking-wider">{transfer.date}</div>
                        <div className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Potwierdzone</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Brak transferów w tej kategorii</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DateBar />
      <Footer />
    </>
  );
}