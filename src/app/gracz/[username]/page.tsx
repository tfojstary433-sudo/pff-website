'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PlayerStats {
  userId: string;
  username: string;
  avatarUrl: string | null;
  currentClub: string;
  position: string;
  value: number;
  previousClubs: string[];
  stats: {
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
  };
  recentMatches: Array<{
    date: string;
    opponent: string;
    result: string;
    minutes: number;
    goals: number;
    assists: number;
  }>;
}

export default function GraczPage() {
  const params = useParams();
  const username = params.username as string;
  const [player, setPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profil' | 'statystyki' | 'mecze'>('profil');

  useEffect(() => {
    // Fetch player data
    const fetchPlayerData = async () => {
      try {
        // For now, create mock data
        const mockPlayer: PlayerStats = {
          userId: '123456789',
          username: username,
          avatarUrl: `https://www.roblox.com/headshot-thumbnail/image?userId=123456789&width=150&height=150&format=png`,
          currentClub: 'Zawisza Bydgoszcz',
          position: 'Napastnik',
          value: 45000,
          previousClubs: ['FC Example', 'City FC', 'United SC'],
          stats: {
            matches: 25,
            goals: 12,
            assists: 8,
            yellowCards: 3,
            redCards: 0
          },
          recentMatches: [
            { date: '2024-01-20', opponent: 'Arka Gdynia', result: '2-1', minutes: 90, goals: 1, assists: 0 },
            { date: '2024-01-15', opponent: 'Lech Poznań', result: '1-1', minutes: 85, goals: 0, assists: 1 },
            { date: '2024-01-10', opponent: 'Legia Warszawa', result: '3-0', minutes: 90, goals: 2, assists: 1 },
            { date: '2024-01-05', opponent: 'Pogoń Szczecin', result: '0-2', minutes: 78, goals: 0, assists: 0 },
            { date: '2023-12-20', opponent: 'Wisła Kraków', result: '1-0', minutes: 90, goals: 0, assists: 1 }
          ]
        };

        setPlayer(mockPlayer);
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [username]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!player) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white text-2xl">Zawodnik nie został znaleziony</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src={player.avatarUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${player.userId}&width=150&height=150&format=png`}
                  alt={player.username}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;base64,${btoa(`<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="150" height="150" fill="#666"/><text x="75" y="85" font-family="Arial" font-size="60" fill="white" text-anchor="middle">${player.username.charAt(0).toUpperCase()}</text></svg>`)}`;
                  }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full border-2 border-white">
                {player.position}
              </div>
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase">
                {player.username}
              </h1>
              <p className="text-blue-200 text-xl font-bold">{player.currentClub}</p>
              <p className="text-white/80 text-lg">Wartość: {player.value.toLocaleString()} zł</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b-4 border-blue-600">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('profil')}
              className={`px-6 py-3 font-black text-sm uppercase transition-all ${
                activeTab === 'profil'
                  ? 'text-white bg-blue-600'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              PROFIL
            </button>
            <button
              onClick={() => setActiveTab('statystyki')}
              className={`px-6 py-3 font-black text-sm uppercase transition-all ${
                activeTab === 'statystyki'
                  ? 'text-white bg-blue-600'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              STATYSTYKI
            </button>
            <button
              onClick={() => setActiveTab('mecze')}
              className={`px-6 py-3 font-black text-sm uppercase transition-all ${
                activeTab === 'mecze'
                  ? 'text-white bg-blue-600'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              OSTATNIE MECZE
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[60vh] py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          {activeTab === 'profil' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-2xl font-black text-white mb-6 uppercase">Informacje</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Aktualny klub:</span>
                    <span className="text-white font-bold">{player.currentClub}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pozycja:</span>
                    <span className="text-white font-bold">{player.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wartość rynkowa:</span>
                    <span className="text-white font-bold">{player.value.toLocaleString()} zł</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-2xl font-black text-white mb-6 uppercase">Poprzednie Kluby</h3>
                <div className="space-y-2">
                  {player.previousClubs.map((club, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">{club}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statystyki' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-black text-blue-400 mb-2">{player.stats.matches}</div>
                <div className="text-gray-400 text-sm uppercase">Mecze</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-black text-green-400 mb-2">{player.stats.goals}</div>
                <div className="text-gray-400 text-sm uppercase">Gole</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-black text-yellow-400 mb-2">{player.stats.assists}</div>
                <div className="text-gray-400 text-sm uppercase">Asysty</div>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <div className="text-3xl font-black text-red-400 mb-2">{player.stats.yellowCards + player.stats.redCards}</div>
                <div className="text-gray-400 text-sm uppercase">Kartki</div>
              </div>
            </div>
          )}

          {activeTab === 'mecze' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Przeciwnik</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Wynik</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Minuty</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Gole</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300 uppercase">Asysty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.recentMatches.map((match, index) => (
                      <tr key={index} className="border-t border-gray-700 hover:bg-gray-750">
                        <td className="px-4 py-3 text-gray-300">{match.date}</td>
                        <td className="px-4 py-3 text-white font-bold">{match.opponent}</td>
                        <td className="px-4 py-3 text-white">{match.result}</td>
                        <td className="px-4 py-3 text-gray-300">{match.minutes}'</td>
                        <td className="px-4 py-3 text-green-400 font-bold">{match.goals}</td>
                        <td className="px-4 py-3 text-yellow-400 font-bold">{match.assists}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}