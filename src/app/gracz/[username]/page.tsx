'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { teams } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

import { RobloxAvatar } from '@/components/roblox-avatar';
import { RatingChart } from '@/components/rating-chart';
import { PlayerField } from '@/components/player-field';
import { mapPositionToPolish } from '@/lib/utils';
import { API_ENDPOINTS, COUNTRY_MAPPING } from '@/lib/constants';

interface PlayerStats {
  userId: string;
  username: string;
  avatarUrl: string | null;
  currentClub: string;
  position: string;
  value: number;
  previousClubs: string[];
  parentClub?: {
    name: string;
    joinedAt: string | null;
  } | null;
  lastMatchNumber?: number;
  verified?: boolean;
  country?: string;
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    cleanSheets?: number;
  };
  recentMatches: Array<{
    id?: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    minutes: number;
    goals: number;
    assists: number;
    yellowCards?: number;
    redCards?: number;
    rating?: number;
    league?: string;
    role?: 'starter' | 'sub';
    result?: 'W' | 'L' | 'D';
    jerseyNumber?: number;
    number?: number;
  }>;
}

export default function GraczPage() {
  const params = useParams();
  const username = params.username as string;
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profil' | 'statystyki' | 'mecze'>('profil');
  const [activeLeague, setActiveLeague] = useState<string>('Premier League');
  const [rankings, setRankings] = useState<{ goals: number; assists: number; totalPlayers: number } | null>(null);

  const extraStats = player ? {
    minutes: player.recentMatches?.reduce((acc, m) => acc + (m.minutes || 0), 0) || 0,
    started: player.recentMatches?.filter(m => m.role === 'starter').length || 0,
    avgRating: player.recentMatches?.length > 0 
      ? player.recentMatches.reduce((acc, m) => acc + (m.rating || 0), 0) / player.recentMatches.length 
      : 0
  } : { minutes: 0, started: 0, avgRating: 0 };

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`/api/players/${encodeURIComponent(username)}`);
        if (response.ok) {
          const playerData = await response.json();
          
          // Fetch all stats to calculate rankings
          try {
            const statsRes = await fetch(API_ENDPOINTS.STATS);
            if (statsRes.ok) {
              const allPlayers = await statsRes.json();
              const playersList = Array.isArray(allPlayers) ? allPlayers : (allPlayers.players || []);
              
              if (Array.isArray(playersList)) {
                const sortedGoals = [...playersList].sort((a, b) => (b.goals || 0) - (a.goals || 0));
                const sortedAssists = [...playersList].sort((a, b) => (b.assists || 0) - (a.assists || 0));
                
                const goalRank = sortedGoals.findIndex(p => p.username === playerData.username || p.userId === playerData.userId) + 1;
                const assistRank = sortedAssists.findIndex(p => p.username === playerData.username || p.userId === playerData.userId) + 1;
                
                setRankings({
                  goals: goalRank > 0 ? goalRank : sortedGoals.length,
                  assists: assistRank > 0 ? assistRank : sortedAssists.length,
                  totalPlayers: playersList.length
                });
              }
            }
          } catch (e) {
            console.error('Error calculating rankings:', e);
          }
          
          // Fetch matches from the new endpoint if we have a userId
          if (playerData.userId) {
            // Fetch country from history
            try {
              const historyResponse = await fetch(API_ENDPOINTS.PLAYERS_HISTORY);
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                const playerHistory = historyData.players[playerData.userId];
                if (playerHistory) {
                  // Prioritize top-level country field
                  if (playerHistory.country) {
                    playerData.country = playerHistory.country;
                  } else if (playerHistory.matches) {
                    // Fallback to matches
                    const matchWithCountry = playerHistory.matches.find((m: any) => m.country);
                    if (matchWithCountry) {
                      playerData.country = matchWithCountry.country;
                    }
                  }
                  
                  if (playerHistory.position) {
                    playerData.position = mapPositionToPolish(playerHistory.position);
                  } else if (playerHistory.matches) {
                    // Fallback to most recent match with position
                    const matchWithPosition = playerHistory.matches.find((m: any) => m.position);
                    if (matchWithPosition) {
                      playerData.position = mapPositionToPolish(matchWithPosition.position);
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching player history:', error);
            }

            try {
              const matchesResponse = await fetch(`/api/roblox/player/${playerData.userId}/matches`);
              if (matchesResponse.ok) {
                const matchesData = await matchesResponse.json();
                
                // Merge matches instead of overwriting to be safe
                const allMatches = [...(playerData.recentMatches || []), ...matchesData];
                const uniqueMatchesMap = new Map();
                for (const m of allMatches) {
                  const uniqueId = m.id || `${m.date}-${m.homeTeam}-${m.awayTeam}-${m.homeScore}-${m.awayScore}`;
                  if (!uniqueMatchesMap.has(uniqueId)) {
                    uniqueMatchesMap.set(uniqueId, m);
                  }
                }
                
                playerData.recentMatches = Array.from(uniqueMatchesMap.values())
                  .sort((a: any, b: any) => {
                    const parseDate = (d: string) => {
                      const p = d.split('.');
                      return p.length === 3 ? new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0])).getTime() : new Date(d).getTime();
                    };
                    return parseDate(b.date) - parseDate(a.date);
                  });
              }
            } catch (error) {
              console.error('Error fetching player matches:', error);
            }
          }
          
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
  
  const playerForm = (() => {
    if (!player.recentMatches || player.recentMatches.length === 0) return 'OCZEKIWANIE';
    const recentRatings = player.recentMatches
      .filter(m => m.rating && m.rating > 0)
      .slice(0, 5);
    
    if (recentRatings.length === 0) return 'OCZEKIWANIE';
    
    const avgRating = recentRatings.reduce((acc, m) => acc + (m.rating || 0), 0) / recentRatings.length;
    
    if (avgRating >= 8.5) return 'FENOMENALNA';
    if (avgRating >= 7.5) return 'BARDZO DOBRA';
    if (avgRating >= 6.5) return 'DOBRA';
    if (avgRating >= 5.5) return 'STABILNA';
    return 'DO POPRAWY';
  })();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ccff]/30">
      <Navbar />

      {/* Hero Section */}
      <div 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${clubColor}dd 0%, ${clubColor}88 50%, #000000 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)`
          }}></div>
        </div>
        
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
                {player.verified ? (
                  <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 text-[10px] font-black uppercase tracking-widest h-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    Zweryfikowany
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full border border-yellow-500/20 text-[10px] font-black uppercase tracking-widest h-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                    Dane archiwalne
                  </div>
                )}
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
                {player.country && (
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: clubColor }}
                    ></span>
                    <div className="flex items-center gap-2">
                      <img 
                        src={`https://flagcdn.com/w40/${player.country.toLowerCase()}.png`} 
                        alt={player.country} 
                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm border border-white/10"
                      />
                      <span className="text-lg font-medium">{COUNTRY_MAPPING[player.country] || player.country}</span>
                    </div>
                  </div>
                )}
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Field Visualizer */}
              <div className="lg:col-span-1 space-y-6">
                <PlayerField position={player.position} />
                
                {/* Trophies Section */}
                <div className="bg-[#111111] rounded-3xl p-6 border border-white/5 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-white/90">Trofea</h3>
                  
                  <div className="space-y-4">
                    {/* Placeholder for no trophies or you can add example ones if you want, 
                        but user said "na ta chwile zostaw puste" - although the image shows them.
                        I will add a container for them but keep it "empty" or with a nice message if none.
                        Actually, I'll implement the structure but leave it empty of data if possible,
                        or just a placeholder message. 
                        Wait, "zostaw puste" might mean just the header and container.
                    */}
                    <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-white/20 text-sm italic italic">Brak trofeów do wyświetlenia</p>
                    </div>
                  </div>
                </div>
              </div>

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
                      <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Pozycja</span>
                      <span className="text-xl font-black italic">{mapPositionToPolish(player.position)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Wartość rynkowa</span>
                      <span className="text-xl font-black italic" style={{ color: clubColor }}>€{(player.value || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Kraj</span>
                      {player.country ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={`https://flagcdn.com/w40/${player.country.toLowerCase()}.png`} 
                            alt={player.country} 
                            className="w-8 h-5 object-cover rounded shadow-lg"
                          />
                          <span className="text-xl font-black italic uppercase">{COUNTRY_MAPPING[player.country] || player.country}</span>
                        </div>
                      ) : (
                        <span className="text-xl font-black italic uppercase">---</span>
                      )}
                    </div>
                  </div>

                  {/* Rating Progression Chart */}
                  {player.recentMatches && player.recentMatches.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-white/5">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                          <span className="text-white/40 text-sm uppercase font-bold tracking-widest">Progresja Formy</span>
                          <span className="text-xs text-white/20 italic">Ostatnie 15 meczów</span>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: clubColor }}></div>
                             <span className="text-[10px] text-white/40 uppercase font-black">Ocena meczowa</span>
                           </div>
                        </div>
                      </div>
                      <RatingChart 
                        ratings={player.recentMatches.slice().reverse().map(m => m.rating || 0)} 
                        color={clubColor} 
                      />
                    </div>
                  )}
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
                      [...player.previousClubs].map((clubData, index) => {
                        const [clubName, joinedAt] = clubData.split('|');
                        const club = teams.find(t => t.name === clubName || t.id === clubName);
                        
                        // Check if this is the parent club
                        const isParentClub = player.parentClub && (
                          player.parentClub.name === clubName || 
                          (club && player.parentClub.name === club.name)
                        );
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors relative overflow-hidden group/item">
                            {isParentClub && (
                              <div className="absolute top-0 right-0 bg-yellow-500/10 px-3 py-1 rounded-bl-xl border-l border-b border-yellow-500/20">
                                <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Drużyna macierzysta</span>
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 flex items-center justify-center bg-black rounded-xl p-2">
                                {club ? (
                                  <img src={club.logo} alt={club.name} className="w-full h-full object-contain" />
                                ) : (
                                  <div className="w-6 h-6 border-2 border-white/20 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-lg font-bold">{club?.name || clubName}</span>
                                <span className="text-xs text-white/40 italic">
                                  {joinedAt && joinedAt !== '---' ? `Dołączył: ${joinedAt}` : 'Data nieznana'}
                                </span>
                              </div>
                            </div>
                            <span className={`font-mono text-sm transition-colors ${isParentClub ? 'text-yellow-500/0' : 'text-white/40 group-hover/item:text-[#00ccff]'}`}>
                              {isParentClub ? '' : 'Transfer'}
                            </span>
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
                   <p className="text-4xl font-black italic leading-tight">{playerForm}</p>
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
                      <div className="p-4 bg-white/5 rounded-2xl text-center">
                        <span className="text-2xl font-black italic block text-blue-400">{player.stats.cleanSheets || 0}</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Czyste</span>
                      </div>
                   </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-3xl p-6 border border-white/5 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ccff]/20 to-transparent"></div>
                   <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">Rankingi Ligowe</h4>
                   
                   <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group/rank hover:border-[#00ccff]/30 transition-all">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-white/40 uppercase font-black">Strzelcy</span>
                            <span className="text-[10px] font-black text-[#00ccff]">Top {rankings ? Math.round((rankings.goals / rankings.totalPlayers) * 100) : '--'}%</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic">#{rankings?.goals || '--'}</span>
                            <span className="text-white/20 text-xs font-bold">/ {rankings?.totalPlayers || '--'}</span>
                         </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group/rank hover:border-[#00ccff]/30 transition-all">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-white/40 uppercase font-black">Asystenci</span>
                            <span className="text-[10px] font-black text-[#00ccff]">Top {rankings ? Math.round((rankings.assists / rankings.totalPlayers) * 100) : '--'}%</span>
                         </div>
                         <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black italic">#{rankings?.assists || '--'}</span>
                            <span className="text-white/20 text-xs font-bold">/ {rankings?.totalPlayers || '--'}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                         <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                            <span className="block text-[8px] text-white/30 uppercase font-black mb-1">Efektywność</span>
                            <span className="text-sm font-black italic text-green-500">
                               {player.stats.matches > 0 ? ((player.stats.goals + player.stats.assists) / player.stats.matches).toFixed(1) : '0.0'}
                            </span>
                         </div>
                         <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                            <span className="block text-[8px] text-white/30 uppercase font-black mb-1">Status</span>
                            <span className="text-[9px] font-black uppercase text-[#00ccff] tracking-tighter">
                               {player.stats.goals > 5 ? 'KLUCZOWY' : 'REGULARNY'}
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-4 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                      <p className="text-[9px] text-white/30 italic leading-relaxed text-center uppercase tracking-tighter">
                        Pozycje w rankingach są obliczane w czasie rzeczywistym na podstawie statystyk wszystkich zarejestrowanych zawodników ligi.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statystyki' && (
            <div className="space-y-12">
              <div className="bg-[#111111] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                {/* League Header - Redesigned */}
                <div className="bg-white/5 px-8 py-10 border-b border-white/5 flex flex-col items-center justify-center">
                  <div className="w-full max-w-[280px] aspect-video flex items-center justify-center">
                    <img 
                      src="https://i.ibb.co/ksb3b2Bs/obraz-2026-01-29-190552532.png" 
                      alt="League Logo" 
                      className="w-full h-full object-contain brightness-110"
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
                    {/* Row 1 */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-3xl font-bold mb-1">{player.stats.goals}</span>
                      <span className="text-white/40 text-sm font-medium">Bramki</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-3xl font-bold mb-1">{player.stats.assists}</span>
                      <span className="text-white/40 text-sm font-medium">Asysty</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-3xl font-bold mb-1">{extraStats.started}</span>
                      <span className="text-white/40 text-sm font-medium">Rozpoczęte</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-3xl font-bold mb-1">{player.stats.matches}</span>
                      <span className="text-white/40 text-sm font-medium">Mecze</span>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-3xl font-bold mb-1">{extraStats.minutes}</span>
                      <span className="text-white/40 text-sm font-medium">Rozegrane minuty</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-orange-600 px-4 py-1.5 rounded-lg mb-1">
                        <span className="text-2xl font-bold text-white leading-none">
                          {extraStats.avgRating.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <span className="text-white/40 text-sm font-medium">Ocena</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3.5 h-5 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.3)]"></div>
                        <span className="text-3xl font-bold">{player.stats.yellowCards}</span>
                      </div>
                      <span className="text-white/40 text-sm font-medium">Żółte kartki</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3.5 h-5 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                        <span className="text-3xl font-bold">{player.stats.redCards}</span>
                      </div>
                      <span className="text-white/40 text-sm font-medium">Czerwone kartki</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mecze' && (
            <div className="max-w-2xl mx-auto">
              {player.recentMatches.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {player.recentMatches.map((match, idx) => {
                    const homeTeam = teams.find(t => t.id === match.homeTeam || t.name === match.homeTeam);
                    const awayTeam = teams.find(t => t.id === match.awayTeam || t.name === match.awayTeam);
                    
                    return (
                      <Link 
                        key={idx} 
                        href={match.id ? `/mecz/${match.id}` : '#'}
                        className="group bg-[#0a0a0a] rounded-3xl border border-white/5 hover:border-[#00ccff]/30 transition-all duration-500 overflow-hidden relative"
                      >
                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00ccff]/0 via-[#00ccff]/5 to-[#00ccff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 p-6 md:p-8">
                          {/* Top Row: Date & League */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00ccff] animate-pulse"></div>
                                <span className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">{match.date}</span>
                              </div>
                              
                              {/* Starter / Sub Icon */}
                              <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/5" title={match.role === 'starter' ? 'Pierwszy skład' : 'Wejście z ławki'}>
                                {match.role === 'starter' ? (
                                  <svg className="w-4 h-4 text-[#00ccff]" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3h-2v7H4v2h7v7h2v-7h7v-2h-7z"/></svg>
                                ) : (
                                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/></svg>
                                )}
                              </div>

                              {/* Match Result Indicator */}
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${
                                match.result === 'W' ? 'bg-green-500/20 border-green-500/30 text-green-500' :
                                match.result === 'L' ? 'bg-red-500/20 border-red-500/30 text-red-500' :
                                'bg-white/10 border-white/10 text-white/40'
                              }`}>
                                {match.result || 'D'}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 bg-white/5 px-2 py-2 rounded-2xl border border-white/5 shadow-inner">
                               <img 
                                 src="https://i.ibb.co/jkygrVbQ/obraz-2026-01-28-111900005.png" 
                                 alt="PFF" 
                                 className="w-14 h-14 object-contain brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                               />
                            </div>

                            {/* Middle Row: Score Centered */}
                          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex items-center justify-center gap-4 md:gap-8 flex-grow">
                              {/* Home Team */}
                              <div className="flex flex-col items-center md:items-end gap-3 min-w-[100px] md:min-w-[140px]">
                                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-white/5 group-hover:border-[#00ccff]/20 transition-colors">
                                  {homeTeam?.logo ? (
                                    <img src={homeTeam.logo} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="w-8 h-8 border-2 border-white/10 rounded-full" />
                                  )}
                                </div>
                                <span className="text-xs md:text-sm font-black uppercase italic tracking-tighter text-center md:text-right max-w-[120px] md:max-w-none">
                                  {homeTeam?.name || match.homeTeam}
                                </span>
                              </div>

                              {/* Score */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 group-hover:border-[#00ccff]/40 transition-all duration-500 group-hover:scale-110 shadow-xl shadow-black/50">
                                  <span className="text-3xl md:text-4xl font-black italic tracking-tighter tabular-nums">
                                    {match.homeScore} - {match.awayScore}
                                  </span>
                                </div>
                                <div className="h-1 w-8 bg-[#00ccff]/20 rounded-full"></div>
                              </div>

                              {/* Away Team */}
                              <div className="flex flex-col items-center md:items-start gap-3 min-w-[100px] md:min-w-[140px]">
                                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-white/5 group-hover:border-[#00ccff]/20 transition-colors">
                                  {awayTeam?.logo ? (
                                    <img src={awayTeam.logo} alt="" className="w-full h-full object-contain" />
                                  ) : (
                                    <div className="w-8 h-8 border-2 border-white/10 rounded-full" />
                                  )}
                                </div>
                                <span className="text-xs md:text-sm font-black uppercase italic tracking-tighter text-center md:text-left max-w-[120px] md:max-w-none">
                                  {awayTeam?.name || match.awayTeam}
                                </span>
                              </div>
                            </div>

                            {/* Right Section: Stats Summary */}
                            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-3xl border border-white/5">
                              {(match.goals > 0 || match.assists > 0 || (match.yellowCards || 0) > 0 || (match.redCards || 0) > 0) && (
                                <div className="flex gap-2 mr-2 border-r border-white/10 pr-4">
                                  {match.goals > 0 && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] font-black text-[#00ccff] uppercase mb-1">Gole</span>
                                      <div className="flex gap-0.5">
                                        {Array.from({ length: match.goals }).map((_, i) => (
                                          <svg key={i} className="w-4 h-4 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                            <circle cx="12" cy="12" r="5"/>
                                          </svg>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {(match.yellowCards || 0) > 0 && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] font-black text-yellow-500 uppercase mb-1">Kartka</span>
                                      <div className="w-4 h-6 bg-yellow-500 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                                    </div>
                                  )}
                                  {(match.redCards || 0) > 0 && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] font-black text-red-500 uppercase mb-1">Kartka</span>
                                      <div className="w-4 h-6 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                    </div>
                                  )}
                                  {match.assists > 0 && (
                                    <div className="flex flex-col items-center">
                                      <span className="text-[8px] font-black text-green-500 uppercase mb-1">Asy</span>
                                      <div className="bg-green-500 text-black w-8 h-8 rounded-xl flex items-center justify-center font-black italic shadow-lg shadow-green-500/20">
                                        {match.assists}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                  <span className="text-[8px] font-black text-white/40 uppercase mb-1">Minuty</span>
                                  <div className="bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 text-[10px] font-black italic">
                                    {match.minutes}'
                                  </div>
                                </div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[8px] font-black text-white/40 uppercase mb-1">Ocena</span>
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 text-[10px] font-black italic ${
                                    (match.rating || 0) >= 7.5 ? 'bg-green-500/20 text-green-400' : 
                                    (match.rating || 0) >= 6.5 ? 'bg-yellow-500/20 text-yellow-400' : 
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {(match.rating || 0).toFixed(1).replace('.', ',')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-20 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10 relative z-10">
                    <svg className="w-12 h-12 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-black italic uppercase mb-2 relative z-10">Cisza na stadionie</h4>
                  <p className="text-white/40 italic relative z-10 max-w-xs mx-auto">Ten zawodnik nie rozegrał jeszcze żadnego meczu w tym sezonie.</p>
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