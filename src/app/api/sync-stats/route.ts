import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchExternalLeagueTable, fetchExternalPlayerStats } from '@/lib/externalApi';
import { Standing, PlayerStat } from '@/lib/data';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

const readData = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

const saveData = (filename: string, data: unknown) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting external data synchronization...');

    // Fetch data from external APIs
    const [externalTable, externalStats] = await Promise.all([
      fetchExternalLeagueTable(),
      fetchExternalPlayerStats()
    ]);

    console.log(`📊 Sync results: ${externalTable.length} teams, ${externalStats.length} players`);

    // Save league table
    if (externalTable.length > 0) {
      saveData('league_table.json', externalTable);
      console.log(`✅ Saved ${externalTable.length} teams to league table`);
      console.log('Sample team:', externalTable[0]);
    } else {
      console.log('⚠️ No teams data received');
    }

    // Save player statistics
    if (externalStats.length > 0) {
      saveData('player_statistics.json', externalStats);
      console.log(`✅ Saved ${externalStats.length} players to statistics`);
      console.log('Sample player:', externalStats[0]);
    } else {
      console.log('⚠️ No players data received');
    }

    return NextResponse.json({
      success: true,
      message: 'External data synced successfully',
      teamsCount: externalTable.length,
      playersCount: externalStats.length,
    });
  } catch (error) {
    console.error('❌ Error syncing external data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync external data' },
      { status: 500 }
    );
  }
}