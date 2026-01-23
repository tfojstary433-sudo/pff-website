'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { teams } from '@/lib/data';
import Image from 'next/image';

import { RobloxAvatar } from '@/components/roblox-avatar';

interface PlayerStats {
  userId: string;
  username: string;
  avatarUrl: string | null;
  currentClub: string;
  position: string;
  value: number;
  previousClubs: any[];
  lastMatchNumber?: number;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
  recentMatches: Array<{
    date: string;
    opponent: string;
    opponentId?: string;
    result: string;
    minutes: number;
    goals: number;
    assists: number;
  }>;
}

export default function GraczPage() {
  const params = useParams();
  const username = params.username as string;
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profil' | 'statystyki' | 'mecze'>('profil');

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/players/${encodeURIComponent(username)}`);
        if (response.ok) {
          const playerData = await response.json();
          setPlayer(playerData);
        } else {
          // Fallback
          const mockPlayer: PlayerStats = {
            userId: '1',
            username: username,
            avatarUrl: null,
            currentClub: '---',
            position: '---',
            value: 0,
            previousClubs: [],
            lastMatchNumber: undefined,
            stats: {
              matches: 0,
              goals: 0,
              assists: 0,
              yellowCards: 0,
              redCards: 0
            },
            recentMatches: []
          };
          setPlayer(mockPlayer);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#00ccff]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#00ccff] rounded-full animate-spin"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!player) return null;

  const currentTeam = teams.find(t => t.id === player.currentClub || t.name === player.currentClub);
  const clubColor = currentTeam?.color || '#00ccff';
  
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ccff]/30">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background elements */}
        <div 
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{ 
            background: `radial-gradient(circle_at_20%_30%, ${clubColor} 0%, transparent 50%)` 
          }}
        ></div>
        <div 
          className="absolute top-0 right-0 w-full h-full opacity-10"
          style={{ 
            background: `radial-gradient(circle_at_80%_70%, ${clubColor} 0%, transparent 50%)` 
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
            {/* Avatar Container */}
            <div className="relative group">
              <div 
                className="absolute -inset-1 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"
                style={{ 
                  background: `linear-gradient(to bottom, ${clubColor}, ${clubColor}dd)` 
                }}
              ></div>
              <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white/10 bg-[#0a0a0a] shadow-2xl">
                <RobloxAvatar
                  username={player.username}
                  className="w-full h-full object-cover scale-110"
                />
              </div>
            </div>

            {/* Info Container */}
            <div className="text-center md:text-left flex-grow">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">
                  {player.username}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/60">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  {currentTeam && (
                    <img src={currentTeam.logo} alt={currentTeam.name} className="w-6 h-6 object-contain" />
                  )}
                  <span className="text-white font-bold text-lg">
                    {currentTeam ? currentTeam.name : (player.currentClub === '---' || !player.currentClub ? 'FREE Agent' : player.currentClub)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: clubColor }}
                  ></span>
                  <span className="text-lg font-medium">Numer {player.lastMatchNumber || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-20 z-40 bg-[#050505]/80 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex">
            {[
              { id: 'profil', label: 'Profil' },
              { id: 'statystyki', label: 'Statystyki' },
              { id: 'mecze', label: 'Ostatnie mecze' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ color: activeTab === tab.id ? clubColor : undefined }}
                className={`px-8 py-5 text-sm font-black uppercase tracking-widest transition-all relative ${
                  activeTab === tab.id
                    ? ''
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div 
                    className="absolute bottom-0 left-0 w-full h-1"
                    style={{ background: `linear-gradient(to right, ${clubColor}, ${clubColor}aa)` }}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="py-12 pb-24">
        <div className="container mx-auto px-4">
          {activeTab === 'profil' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personal Info Card */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-[#00ccff]/30 transition-colors duration-500">
                  <div 
                    className="absolute top-0 right-0 w-64 h-64 blur-[100px] -mr-32 -mt-32 opacity-20"
                    style={{ backgroundColor: clubColor }}
                  ></div>
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                    <span 
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: clubColor }}
                    ></span>
                    Informacje
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Aktualny klub</span>
                      <div className="flex items-center gap-3">
                        {currentTeam && <img src={currentTeam.logo} alt="" className="w-8 h-8 object-contain" />}
                        <span className="text-xl font-black italic">
                          {currentTeam ? currentTeam.name : (player.currentClub === '---' || !player.currentClub ? 'FREE Agent' : player.currentClub)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Numer na koszulce</span>
                      <span className="text-xl font-black italic">{player.lastMatchNumber || '-'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Wartość rynkowa</span>
                      <span className="text-xl font-black italic" style={{ color: clubColor }}>€{(player.value || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Transfer History Card */}
                <div className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/5 relative overflow-hidden group hover:border-[#00ccff]/30 transition-colors duration-500">
                  <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                    <span 
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: clubColor }}
                    ></span>
                    Poprzednie kluby
                  </h3>
                  
                  <div className="space-y-4">
                    {player.previousClubs.length > 0 ? (
                      player.previousClubs.map((clubId, index) => {
                        const club = teams.find(t => t.id === clubId || t.name === clubId);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 flex items-center justify-center bg-black rounded-xl p-2">
                                {club ? (
                                  <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-6 h-6 border-2 border-white/20 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-lg font-bold">{club?.name || clubId}</span>
                                <span className="text-xs text-white/40 italic">Dołączył: ---</span>
                              </div>
                            </div>
                            <span className="text-white/40 font-mono text-sm">Transfer</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-white/40 italic">Brak historii transferów</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Stats Summary */}
              <div className="space-y-6">
                <div 
                  className="rounded-3xl p-8 text-black relative overflow-hidden"
                  style={{ backgroundColor: clubColor }}
                >
                   <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
                   <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-70">Forma zawodnika</h4>
                   <p className="text-4xl font-black italic leading-tight">OCZEKIWANIE</p>
                </div>
                
                <div className="bg-[#0a0a0a] rounded-3xl p-6 border border-white/5">
                   <h4 className="text-white/40 text-xs font-black uppercase tracking-widest mb-6 text-center">Statystyki sezonu</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                        <span className="text-2xl font-black italic block">{player.stats.matches}</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Mecze</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                        <span className="text-2xl font-black italic block" style={{ color: clubColor }}>{player.stats.goals}</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Gole</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                        <span className="text-2xl font-black italic block" style={{ color: clubColor }}>{player.stats.assists}</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Asysty</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                        <span className="text-2xl font-black italic block text-yellow-500">{player.stats.yellowCards}</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Żółte</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statystyki' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Rozegrane mecze', value: player.stats.matches, color: 'text-white' },
                { label: 'Zdobyte bramki', value: player.stats.goals, color: `text-[${clubColor}]`, style: { color: clubColor } },
                { label: 'Zaliczone asysty', value: player.stats.assists, color: `text-[${clubColor}]`, style: { color: clubColor } },
                { label: 'Żółte kartki', value: player.stats.yellowCards, color: 'text-yellow-500' },
                { label: 'Czerwone kartki', value: player.stats.redCards, color: 'text-red-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#0a0a0a] rounded-3xl p-8 border border-white/5 text-center group hover:border-[#00ccff]/30 transition-all duration-300">
                  <div 
                    className={`text-5xl font-black italic mb-2 ${stat.color.startsWith('text-[') ? '' : stat.color}`}
                    style={stat.style}
                  >{stat.value}</div>
                  <div className="text-white/40 text-xs font-black uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mecze' && (
            <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden">
               {player.recentMatches.length > 0 ? (
                 <table className="w-full">
                   <thead>
                     <tr className="bg-white/5 text-left border-b border-white/10">
                       <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/40">Data</th>
                       <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/40">Przeciwnik</th>
                       <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/40 text-center">Wynik</th>
                       <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/40 text-center">G</th>
                       <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-white/40 text-center">A</th>
                     </tr>
                   </thead>
                   <tbody>
                     {player.recentMatches.map((match, idx) => (
                       <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                         <td className="px-6 py-4 text-sm font-medium text-white/60">{match.date}</td>
                         <td className="px-6 py-4 font-bold">{match.opponent}</td>
                         <td className="px-6 py-4 text-center"><span className="bg-white/5 px-3 py-1 rounded-lg font-mono">{match.result}</span></td>
                         <td className="px-6 py-4 text-center font-bold" style={{ color: clubColor }}>{match.goals}</td>
                         <td className="px-6 py-4 text-center font-bold" style={{ color: clubColor }}>{match.assists}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="text-center py-20">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <p className="text-white/40 italic">Brak rozegranych meczów w tym sezonie</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}