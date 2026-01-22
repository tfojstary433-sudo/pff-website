import { NextRequest, NextResponse } from 'next/server';

// Map club IDs to Firebase keys
const clubToFirebaseKey: { [key: string]: string } = {
  'ZAW': 'Club 1', // Zawisza Bydgoszcz
  'ARK': 'Club 2', // Arka Gdynia
  'UNI': 'Club 3', // Unia Skierniewice
  'LEG': 'Club 4', // Legia Warszawa
  'LPO': 'Club 5', // Lech Poznań
  'LGD': 'Club 6', // Lechia Gdańsk
  'POG': 'Club 7', // Pogoń Szczecin
  'ZAG': 'Club 8', // Zagłębie Lubin
  'SOK': 'Club 9', // Sokół Olsztyn
  'WIS': 'Club 10', // Wisła Kraków
  'GRO': 'Club 11', // Grom Nowy Staw
  'MOT': 'Motor Lublin',
  'OLI': 'Olimpia Elbląg',
  'CHO': 'Chojniczanka Chojnice'
};

const firebaseURL = "https://wlpn-roblox-default-rtdb.europe-west1.firebasedatabase.app/users_clubs.json";

// Cache for Roblox usernames
const usernameCache = new Map<string, { username: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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

async function getRobloxAvatar(username: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/roblox/avatar?username=${encodeURIComponent(username)}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.avatarUrl || null;
  } catch (error) {
    console.error('Error fetching Roblox avatar:', error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const { clubId } = await params;

  const firebaseKey = clubToFirebaseKey[clubId];
  if (!firebaseKey) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  try {
    // Fetch users_clubs from Firebase
    const response = await fetch(firebaseURL, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users_clubs');
    }

    const usersClubs: { [key: string]: string } = await response.json();

    // Find all userIds that belong to this club
    const playerUserIds: string[] = [];
    for (const [userId, club] of Object.entries(usersClubs)) {
      if (club === firebaseKey) {
        playerUserIds.push(userId);
      }
    }

    if (playerUserIds.length === 0) {
      return NextResponse.json({ players: [] });
    }

    // Get usernames and avatars for each player
    const players = [];
    for (const userId of playerUserIds) {
      try {
        const username = await getRobloxUsername(userId);
        if (!username) continue;

        const avatarUrl = await getRobloxAvatar(username);

        players.push({
           userId,
           username,
           avatarUrl,
           clubId,
           value: Math.floor(Math.random() * 50000) + 10000, // Przykładowa wartość
           previousClubs: ['FC Example', 'City FC', 'United SC'].slice(0, Math.floor(Math.random() * 3) + 1), // Przykładowe kluby
           lastMatchNumber: Math.floor(Math.random() * 99) + 1, // Przykładowy numer
           position: ['Napastnik', 'Pomocnik', 'Obrońca', 'Bramkarz'][Math.floor(Math.random() * 4)] // Przykładowa pozycja
        });
      } catch (error) {
        console.error('Error processing player', userId, ':', error);
      }
    }

    console.log('Successfully processed players:', players.length);

    return NextResponse.json({
      players: players
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Error fetching club players:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}