'use client';

import { useState, useEffect } from 'react';
import { teams } from './data';

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
  }, []);

  const fetchFromServer = async () => {
    try {
      // Fetch data directly from Replit API
      const [tableRes, playersRes] = await Promise.all([
        fetch('https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/external/table'),
        fetch('https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/external/stats')
      ]);

      if (tableRes.ok) {
        const table = await tableRes.json();
        if (Array.isArray(table)) {
          // Track used team IDs to avoid duplicates
          const usedIds = new Set<string>();

          const formattedStandings = table.map((t: any, index: number) => {
            const goalsFor = Math.max(0, t.goalsFor || 0);
            const goalsAgainst = Math.max(0, t.goalsAgainst || 0);
            const goalDifference = t.goalDifference !== undefined ? t.goalDifference : (goalsFor - goalsAgainst);

            // Ensure unique team ID
            let teamId = t.team?.id || `team_${index}`;
            if (usedIds.has(teamId)) {
              teamId = `${teamId}_${index}`;
            }
            usedIds.add(teamId);

            return {
              teamId,
              played: Math.max(0, t.played || 0),
              won: Math.max(0, t.won || 0),
              drawn: Math.max(0, t.drawn || 0),
              lost: Math.max(0, t.lost || 0),
              goalsFor,
              goalsAgainst,
              goalDifference, // Allow negative values for goal difference
              points: Math.max(0, t.points || 0)
            };
          });
          setStandings(formattedStandings);
          localStorage.setItem('standings', JSON.stringify(formattedStandings));
          console.log('✅ Loaded standings from Replit API:', formattedStandings);
        }
      }

      if (playersRes.ok) {
        const players = await playersRes.json();
        if (Array.isArray(players) && players.length > 0) {
          const formattedPlayers = players.map((p: any) => ({
            playerId: p.playerId || p.id || Math.random(),
            name: p.name || p.playerName || 'Unknown Player',
            teamId: p.teamId || p.team?.id || 'unknown',
            goals: Math.max(0, p.goals || 0),
            assists: Math.max(0, p.assists || 0),
            points: Math.max(0, (p.goals || 0) + (p.assists || 0)),
            cleanSheets: Math.max(0, p.cleanSheets || 0),
            yellowCards: Math.max(0, p.yellowCards || p.yellow_cards || 0),
            redCards: Math.max(0, p.redCards || p.red_cards || 0),
            avatarUrl: p.avatarUrl || p.avatar
          }));
          setTopScorers(formattedPlayers);
          localStorage.setItem('topScorers', JSON.stringify(formattedPlayers));
          console.log('✅ Loaded players from Replit API:', formattedPlayers);
        } else {
          // If no players, set empty array
          setTopScorers([]);
          localStorage.setItem('topScorers', JSON.stringify([]));
        }
      }
    } catch (error) {
      console.error('Error fetching from Replit API:', error);
      // Fallback to local data if API fails
      loadLocalData();
    }
  };

  const loadLocalData = () => {
    try {
      const standingsData = localStorage.getItem('standings');
      const playersData = localStorage.getItem('topScorers');

      if (standingsData) {
        setStandings(JSON.parse(standingsData));
      }

      if (playersData) {
        setTopScorers(JSON.parse(playersData));
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
