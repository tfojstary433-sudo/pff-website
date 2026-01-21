export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(
      'https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/matches',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return Response.json(
        { error: `API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    // Ensure we always return an array to the frontend
    return Response.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching matches:', error);
    return Response.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
