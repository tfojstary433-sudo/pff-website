'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { DateBar } from '@/components/date-bar';
import { RobloxAvatar } from '@/components/roblox-avatar';

interface Transfer {
  id: number;
  player: string;
  position: string;
  from: string;
  to: string;
  fromLogo: string;
  toLogo: string;
  robloxUsername?: string;
  amount: string;
  date: string;
  type: 'transfer' | 'loan';
}

// Helper function for team logos
function getTeamLogo(teamName: string): string {
  const teamLogos: Record<string, string> = {
    'Wisła Kraków': 'https://upload.wikimedia.org/wikipedia/en/1/15/Wis%C5%82a_Krak%C3%B3w_logo.svg',
    'Legia Warszawa': 'https://ext.same-assets.com/1250577607/695801781.png',
    'Lech Poznań': 'https://ext.same-assets.com/1250577607/3079565559.png',
    'Arka Gdynia': 'https://ext.same-assets.com/1250577607/451783410.png',
    'Cracovia': 'https://i.ibb.co/nqBHgwK2/obraz-2026-01-22-143911384.png',
    'Jagiellonia Białystok': 'https://i.ibb.co/V0rcs98Q/obraz-2026-01-04-213027745-removebg-preview-4.png',
    'Pogoń Szczecin': 'https://i.ibb.co/bgRJrvnj/Motor-Lublin-S-A-Oficjalny-Herb.png',
    'Śląsk Wrocław': 'https://i.ibb.co/Vp3YY8FY/unia-logo-300x300.png',
    'Zagłębie Lubin': 'https://i.ibb.co/7xBP97MW/dvyf-Zx2g-Ykwr8-Dur.png',
    'Górnik Zabrze': 'https://i.ibb.co/m5RzsvnS/obraz-2026-01-22-143945160.png',
  };
  return teamLogos[teamName] || 'https://i.ibb.co/TB027G07/czarnepff-1.png';
}

const sampleTransfers: Transfer[] = [
  {
    id: 1,
    player: 'Pako7u7lol',
    position: 'Napastnik',
    from: 'Wisła Kraków',
    to: 'Legia Warszawa',
    fromLogo: getTeamLogo('Wisła Kraków'),
    toLogo: getTeamLogo('Legia Warszawa'),
    robloxUsername: 'Pako7u7lol',
    amount: '2.5M',
    date: '20.01.2026',
    type: 'transfer'
  },
  {
    id: 2,
    player: 'MistrzGier',
    position: 'Pomocnik',
    from: 'Lech Poznań',
    to: 'Arka Gdynia',
    fromLogo: getTeamLogo('Lech Poznań'),
    toLogo: getTeamLogo('Arka Gdynia'),
    robloxUsername: 'MistrzGier',
    amount: '800k',
    date: '18.01.2026',
    type: 'transfer'
  },
  {
    id: 3,
    player: 'SzybkiJakWiatr',
    position: 'Obrońca',
    from: 'Cracovia',
    to: 'Jagiellonia Białystok',
    fromLogo: getTeamLogo('Cracovia'),
    toLogo: getTeamLogo('Jagiellonia Białystok'),
    robloxUsername: 'SzybkiJakWiatr',
    amount: '1.2M',
    date: '15.01.2026',
    type: 'transfer'
  },
  {
    id: 4,
    player: 'BramkarzPro',
    position: 'Bramkarz',
    from: 'Pogoń Szczecin',
    to: 'Śląsk Wrocław',
    fromLogo: getTeamLogo('Pogoń Szczecin'),
    toLogo: getTeamLogo('Śląsk Wrocław'),
    robloxUsername: 'BramkarzPro',
    amount: 'Wypożyczenie',
    date: '12.01.2026',
    type: 'loan'
  },
  {
    id: 5,
    player: 'KapitanDrużyny',
    position: 'Pomocnik',
    from: 'Zagłębie Lubin',
    to: 'Górnik Zabrze',
    fromLogo: getTeamLogo('Zagłębie Lubin'),
    toLogo: getTeamLogo('Górnik Zabrze'),
    robloxUsername: 'KapitanDrużyny',
    amount: '950k',
    date: '10.01.2026',
    type: 'transfer'
  }
];

export default function TransferyPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'incoming' | 'outgoing' | 'loans'>('all');

  const filteredTransfers = sampleTransfers.filter(transfer => {
    switch (activeTab) {
      case 'incoming':
        return true; // All are incoming in this context
      case 'outgoing':
        return true; // All are outgoing in this context
      case 'loans':
        return transfer.type === 'loan';
      default:
        return true;
    }
  });

  return (
    <>
      <Navbar />
      <div className="relative py-10 overflow-hidden bg-[#003087]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-900/30 via-blue-800/40 to-blue-900/30 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
                <img
                  src="https://i.ibb.co/MyfXtGLH/ekstraklasabaner-removebg-preview.png"
                  alt="Logo"
                  className="h-14 w-auto"
                />
              </div>

              <h1 className="text-4xl font-black text-white tracking-tight uppercase">
                TRANSFERY 2025/2026
              </h1>

              <div className="w-1 h-16 bg-gradient-to-b from-transparent via-white to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Transfer tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 justify-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'incoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Przybyli
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'outgoing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Odeszli
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-bold uppercase rounded-lg transition-colors ${
                  activeTab === 'loans'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Wypożyczenia
              </button>
            </div>

            {/* Transfer list */}
            <div className="space-y-4">
              {filteredTransfers.map((transfer) => (
                <div key={transfer.id} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="relative flex-shrink-0">
                        {transfer.robloxUsername ? (
                          <RobloxAvatar
                            username={transfer.robloxUsername}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-blue-500"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {transfer.player.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-bold text-base sm:text-lg truncate">{transfer.player}</h3>
                        <p className="text-gray-400 text-sm">{transfer.position}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <img
                          src={transfer.fromLogo}
                          alt={transfer.from}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                        />
                        <div className="text-center">
                          <div className="text-gray-400 text-xs">Z</div>
                          <div className="text-white font-bold text-xs sm:text-sm truncate max-w-20 sm:max-w-none">{transfer.from}</div>
                        </div>
                      </div>
                      <div className="text-xl sm:text-2xl text-green-400">→</div>
                      <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <img
                          src={transfer.toLogo}
                          alt={transfer.to}
                          className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                        />
                        <div className="text-center">
                          <div className="text-gray-400 text-xs">DO</div>
                          <div className="text-white font-bold text-xs sm:text-sm truncate max-w-20 sm:max-w-none">{transfer.to}</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <div className={`font-bold text-lg sm:text-xl ${
                        transfer.type === 'loan' ? 'text-blue-400' : 'text-yellow-400'
                      }`}>
                        {transfer.amount}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm">{transfer.date}</div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransfers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">Brak transferów w tej kategorii</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DateBar />
      <Footer />
    </>
  );
}