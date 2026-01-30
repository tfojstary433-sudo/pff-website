'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { teams, matches, standings } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RobloxAvatar } from '@/components/roblox-avatar';
import { 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Users, 
  BarChart2, 
  History, 
  Newspaper,
  LayoutDashboard,
  Table as TableIcon,
  ArrowRightLeft,
  Bell,
  Star
} from 'lucide-react';

interface ClubPlayer {
  userId: string;
  username: string;
  avatarUrl: string | null;
  clubId: string;
  value?: number;
  previousClubs?: string[];
  lastMatchNumber?: number;
  position?: string;
  verified?: boolean;
  stats?: {
    goals: number;
    assists: number;
    matches: number;
  };
}

export default function KlubPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const team = useMemo(() => teams.find(t => t.id === id), [id]);
  
  const [activeTab, setActiveTab] = useState('przegląd');
  const [players, setPlayers] = useState<ClubPlayer[]>([]);
  const [playerNumbers, setPlayerNumbers] = useState<Record<string, number>>({});
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Get team stats from standings
  const teamStats = useMemo(() => standings.find(s => s.team.id === id), [id]);
  
  // Get team form (last 5 matches)
  const teamForm = useMemo(() => {
    return matches
      .filter(m => m.status === 'finished' && (m.homeTeam.id === id || m.awayTeam.id === id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => {
        const isHome = m.homeTeam.id === id;
        const homeScore = m.homeScore ?? 0;
        const awayScore = m.awayScore ?? 0;
        
        if (homeScore === awayScore) return { res: 'D', score: `${homeScore}-${awayScore}` };
        if (isHome) return { 
          res: homeScore > awayScore ? 'W' : 'L', 
          score: `${homeScore}-${awayScore}` 
        };
        return { 
          res: awayScore > homeScore ? 'W' : 'L', 
          score: `${homeScore}-${awayScore}` 
        };
      })
      .reverse();
  }, [id]);

  // Get next match
  const nextMatch = useMemo(() => {
    return matches
      .filter(m => m.status === 'upcoming' && (m.homeTeam.id === id || m.awayTeam.id === id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [id]);

  // Fetch player numbers and players
  useEffect(() => {
    fetch('https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/matches')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const numbers: Record<string, number> = {};
          data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).forEach(match => {
            const processLineup = (lineup: any) => {
              if (lineup?.starters) {
                lineup.starters.forEach((p: any) => {
                  if (p.id) numbers[p.id.toString()] = p.number;
                });
              }
              if (lineup?.bench) {
                lineup.bench.forEach((p: any) => {
                  if (p.id) numbers[p.id.toString()] = p.number;
                });
              }
            };
            processLineup(match.lineupA);
            processLineup(match.lineupB);
          });
          setPlayerNumbers(numbers);
        }
      })
      .catch(err => console.error('Error fetching match numbers:', err));
  }, []);

  useEffect(() => {
    if (activeTab === 'skład' && players.length === 0 && !loadingPlayers && team) {
      setLoadingPlayers(true);
      fetch(`/api/club/players/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.players && Array.isArray(data.players)) {
            setPlayers(data.players);
          }
          setLoadingPlayers(false);
        })
        .catch(error => {
          console.error('Error fetching players:', error);
          setLoadingPlayers(false);
        });
    }
  }, [activeTab, team, id, players.length, loadingPlayers]);

  if (!team) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">KLUB NIEZNALEZIONY</h1>
          <Link href="/" className="text-blue-500 hover:underline">Wróć do strony głównej</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'przegląd', label: 'Przegląd', icon: LayoutDashboard },
    { id: 'tabela', label: 'Tabela', icon: TableIcon },
    { id: 'mecze', label: 'Mecze', icon: Calendar },
    { id: 'skład', label: 'Skład', icon: Users },
    { id: 'statystyki', label: 'Statystyki', icon: BarChart2 },
    { id: 'transfery', label: 'Transfery', icon: ArrowRightLeft },
    { id: 'historia', label: 'Historia', icon: History },
    { id: 'newsy', label: 'Newsy', icon: Newspaper },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full p-4">
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{team.name}</h1>
                <div className="bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  VERIFIED CLUB
                </div>
              </div>
              <p className="text-gray-400 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Polska • Ekstraklasa
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button className="bg-white text-black font-bold px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Synchronizuj z kalendarzem
                </button>
                <button className="bg-white text-black font-bold px-8 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                  Obserwuj
                </button>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-12 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'przegląd' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Widget */}
                <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Forma zespołu
                  </h3>
                  <div className="flex items-center gap-3">
                    {teamForm.length > 0 ? teamForm.map((result, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                          result.res === 'W' ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
                          result.res === 'L' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                        }`}>
                          {result.score}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                          <Image 
                            src={team.logo} 
                            alt="logo" 
                            width={16} 
                            height={16} 
                            className="opacity-50"
                          />
                        </div>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm italic">Brak rozegranych meczów</p>
                    )}
                  </div>
                </div>

                {/* Next Match Widget */}
                <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black uppercase flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Następny mecz
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                      Ekstraklasa
                      <Trophy className="w-3 h-3" />
                    </div>
                  </div>
                  
                  {nextMatch ? (
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <Image src={nextMatch.homeTeam.logo} alt="" width={48} height={48} className="mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase truncate max-w-[80px]">{nextMatch.homeTeam.name}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-black mb-1">18:00</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Dzisiaj</div>
                      </div>
                      
                      <div className="text-center">
                        <Image src={nextMatch.awayTeam.logo} alt="" width={48} height={48} className="mx-auto mb-2" />
                        <p className="text-xs font-bold uppercase truncate max-w-[80px]">{nextMatch.awayTeam.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm italic">Brak zaplanowanych meczów</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Widget */}
              <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black uppercase flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Ekstraklasa
                  </h3>
                  <button onClick={() => setActiveTab('tabela')} className="text-xs font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    Pełna tabela <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-white/5">
                        <th className="pb-4 text-left w-10">#</th>
                        <th className="pb-4 text-left">Klub</th>
                        <th className="pb-4 text-center w-10">M</th>
                        <th className="pb-4 text-center w-10">Z</th>
                        <th className="pb-4 text-center w-10">R</th>
                        <th className="pb-4 text-center w-10">P</th>
                        <th className="pb-4 text-center w-20">+/-</th>
                        <th className="pb-4 text-center w-10">=</th>
                        <th className="pb-4 text-center w-10">PKT</th>
                        <th className="pb-4 text-center w-32">Forma</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {standings.slice(0, 6).map((s, i) => (
                        <tr key={s.team.id} className={`group hover:bg-white/5 transition-colors ${s.team.id === id ? 'bg-blue-600/10' : ''}`}>
                          <td className={`py-4 font-black ${
                            i === 0 ? 'text-yellow-500' : 
                            i === 1 ? 'text-gray-400' :
                            i === 2 ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {i + 1}
                          </td>
                          <td className="py-4">
                            <Link href={`/klub/${s.team.id}`} className="flex items-center gap-3">
                              <Image src={s.team.logo} alt="" width={24} height={24} />
                              <span className="font-bold truncate max-w-[120px]">{s.team.name}</span>
                            </Link>
                          </td>
                          <td className="py-4 text-center font-medium text-gray-400">{s.played}</td>
                          <td className="py-4 text-center font-medium text-gray-400">{s.won}</td>
                          <td className="py-4 text-center font-medium text-gray-400">{s.drawn}</td>
                          <td className="py-4 text-center font-medium text-gray-400">{s.lost}</td>
                          <td className="py-4 text-center font-medium text-gray-400">{s.goalsFor}-{s.goalsAgainst}</td>
                          <td className="py-4 text-center font-medium text-gray-400">{s.goalDifference}</td>
                          <td className="py-4 text-center font-black">{s.points}</td>
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-1">
                              {['W', 'L', 'D', 'W', 'W'].map((res, idx) => (
                                <div key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${
                                  res === 'W' ? 'bg-green-500/20 text-green-500' :
                                  res === 'L' ? 'bg-red-500/20 text-red-500' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {res}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Stats/Lineup */}
            <div className="space-y-8">
              <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black uppercase flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Statystyki sezonu
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ostatnia 11-tka</span>
                </div>
                
                {/* Field Visualization */}
                <div className="flex-1 relative aspect-[3/4] bg-[#0c2e12] rounded-2xl border-2 border-white/10 overflow-hidden group">
                  {/* Grass Pattern */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(255,255,255,0.05) 10%, rgba(255,255,255,0.05) 20%)'
                  }} />
                  
                  {/* Field Lines */}
                  <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-b border-x border-white/20 rounded-b-xl pointer-events-none" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-t border-x border-white/20 rounded-t-xl pointer-events-none" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/20 rounded-full pointer-events-none" />
                  
                  {/* Player Positions - Empty placeholders as requested */}
                  <div className="absolute inset-0 p-8 grid grid-cols-3 grid-rows-5 gap-4">
                    {/* Positions from top to bottom */}
                    {/* Attack */}
                    <div className="col-start-2 row-start-1 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    {/* Midfield */}
                    <div className="col-start-1 row-start-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    <div className="col-start-2 row-start-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    <div className="col-start-3 row-start-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    {/* DM */}
                    <div className="col-start-2 row-start-3 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    {/* Defense */}
                    <div className="col-start-1 row-start-4 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    <div className="col-start-2 row-start-4 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    <div className="col-start-3 row-start-4 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                    {/* GK */}
                    <div className="col-start-2 row-start-5 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Overlay text */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm p-8 text-center">
                    <p className="text-sm font-bold text-gray-300">Wkrótce: Szczegółowe statystyki składu i wizualizacja formacji</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Skład Tab Logic */}
        {activeTab === 'skład' && (
          <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h2 className="text-3xl font-black uppercase tracking-tight">KADRA ZESPOŁU</h2>
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Szukaj zawodnika..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3 font-medium focus:outline-none focus:border-blue-500/50 transition-colors"
                  onChange={(e) => {/* search logic */}}
                />
              </div>
            </div>
            
            {loadingPlayers ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Ładowanie zawodników...</p>
              </div>
            ) : players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {players.map((player) => (
                  <Link
                    href={`/profil/${player.userId}`}
                    key={player.userId}
                    className="bg-black/40 border border-white/5 rounded-2xl p-5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 group-hover:border-blue-500/50 transition-colors">
                          <RobloxAvatar username={player.username} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-black text-xs border-2 border-[#0f0f0f]">
                          {playerNumbers[player.userId] || '??'}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-xl truncate">{player.username}</h3>
                          {player.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">
                          {player.position || 'ZAWODNIK'}
                        </p>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-gray-400">
                          <div><span className="text-white">{player.stats?.matches || 0}</span> MECZE</div>
                          <div><span className="text-white">{player.stats?.goals || 0}</span> GOLE</div>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-black/20 rounded-2xl border border-dashed border-white/5">
                <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">Brak zawodników w kadrze</p>
              </div>
            )}
          </div>
        )}
        
        {/* Simple placeholder for other tabs */}
        {activeTab !== 'przegląd' && activeTab !== 'skład' && (
          <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-2xl font-black uppercase mb-2">Moduł w budowie</h2>
            <p className="text-gray-500 font-medium">Zakładka {activeTab.toUpperCase()} będzie dostępna wkrótce.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
