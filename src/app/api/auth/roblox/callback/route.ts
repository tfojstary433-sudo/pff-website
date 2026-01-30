import { NextResponse } from 'next/server';

const CLIENT_ID = '7430952334747232007';
const CLIENT_SECRET = 'RBX-AvauGueB5UCzkzfKQIkIZeQpMvyXKH-TyRx5UuGWDqx4wyrBZccq96qYDqY1KPD0';
const REDIRECT_URI = 'https://localhost:3000/callback';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://apis.roblox.com/oauth/v1/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Roblox token error:', tokenData);
      return NextResponse.json({ error: tokenData.error_description || 'Failed to exchange code' }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    return NextResponse.json({
        robloxId: userData.sub,
        robloxUsername: userData.preferred_username || userData.name
    });
  } catch (error) {
    console.error('Roblox Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
