'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { standings as defaultStandings, teams } from '@/lib/data';
import { useMatchStats } from '@/lib/useMatchStats';
import { API_ENDPOINTS, TEAM_ID_MAPPING } from '@/lib/constants';

// Centralized helper functions for team logos and colors to ensure consistency
function getConsistentTeamLogo(teamId: string, teamName?: string): string {
  if (teamName) {
    const normalizedName = teamName.toLowerCase();
    const teamByName = teams.find(t => {
      const tName = t.name.toLowerCase();
      const tShort = t.shortName.toLowerCase();
      return tName === normalizedName || 
             normalizedName.includes(tName) || 
             tName.includes(normalizedName) ||
             normalizedName.includes(tShort);
    });
    if (teamByName) return teamByName.logo;
  }
  
  // Use mapping or direct ID
  const shortName = TEAM_ID_MAPPING[teamId] || teamId;
  const team = teams.find(t => t.id === shortName || t.shortName === shortName);
  return team?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png';
}

function getConsistentTeamColor(teamId: string, teamName?: string): string {
  if (teamName) {
    const normalizedName = teamName.toLowerCase();
    const teamByName = teams.find(t => {
      const tName = t.name.toLowerCase();
      const tShort = t.shortName.toLowerCase();
      return tName === normalizedName || 
             normalizedName.includes(tName) || 
             tName.includes(normalizedName) ||
             normalizedName.includes(tShort);
    });
    if (teamByName) return teamByName.color || '#3b82f6';
  }

  const shortName = TEAM_ID_MAPPING[teamId] || teamId;
  const team = teams.find(t => t.id === shortName || t.shortName === shortName);
  return team?.color || '#3b82f6';
}

