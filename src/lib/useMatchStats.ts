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
      // Load data from local JSON files instead of API endpoints
      const [tableRes, playersRes] = await Promise.all([
        fetch('/data/league_table.json'),
        fetch('/data/player_statistics.json')
      ]);

      if (tableRes.ok) {
        const table = await tableRes.json();
        if (Array.isArray(table)) {
          const formattedStandings = table.map((t: any) => ({
            teamId: t.team.id,
            played: t.played || 0,
            won: t.won || 0,
            drawn: t.drawn || 0,
            lost: t.lost || 0,
            goalsFor: t.goalsFor || 0,
            goalsAgainst: t.goalsAgainst || 0,
            goalDifference: t.goalDifference || ((t.goalsFor || 0) - (t.goalsAgainst || 0)),
            points: t.points || 0
          }));
          setStandings(formattedStandings);
          localStorage.setItem('standings', JSON.stringify(formattedStandings));
          console.log('✅ Loaded standings from league_table.json:', formattedStandings);
        }
      }

      if (playersRes.ok) {
        const players = await playersRes.json();
        if (Array.isArray(players)) {
          const formattedPlayers = players.map((p: any) => ({
            playerId: p.playerId,
            name: p.name,
            teamId: p.teamId,
            goals: p.goals || 0,
            assists: p.assists || 0,
            points: (p.goals || 0) + (p.assists || 0),
            cleanSheets: p.cleanSheets || 0,
            yellowCards: p.yellowCards || 0,
            redCards: p.redCards || 0,
            avatarUrl: p.avatarUrl
          }));
          setTopScorers(formattedPlayers);
          localStorage.setItem('topScorers', JSON.stringify(formattedPlayers));
          console.log('✅ Loaded players from player_statistics.json:', formattedPlayers);
        }
      }
    } catch (error) {
      console.error('Error loading data from JSON files:', error);
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
