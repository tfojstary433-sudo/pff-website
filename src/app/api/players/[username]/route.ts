import { NextRequest, NextResponse } from 'next/server';
import { teams, clubToFirebaseKey } from '@/lib/data';
import { getAllUserClubs, getPlayerStats } from '@/lib/firebase';
import { API_ENDPOINTS } from '@/lib/constants';

// Cache for Roblox usernames
const usernameCache = new Map<string, { username: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache for Roblox IDs
const userIdCache = new Map<string, { userId: string; timestamp: number }>();

async function getRobloxUserId(username: string): Promise<string | null> {
  const cached = userIdCache.get(username);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.userId;
  }

  try {
    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
      next: { revalidate: 3600 }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const userId = data.data[0].id.toString();
      userIdCache.set(username, { userId, timestamp: Date.now() });
      return userId;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Roblox userId:', error);
    return null;
  }
}

async function getRobloxUsername(userId: string): Promise<string | null> {
  const cached = usernameCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.username;
  }

  try {
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const username = data.name;

    usernameCache.set(userId, { username, timestamp: Date.now() });
    return username;
  } catch (error) {
    console.error('Error fetching Roblox username:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  let userId = 'unknown';
  let resolvedUsername = username;
  let currentClub = '---';
  let verified = false;
  let playerStats = {
    matches: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0
  };
  let position = '---';
  let value = 0;

  // Resolve userId if not numeric
  if (/^\d+$/.test(username)) {
    userId = username;
    const resolved = await getRobloxUsername(username);
    if (resolved) {
      resolvedUsername = resolved;
    }
  } else {
    const resolved = await getRobloxUserId(username);
    if (resolved) {
      userId = resolved;
    }
  }

  // Known players fallback for userId if still unknown
  const knownPlayers: { [username: string]: string } = {
    'Pako7u7lol': '2613143527',
    'MichaelAmeyaw': '261499483',
  };

  if (userId === 'unknown' && knownPlayers[username]) {
    userId = knownPlayers[username];
  }

  // Fetch user clubs from Firebase
  let userClubs: Record<string, string> = {};
  try {
    userClubs = await getAllUserClubs();
  } catch (error) {
    console.error('Error fetching user clubs:', error);
  }

  // Find club from Firebase
  if (userId !== 'unknown') {
    const firebaseClub = userClubs[userId];
    if (firebaseClub) {
      // Find team by name or ID
      const team = teams.find(t => 
        t.name.toLowerCase() === firebaseClub.toLowerCase() || 
        t.id.toLowerCase() === firebaseClub.toLowerCase() ||
        (clubToFirebaseKey[t.id] && clubToFirebaseKey[t.id].toLowerCase() === firebaseClub.toLowerCase())
      );
      currentClub = team?.name || firebaseClub;
    }
  }

  // 1. Fetch from Firebase stats as baseline
  if (userId !== 'unknown') {
    try {
      const firebaseStats = await getPlayerStats(userId);
      if (firebaseStats) {
        playerStats = {
          matches: firebaseStats.matches || 0,
          goals: firebaseStats.goals || 0,
          assists: firebaseStats.assists || 0,
          yellowCards: firebaseStats.yellowCards || 0,
          redCards: firebaseStats.redCards || 0
        };
        position = firebaseStats.position || position;
        value = firebaseStats.value || value;
        verified = true;
      }
    } catch (error) {
      console.error('Error fetching player stats from Firebase:', error);
    }
  }

  // 2. Fetch stats from external API and merge/override
  try {
    const response = await fetch(API_ENDPOINTS.STATS);
    if (response.ok) {
      const data = await response.json();
      if (data.players && Array.isArray(data.players)) {
        // Find player by username or userId
        const player = data.players.find((p: any) =>
          p.username?.toLowerCase() === resolvedUsername.toLowerCase() || 
          p.userId === userId || 
          p.name?.toLowerCase() === resolvedUsername.toLowerCase()
        );
        if (player) {
          userId = player.userId || userId;
          resolvedUsername = player.username || player.name || resolvedUsername;
          
          // Update position if stats has a better one
          if (player.position && player.position !== '---') {
            position = player.position;
          }
          
          if (player.value) value = player.value;
          
          // Use whichever source has higher numbers (assuming they are cumulative)
          playerStats = {
            matches: Math.max(playerStats.matches, player.matches || 0),
            goals: Math.max(playerStats.goals, player.goals || 0),
            assists: Math.max(playerStats.assists, player.assists || 0),
            yellowCards: Math.max(playerStats.yellowCards, player.yellowCards || 0),
            redCards: Math.max(playerStats.redCards, player.redCards || 0)
          };
          verified = true;
          
          // Use club from stats if available
          if (player.team) {
             const team = teams.find(t => t.name === player.team || t.id === player.team);
             currentClub = team?.name || player.team;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching external stats:', error);
  }

  return NextResponse.json({
    userId,
    username: resolvedUsername,
    avatarUrl: null, // Use RobloxAvatar component
    currentClub,
    position,
    value,
    previousClubs: [],
    verified,
    stats: playerStats,
    recentMatches: []
  });
}