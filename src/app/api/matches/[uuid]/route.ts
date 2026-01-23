import { getLiveMatch } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    
    // Check if the requested match is the live match in Firebase
    const liveMatch = await getLiveMatch();
    
    if (liveMatch && liveMatch.active) {
      // In a real scenario, we might want to check if uuid matches. 
      // For now, if any match is requested and there's a live one, we return it.
      
      return Response.json({
        match: {
          uuid: uuid,
          isActive: true,
          status: 'active',
          teamA: liveMatch.teamA?.nazwa || 'Team A',
          teamB: liveMatch.teamB?.nazwa || 'Team B',
          scoreA: liveMatch.teamA?.score || 0,
          scoreB: liveMatch.teamB?.score || 0,
          timer: liveMatch.timer || '0:00',
          period: liveMatch.period || 'Pierwsza połowa',
          stats: liveMatch.stats || {
            possessionA: 50,
            possessionB: 50,
            shotsA: 0,
            shotsB: 0
          }
        },
        events: liveMatch.events || {
          goals: [],
          cards: [],
          substitutions: []
        }
      });
    }

    // Fallback: Return not found if not live
    return Response.json({ error: 'Match not found or not active' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching match details from Firebase:', error);
    return Response.json(
      { error: 'Failed to fetch match details' },
      { status: 500 }
    );
  }
}