export function LeagueTable({ isInTab = false, compact = false }: { isInTab?: boolean; compact?: boolean } = {}) {
   const { standings: realStandings } = useMatchStats();
   const [localStandings, setLocalStandings] = useState<any[]>([]);
   const [apiStandings, setApiStandings] = useState<any[]>([]);
   const [loadingTable, setLoadingTable] = useState(true);

  useEffect(() => {
    const loadLocal = () => {
      const data = localStorage.getItem('standings');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.length > 0) {
          setLocalStandings(parsed.map((s: any, idx: number) => {
            const teamId = s.teamId?.toString() || (s.team?.id)?.toString();
            const shortName = TEAM_ID_MAPPING[teamId] || teamId;
            
            return {
              ...s,
              position: idx + 1,
              team: s.team || teams.find(t => t.id === shortName) || {
                id: shortName,
                name: s.teamId,
                shortName: shortName.substring(0, 3),
                logo: getConsistentTeamLogo(teamId),
                color: getConsistentTeamColor(teamId)
              }
            };
          }));
        }
      }
    };

    loadLocal();

    const handleStorageChange = () => {
      loadLocal();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TABLE);
        if (response.ok) {
          const data = await response.json();
          console.log('Table data:', data);
          // The API returns data directly as an array
          const tableData = Array.isArray(data) ? data : (data.table || data.standings || []);
          if (Array.isArray(tableData) && tableData.length > 0) {
            const mappedTable = tableData.map((item: any, index: number) => {
              const teamId = item.id?.toString() || item.teamId?.toString() || `team_${index}`;
              const shortName = TEAM_ID_MAPPING[teamId] || item.name?.substring(0, 3).toUpperCase() || 'UNK';

              return {
                position: index + 1,
                team: {
                  id: shortName,
                  name: item.name || `Team ${index + 1}`,
                  shortName: shortName,
                  logo: getConsistentTeamLogo(teamId, item.name),
                  color: getConsistentTeamColor(teamId, item.name)
                },
                played: item.played || 0,
                won: item.won || 0,
                drawn: item.drawn || 0,
                lost: item.lost || 0,
                goalsFor: item.goalsFor || 0,
                goalsAgainst: item.goalsAgainst || 0,
                goalDifference: item.goalDifference || (item.goalsFor - item.goalsAgainst) || 0,
                points: item.points || 0
              };
            });
            setApiStandings(mappedTable);
          }
        } else {
          console.error('Failed to fetch table');
        }
      } catch (error) {
        console.error('Error fetching table:', error);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchTable();
  }, []);

  const allStandings = apiStandings.length > 0 ? apiStandings : (localStandings.length > 0 ? localStandings : (realStandings.length > 0 ? realStandings.map((s, idx) => {
    const teamId = s.teamId?.toString();
    const shortName = TEAM_ID_MAPPING[teamId] || teamId;
    return {
      ...s,
      position: idx + 1,
      team: s.team || teams.find(t => t.id === shortName) || {
        id: shortName,
        name: s.teamId, // Fallback name
        shortName: shortName.substring(0, 3),
        logo: getConsistentTeamLogo(teamId),
        color: getConsistentTeamColor(teamId)
      }
    };
  }) : defaultStandings.map((s, idx) => ({
    ...s,
    team: {
      ...s.team,
      logo: getConsistentTeamLogo(s.team.id, s.team.name),
      color: getConsistentTeamColor(s.team.id, s.team.name)
    }
  }))));

  const standings = allStandings;

  if (loadingTable && apiStandings.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-900 rounded-lg">
        <p className="text-gray-400">Ładowanie tabeli...</p>
      </div>
    );
  }

  const content = (
    <>
      <div className={`max-w-4xl mx-auto ${compact ? 'space-y-2' : 'space-y-3'}`}>
        {standings.map((standing, index) => {
          let gradientColor = '#3b82f6';
          if (standing.position === 1) {
            gradientColor = '#FFD700'; // Złoty
          } else if (standing.position === 2) {
            gradientColor = '#C0C0C0'; // Srebrny
          } else if (standing.position === 3) {
            gradientColor = '#CD7F32'; // Brązowy
          } else if (standing.position >= 11) {
            gradientColor = '#ef4444'; // Czerwony dla spadku
          }


          return (
            <Link
              href={standing.team ? `/klub/${standing.team.id}` : '#'}
              key={`standing-${standing.position}`}
              className={`block ${standing.team ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-[1.01] border border-white/5 ${compact ? 'py-2' : 'py-4'}`}
                style={{
                  background: standing.team ? `linear-gradient(to right,
                    ${gradientColor}44 0%,
                    ${gradientColor}22 20%,
                    #0a0a0a 60%,
                    #000000 100%
                  )` : '#0a0a0a'
                }}
              >
                <div className={`relative z-10 ${compact ? 'px-3' : 'px-5'} flex items-center gap-4`}>
                  <div className={`flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full font-black ${compact ? 'text-sm' : 'text-base'} shrink-0 ${
                    standing.position === 1 ? 'bg-yellow-500 text-black' :
                    standing.position === 2 ? 'bg-gray-400 text-black' :
                    standing.position === 3 ? 'bg-orange-700 text-white' :
                    standing.position >= 11 ? 'bg-red-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {standing.position}
                  </div>

                  {standing.team ? (
                    <>
                      <div className="relative shrink-0">
                        <div
                          className="absolute inset-0 blur-xl opacity-40"
                          style={{ backgroundColor: standing.team.color }}
                        />
                        <Image
                          src={standing.team.logo}
                          alt={standing.team.name}
                          width={compact ? 32 : 40}
                          height={compact ? 32 : 40}
                          className="relative z-10"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-white ${compact ? 'text-lg' : 'text-xl'} uppercase tracking-tight truncate`}>
                          {standing.team.name}
                        </h3>
                      </div>

                      <div className={`${compact ? 'hidden' : 'hidden md:flex'} items-center gap-4 text-xs`}>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">M</div>
                          <div className="text-white font-bold">{standing.played}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">W</div>
                          <div className="text-green-400 font-bold">{standing.won}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">R</div>
                          <div className="text-yellow-400 font-bold">{standing.drawn}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">P</div>
                          <div className="text-red-400 font-bold">{standing.lost}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500 text-[10px] font-bold">+/-</div>
                          <div className={`font-bold ${
                            standing.goalDifference > 0 ? 'text-green-400' :
                            standing.goalDifference < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                          </div>
                        </div>
                      </div>

                      <div className={`flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 ${compact ? 'px-3 py-1' : 'px-4 py-2'} rounded-lg shrink-0`}>
                        <span className={`${compact ? 'text-lg' : 'text-xl'} font-black text-white`}>
                          {standing.points}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">PKT</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-600 text-sm font-bold">-</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-6 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-black text-black text-sm">1</div>
          <span className="text-white font-bold">Mistrz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center font-black text-black text-sm">2</div>
          <span className="text-white font-bold">Wicemistrz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-700 rounded-full flex items-center justify-center font-black text-white text-sm">3</div>
          <span className="text-white font-bold">3. miejsce</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-black text-white text-sm">11</div>
          <span className="text-white font-bold">Spadek</span>
        </div>
      </div>
    </>
  );

  if (isInTab) {
    return <div className="container mx-auto px-4">{content}</div>;
  }

  return (
    <section id="tabela" className="py-16">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
}
