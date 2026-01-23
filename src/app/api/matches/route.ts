import { getLiveMatch } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const liveMatch = await getLiveMatch();
    
    // If no live match in Firebase, return empty array
    if (!liveMatch || !liveMatch.active) {
      return Response.json([]);
    }

    // Map Firebase team names to full team names for matching
    const teamNameMap: { [key: string]: string } = {
      'UNI': 'Unia Skierniewice',
      'LGD': 'Lechia Gdańsk',
      'ZAG': 'Zagłębie Lubin',
      'LPO': 'Lech Poznań',
      'ARK': 'Arka Gdynia',
      'LEG': 'Legia Warszawa',
      'POG': 'Pogoń Szczecin',
      'ZAW': 'Zawisza Bydgoszcz',
      'WIS': 'Wisła Kraków',
      'SOK': 'Sokół Olsztyn',
      'GRO': 'Grom Nowy Staw',
      'MOT': 'Motor Lublin',
      'OLI': 'Olimpia Elbląg',
      'CHO': 'Chojniczanka Chojnice'
    };

    // Get the team names from Firebase and map them
    const teamAName = liveMatch.teamA?.nazwa || 'Team A';
    const teamBName = liveMatch.teamB?.nazwa || 'Team B';

    // Try to map short names to full names, or use as-is if already full name
    const mappedTeamA = teamNameMap[teamAName] || teamAName;
    const mappedTeamB = teamNameMap[teamBName] || teamBName;

    // Format the live match data to match what the frontend expects
    const formattedMatch = {
      uuid: 'live-match-1',
      isActive: true,
      status: 'active',
      teamA: mappedTeamA,
      teamB: mappedTeamB,
      scoreA: liveMatch.teamA?.score || 0,
      scoreB: liveMatch.teamB?.score || 0,
      timer: liveMatch.timer || '0:00',
      period: liveMatch.period || 'Pierwsza połowa'
    };

    return Response.json([formattedMatch]);
  } catch (error) {
    console.error('Error fetching matches from Firebase:', error);
    return Response.json([], { status: 500 });
  }
}
