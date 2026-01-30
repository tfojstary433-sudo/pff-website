'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { teams, mockPlayersData } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { RobloxAvatar } from './roblox-avatar';
import { API_ENDPOINTS, COUNTRY_MAPPING } from '@/lib/constants';
import { mapPositionToPolish } from '@/lib/utils';

const StatCard = ({ title, players, metric, label, color = "blue", isInTab = false }: { title: string, players: any[], metric: string, label: string, color?: "blue" | "green" | "yellow" | "red", isInTab?: boolean }) => {
  const topPlayer = players[0];
  const otherPlayers = players.slice(1, isInTab ? 5 : 7);
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);
  
  let themeColor = "#00ccff";
  let bgGradient = "from-[#0033cc]/10";

  if (color === "green") {
    themeColor = "#10b981";
    bgGradient = "from-[#10b981]/10";
  } else if (color === "yellow") {
    themeColor = "#fbbf24";
    bgGradient = "from-[#fbbf24]/10";
  } else if (color === "red") {
    themeColor = "#ef4444";
    bgGradient = "from-[#ef4444]/10";
  }

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden glass border border-white/5 shadow-2xl ${isInTab ? 'border-none bg-transparent shadow-none' : ''}`}>
      {/* Title Header */}
      <div className={`${isInTab ? 'bg-[#0033cc]/20' : bgGradient} backdrop-blur-md py-4 px-6 border-b border-white/5 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: themeColor }} />
        <h3 className="font-black text-[11px] uppercase tracking-[0.2em]" style={{ color: themeColor }}>
          {title}
        </h3>
      </div>

      {/* Top Player Section */}
      {topPlayer && (
        <div className={`relative ${isInTab ? 'p-4 min-h-[180px]' : 'p-6 min-h-[220px]'} overflow-hidden group`}>
          {/* Elegant Leader Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/20 via-[#b8860b]/10 to-transparent" />
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
              <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.2) 10px, rgba(255,215,0,0.2) 20px)`
              }}></div>
          </div>
          
          <div className="relative z-20 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black text-[10px] shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                1
              </div>
              <span className="text-yellow-500/80 text-[10px] font-black uppercase tracking-widest">Lider</span>
              {topPlayer.country && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <img 
                    src={`https://flagcdn.com/w40/${topPlayer.country.toLowerCase()}.png`} 
                    alt={topPlayer.country} 
                    className="w-6 h-4 object-cover rounded-sm border border-white/10 shadow-lg"
                  />
                </div>
              )}
            </div>

            <h4 className={`text-white font-black uppercase mb-2 tracking-tighter leading-none group-hover:text-yellow-500 transition-colors ${isInTab ? 'text-xl truncate max-w-[150px]' : 'text-3xl'}`}>
              {topPlayer.name}
            </h4>
            
            {topPlayer.position && topPlayer.position !== '---' && (
              <p className="text-[#00ccff] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                {mapPositionToPolish(topPlayer.position)}
              </p>
            )}

            <div className="mt-auto flex items-end gap-3">
              <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl group-hover:border-yellow-500/50 transition-colors ${isInTab ? 'px-4 py-2 min-w-[60px]' : 'px-6 py-3 min-w-[80px]'}`}>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</span>
                <span className={`${isInTab ? 'text-2xl' : 'text-3xl'} font-black text-white leading-none`}>
                  {metric === 'points' ? (topPlayer.points || (topPlayer.goals + (topPlayer.assists || 0))) : topPlayer[metric]}
                </span>
              </div>
              
              {getTeam(topPlayer.teamId) && (
                <Link href={`/klub/${topPlayer.teamId}`} className="hover:scale-110 transition-transform active:scale-95 duration-300">
                  <div className={`${isInTab ? 'w-10 h-10' : 'w-14 h-14'} bg-white/5 backdrop-blur-md rounded-2xl p-2 flex items-center justify-center border border-white/10 hover:border-white/30 transition-all`}>
                    <Image 
                      src={getTeam(topPlayer.teamId)!.logo} 
                      alt="Team Logo" 
                      width={isInTab ? 24 : 40} 
                      height={isInTab ? 24 : 40} 
                      className="object-contain"
                    />
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Avatar - Circular Frame */}
          <div className={`absolute right-4 bottom-4 z-10 group-hover:scale-105 transition-transform duration-700 ${isInTab ? 'w-24 h-24' : 'w-36 h-36'}`}>
              <div className="w-full h-full rounded-full border-4 border-yellow-500/50 bg-black/40 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] relative group-hover:border-yellow-500 transition-colors">
                  <RobloxAvatar
                    username={topPlayer.name}
                    className="w-full h-full object-cover scale-125 translate-y-2"
                  />
              </div>
          </div>
        </div>
      )}

      {/* List Header Bar */}
      <div className={`bg-black/40 py-3 flex justify-between items-center border-y border-white/5 ${isInTab ? 'px-4' : 'px-6'}`}>
        <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">Zawodnik</span>
        <span className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] ml-auto">{label}</span>
      </div>

      {/* List Players */}
      <div className="flex flex-col bg-[#0a0a0a]/50">
        {otherPlayers.map((player, idx) => {
          const team = getTeam(player.teamId);
          const val = metric === 'points' ? (player.points || (player.goals + (player.assists || 0))) : player[metric];
          const position = idx + 2;
          
          return (
            <div 
              key={player.playerId} 
              className={`group/row flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors relative overflow-hidden ${isInTab ? 'px-4 py-3' : 'px-6 py-4'}`}
            >
              {/* Position Highlight */}
              {position === 2 && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.5)]" />
              )}
              {position === 3 && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-[#cd7f32] shadow-[0_0_15px_rgba(205,127,50,0.5)]" />
              )}

              <div className="flex items-center gap-4 flex-1 relative z-10">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                  position === 2 ? 'bg-gradient-to-br from-gray-100 to-gray-400 text-black shadow-[0_0_15px_rgba(156,163,175,0.3)]' :
                  position === 3 ? 'bg-gradient-to-br from-[#e8a87c] to-[#cd7f32] text-black shadow-[0_0_15px_rgba(205,127,50,0.3)]' :
                  'bg-white/5 text-gray-400 group-hover/row:text-white group-hover/row:bg-white/10'
                }`}>
                  {position}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm uppercase tracking-tight transition-colors truncate max-w-[120px] ${
                      position === 2 ? 'text-gray-200 group-hover/row:text-white' :
                      position === 3 ? 'text-orange-200 group-hover/row:text-orange-100' :
                      'text-white group-hover/row:text-[#00ccff]'
                    }`}>
                        {player.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {player.country && (
                        <img 
                          src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`} 
                          alt={player.country} 
                          className="w-4 h-3 object-cover rounded-sm border border-white/10"
                        />
                      )}
                      {player.position && player.position !== '---' && (
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter">
                          {mapPositionToPolish(player.position)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-5 relative z-10">
                <span className="font-black text-lg text-white text-right min-w-[24px]">
                  {val}
                </span>
                {team && (
                  <Link href={`/klub/${team.id}`} className="hover:scale-110 active:scale-90 transition-all duration-300">
                    <div className="w-9 h-9 rounded-xl p-1.5 flex items-center justify-center bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all">
                      <Image 
                        src={team.logo} 
                        alt="Logo" 
                        width={24} 
                        height={24} 
                        className="object-contain"
                      />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export function Statistics({ isInTab = false }: { isInTab?: boolean } = {}) {
    const { topScorers, standings } = useMatchStats();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

   useEffect(() => {
     setMounted(true);
   }, []);

   // Search effect
   useEffect(() => {
     const searchPlayers = async () => {
       if (searchQuery.length < 2) {
         setSearchResults([]);
         return;
       }

       setSearching(true);
       try {
         const response = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
         if (response.ok) {
           const results = await response.json();
           setSearchResults(results);
         }
       } catch (error) {
         console.error('Search error:', error);
       } finally {
         setSearching(false);
       }
     };

     const timeoutId = setTimeout(searchPlayers, 300);
     return () => clearTimeout(timeoutId);
   }, [searchQuery]);

   const activePlayers = topScorers.length > 0 ? topScorers : mockPlayersData;

  const getTeamBySearch = (clubName: string, clubId: string) => {
    return teams.find(t => 
      t.name.toLowerCase() === clubName?.toLowerCase() || 
      t.id.toLowerCase() === clubId?.toLowerCase() ||
      t.shortName.toLowerCase() === clubName?.toLowerCase()
    );
  };

  const topScorersSorted = [...activePlayers].sort((a, b) => b.goals - a.goals);
  const topAssistsSorted = [...activePlayers].sort((a, b) => (b.assists || 0) - (a.assists || 0));
  const topPointsSorted = [...activePlayers].sort((a, b) =>
    ((b.goals + (b.assists || 0))) - ((a.goals + (a.assists || 0)))
  );
  const topKeepersSorted = [...activePlayers].filter(p => (p.cleanSheets || 0) > 0).sort((a, b) => (b.cleanSheets || 0) - (a.cleanSheets || 0));
  const topYellowCardsSorted = [...activePlayers].filter(p => (p.yellowCards || 0) > 0).sort((a, b) => (b.yellowCards || 0) - (a.yellowCards || 0));
  const topRedCardsSorted = [...activePlayers].filter(p => (p.redCards || 0) > 0).sort((a, b) => (b.redCards || 0) - (a.redCards || 0));

  const content = (
    <div className="relative">
      {!isInTab && (
        <div className="flex flex-col items-center mb-16">
            <div className="gradient-border px-16 py-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center relative overflow-hidden bg-[#0a0a0a]">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <h2 className="relative z-10 text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                Statystyki
              </h2>
              <div className="relative z-10 w-24 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 mt-4 transform -skew-x-12 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            </div>
        </div>
      )}

      <div className={`${isInTab ? 'max-w-full' : 'max-w-[1400px] mx-auto'} relative z-10`}>
        {/* Player Search Section - Now outside individual cards */}
        {!isInTab && (
          <div className="max-w-4xl mx-auto mb-16 px-4">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#00ccff]" />
              
              <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-3">
                SZUKAJ ZAWODNIKA
              </h2>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Wpisz nazwę zawodnika (min. 2 znaki)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-[#00ccff]/50 focus:ring-1 focus:ring-[#00ccff]/20 transition-all text-lg"
                />
                <div className="absolute right-6 top-4.5 text-gray-400 mt-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {searchQuery.length >= 2 && (
                <div className="space-y-4">
                  <div className="text-sm text-white/40 italic flex items-center justify-between">
                    <span>{searching ? 'Szukam...' : `Znaleziono ${searchResults.length} wyników`}</span>
                    {searchResults.length > 0 && <span className="text-[#00ccff] font-bold">KLIKNIJ ABY ZOBACZYĆ PROFIL</span>}
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                      {searchResults.map((player) => {
                        const team = getTeamBySearch(player.clubName, player.clubId);
                        const playerRank = topPointsSorted.findIndex(p => 
                          p.name.toLowerCase() === player.username.toLowerCase() || 
                          p.playerId.toString() === player.userId
                        ) + 1;

                        return (
                          <Link
                            key={player.username}
                            href={`/gracz/${player.username}`}
                            className="bg-white/5 hover:bg-white/10 rounded-2xl p-5 border border-white/5 hover:border-[#00ccff]/30 transition-all cursor-pointer group flex items-center gap-4 relative overflow-hidden"
                          >
                            {playerRank > 0 && playerRank <= 100 && (
                              <div className="absolute top-0 right-0 bg-[#00ccff]/10 px-3 py-1 rounded-bl-xl border-l border-b border-[#00ccff]/20">
                                <span className="text-[10px] font-black text-[#00ccff]">MIEJSCE #{playerRank}</span>
                              </div>
                            )}

                            <div className="relative flex-shrink-0">
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#00ccff]/50 transition-colors bg-black">
                                <RobloxAvatar username={player.username} className="w-full h-full object-cover" />
                              </div>
                              {player.verified && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-[#00ccff] flex items-center justify-center shadow-lg">
                                  <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-black italic uppercase text-xl truncate group-hover:text-[#00ccff] transition-colors tracking-tight">
                                {player.username}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                 {team && (
                                   <div className="w-5 h-5 flex-shrink-0">
                                     <Image src={team.logo} alt={team.name} width={20} height={20} className="object-contain" />
                                   </div>
                                 )}
                                 <p className={`text-xs font-bold uppercase tracking-widest ${player.clubName === '---' || !player.clubName ? 'text-white/20' : 'text-[#00ccff]'}`}>
                                   {player.clubName === '---' || !player.clubName ? 'FREE Agent' : (team?.name || player.clubName)}
                                 </p>
                                 {player.position && player.position !== '---' && (
                                   <>
                                     <span className="text-white/10">•</span>
                                     <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">{mapPositionToPolish(player.position)}</p>
                                   </>
                                 )}
                                 {player.country && (
                                   <>
                                     <span className="text-white/10">•</span>
                                     <div className="flex items-center gap-1.5">
                                       <img 
                                         src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`} 
                                         alt={player.country} 
                                         className="w-3.5 h-2.5 object-cover rounded-sm"
                                       />
                                       <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                                         {COUNTRY_MAPPING[player.country] || player.country}
                                       </p>
                                     </div>
                                   </>
                                 )}
                              </div>
                            {player.stats && (
                              <div className="flex gap-4 text-[10px] text-white/20 mt-3 font-black uppercase">
                                <div className="bg-white/5 px-2 py-0.5 rounded">G: <span className="text-white/60">{player.stats.goals || 0}</span></div>
                                <div className="bg-white/5 px-2 py-0.5 rounded">A: <span className="text-white/60">{player.stats.assists || 0}</span></div>
                                <div className="bg-white/5 px-2 py-0.5 rounded">M: <span className="text-white/60">{player.stats.matches || 0}</span></div>
                              </div>
                            )}
                          </div>
                          
                          <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <svg className="w-6 h-6 text-[#00ccff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <p className="text-white/40 italic">Nie znaleziono zawodnika o podanej nazwie</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={`grid grid-cols-1 ${isInTab ? 'gap-4 px-0' : 'md:grid-cols-2 xl:grid-cols-3 gap-6 px-4'}`}>
          <StatCard 
            title="KLASYFIKACJA STRZELCÓW" 
            players={topScorersSorted} 
            metric="goals" 
            label="GOL"
            isInTab={isInTab}
          />
          <StatCard 
            title="ASYSTENCI" 
            players={topAssistsSorted} 
            metric="assists" 
            label="AST"
            isInTab={isInTab}
          />
          <StatCard 
            title="KLASYFIKACJA KANADYJSKA" 
            players={topPointsSorted} 
            metric="points" 
            label="PKT"
            isInTab={isInTab}
          />
          <StatCard 
            title="CZYSTE KONTA" 
            players={topKeepersSorted} 
            metric="cleanSheets" 
            label="CK"
            color="green"
            isInTab={isInTab}
          />
          <StatCard 
            title="ŻÓŁTE KARTKI" 
            players={topYellowCardsSorted} 
            metric="yellowCards" 
            label="ŻK"
            color="yellow"
            isInTab={isInTab}
          />
          <StatCard 
            title="CZERWONE KARTKI" 
            players={topRedCardsSorted} 
            metric="redCards" 
            label="CK"
            color="red"
            isInTab={isInTab}
          />
        </div>
      </div>
    </div>
  );

  if (isInTab) {
    return <div className="p-0">{content}</div>;
  }

  return (
    <section id="statystyki" className="py-24 relative overflow-hidden min-h-screen bg-[#000a1a]">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
        </div>
        
      <div className="container mx-auto px-4 relative z-10">
        {content}
      </div>
    </section>
  );
}
