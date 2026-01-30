'use client';

import { useState, useEffect } from 'react';
import { teams } from './data';
import { getAllPlayerStats } from './firebase';
import { API_ENDPOINTS, TEAM_ID_MAPPING } from './constants';

// Helper functions for team logos and colors
function getTeamLogo(teamId: string, teamName?: string): string {
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
  
  const shortName = TEAM_ID_MAPPING[teamId] || teamId;
  const team = teams.find(t => t.id === shortName || t.shortName === shortName);
  return team?.logo || 'https://i.ibb.co/TB027G07/czarnepff-1.png';
}

function getTeamColor(teamId: string, teamName?: string): string {
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

export interface PlayerStats {
  playerId: number;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
  points: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  country?: string;
  position?: string;
  avatarUrl?: string;
}

export interface MatchResult {
  matchId: string;
  homeScore: number;
  awayScore: number;
  homeTeamId: string;
  awayTeamId: string;
  scorers: Array<{
    playerName: string;
    playerId: number;
    team: 'home' | 'away';
    goals: number;
  }>;
  finished: boolean;
  timestamp: string;
}

export interface TeamStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  team?: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    color?: string;
  };
}

export function useMatchStats() {
  const [topScorers, setTopScorers] = useState<PlayerStats[]>([]);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [finishedMatches, setFinishedMatches] = useState<Record<string, MatchResult>>({});

  useEffect(() => {
    loadStats();
    fetchFromServer();

    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFromServer = async () => {
    try {
      // Fetch from external APIs and Firebase
      const [playersRes, tableRes, historyRes, matchesHistoryRes, firebaseStats] = await Promise.all([
        fetch(API_ENDPOINTS.STATS),
        fetch(API_ENDPOINTS.TABLE),
        fetch(API_ENDPOINTS.PLAYERS_HISTORY).catch(() => null),
        fetch('/api/history').catch(() => null),
        getAllPlayerStats().catch(() => ({}))
      ]);

      let combinedPlayers: PlayerStats[] = [];
      let historyData: any = null;

      if (historyRes && historyRes.ok) {
        historyData = await historyRes.json();
      }

      // Process matches history
      if (matchesHistoryRes && matchesHistoryRes.ok) {
        const historyMatches = await matchesHistoryRes.json();
        if (Array.isArray(historyMatches)) {
          const finishedMap: Record<string, MatchResult> = {};
          historyMatches.forEach((m: any) => {
            finishedMap[m.matchId] = {
              matchId: m.matchId,
              homeScore: m.homeScore,
              awayScore: m.awayScore,
              homeTeamId: m.homeTeamId,
              awayTeamId: m.awayTeamId,
              scorers: m.scorers || [],
              finished: true,
              timestamp: m.date
            };
          });
          setFinishedMatches(prev => ({ ...prev, ...finishedMap }));
          localStorage.setItem('matchStats', JSON.stringify(finishedMap));
        }
      }

      console.log('Players API response:', playersRes.status, playersRes.statusText);
      if (playersRes.ok) {
        const data = await playersRes.json();
        const playersData = Array.isArray(data) ? data : (data.players || []);
        if (Array.isArray(playersData) && playersData.length > 0) {
          combinedPlayers = playersData.map(player => {
            const pId = player.id || player.playerId;
            const pName = player.name || player.username;
            
            // Try to get country and position from history
            let country = player.country;
            let position = player.position;
            
            if (historyData && historyData.players) {
              const hPlayer = historyData.players[pId] || Object.values(historyData.players).find((p: any) => p.name === pName);
              if (hPlayer) {
                if (!country) country = hPlayer.country;
                if (!position || position === '---') position = hPlayer.position;
              }
            }

            return {
              playerId: pId,
              name: pName,
              teamId: player.teamId || 'UNK',
              goals: player.goals || 0,
              assists: player.assists || 0,
              yellowCards: player.yellowCards || 0,
              redCards: player.redCards || 0,
              cleanSheets: player.cleanSheets || 0,
              points: (player.goals || 0) + (player.assists || 0),
              country: country,
              position: position
            };
          });
        }
      }

      // Merge with Firebase stats
      if (firebaseStats && Object.keys(firebaseStats).length > 0) {
        Object.entries(firebaseStats).forEach(([id, stats]: [string, any]) => {
          const existingPlayer = combinedPlayers.find(p => p.playerId?.toString() === id || p.name === stats.name);
          if (existingPlayer) {
            existingPlayer.goals = Math.max(existingPlayer.goals, stats.goals || 0);
            existingPlayer.assists = Math.max(existingPlayer.assists, stats.assists || 0);
            existingPlayer.yellowCards = Math.max(existingPlayer.yellowCards, stats.yellowCards || 0);
            existingPlayer.redCards = Math.max(existingPlayer.redCards, stats.redCards || 0);
            existingPlayer.cleanSheets = Math.max(existingPlayer.cleanSheets, stats.cleanSheets || 0);
            existingPlayer.points = existingPlayer.goals + existingPlayer.assists;
            if (stats.teamId && (existingPlayer.teamId === 'UNK' || !existingPlayer.teamId)) {
              existingPlayer.teamId = stats.teamId;
            }
            if (stats.country && !existingPlayer.country) {
              existingPlayer.country = stats.country;
            }
            if (stats.position && !existingPlayer.position) {
              existingPlayer.position = stats.position;
            }
          } else {
            // Try to get country and position from history for Firebase players too
            let country = stats.country;
            let position = stats.position;
            if (historyData && historyData.players) {
              const hPlayer = historyData.players[id] || Object.values(historyData.players).find((p: any) => p.name === stats.name);
              if (hPlayer) {
                if (!country) country = hPlayer.country;
                if (!position || position === '---') position = hPlayer.position;
              }
            }

            combinedPlayers.push({
              playerId: parseInt(id) || 0,
              name: stats.name || `Gracz ${id}`,
              teamId: stats.teamId || 'UNK',
              goals: stats.goals || 0,
              assists: stats.assists || 0,
              yellowCards: stats.yellowCards || 0,
              redCards: stats.redCards || 0,
              cleanSheets: stats.cleanSheets || 0,
              points: (stats.goals || 0) + (stats.assists || 0),
              country: country,
              position: position
            });
          }
        });
      }

      if (combinedPlayers.length > 0) {
        setTopScorers(combinedPlayers);
        localStorage.setItem('topScorers', JSON.stringify(combinedPlayers));
      }

      console.log('Table API response:', tableRes.status, tableRes.statusText);
      if (tableRes.ok) {
        const data = await tableRes.json();
        console.log('Table data:', data);
        const tableData = Array.isArray(data) ? data : (data.standings || []);
        if (Array.isArray(tableData) && tableData.length > 0) {
          // Map API data to expected format
          const mappedStandings = tableData.map((standing, index) => {
            // Map team ID to short name for logos
            const teamId = standing.id?.toString() || standing.teamId?.toString() || (index + 1).toString();
            const shortName = TEAM_ID_MAPPING[teamId] || standing.team?.shortName || standing.name?.substring(0, 3).toUpperCase() || 'UNK';

            return {
              teamId: teamId,
              played: standing.played || 0,
              won: standing.won || 0,
              drawn: standing.drawn || 0,
              lost: standing.lost || 0,
              goalsFor: standing.goalsFor || 0,
              goalsAgainst: standing.goalsAgainst || 0,
              goalDifference: (standing.goalsFor || 0) - (standing.goalsAgainst || 0),
              points: standing.points || 0,
              position: standing.position || (index + 1),
              team: standing.team || {
                id: shortName,
                name: standing.name || 'Unknown Team',
                shortName: shortName,
                logo: getTeamLogo(shortName, standing.name),
                color: getTeamColor(shortName, standing.name)
              }
            };
          });
          setStandings(mappedStandings);
          localStorage.setItem('standings', JSON.stringify(mappedStandings));
        }
      }

      // For now, keep loading local data as fallback
      loadLocalData();
    } catch (error) {
      console.error('Error fetching from external APIs:', error);
      loadLocalData();
    }
  };

  const loadLocalData = () => {
    try {
      const standingsData = localStorage.getItem('standings');
      const playersData = localStorage.getItem('topScorers');

      if (standingsData) {
        setStandings(JSON.parse(standingsData));
      } else {
        // Fallback to defaults from data.ts
        import('./data').then(data => {
          if (data.standings) {
            setStandings(data.standings.map((s, idx) => ({
              ...s,
              teamId: s.team.id,
              position: idx + 1
            })));
          }
        });
      }

      if (playersData) {
        setTopScorers(JSON.parse(playersData));
      } else {
        // Fallback to mockPlayersData
        import('./data').then(data => {
          if (data.mockPlayersData) {
            setTopScorers(data.mockPlayersData.map(p => ({
              playerId: p.playerId,
              name: p.name,
              teamId: p.teamId,
              goals: p.goals,
              assists: p.assists,
              points: p.goals + p.assists,
              cleanSheets: p.cleanSheets || 0,
              yellowCards: p.yellowCards || 0,
              redCards: p.redCards || 0
            })));
          }
        });
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const loadStats = () => {
    try {
      const scorersData = localStorage.getItem('topScorers');
      const standingsData = localStorage.getItem('standings');
      const matchesData = localStorage.getItem('matchStats');

      if (scorersData) {
        setTopScorers(JSON.parse(scorersData));
      }

      if (standingsData) {
        setStandings(JSON.parse(standingsData));
      } else {
        const initialStandings = teams.map(team => ({
          teamId: team.id,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0
        }));
        setStandings(initialStandings);
        localStorage.setItem('standings', JSON.stringify(initialStandings));
      }

      if (matchesData) {
        setFinishedMatches(JSON.parse(matchesData));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveMatchResult = async (matchData: {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    scorers: Array<{
      playerName: string;
      playerId: number;
      teamId: string;
      goals: number;
      avatarUrl?: string;
    }>;
  }) => {
    try {
      console.log('🎯 Zapisywanie wyniku meczu na serwerze:', matchData);
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      
      const response = await fetch(`${baseUrl}/api/endmatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        console.log('✅ Wynik meczu zapisany na serwerze');
        await fetchFromServer();
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ Błąd serwera:', errorData);
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('❌ Błąd zapisywania wyniku meczu:', error);
      return { success: false, error };
    }
  };

  return {
    topScorers,
    standings,
    finishedMatches,
    saveMatchResult
  };
}
