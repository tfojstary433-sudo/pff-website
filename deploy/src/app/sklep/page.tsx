'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const tokenPackages = [
  {
    id: 'pkg-small',
    name: 'Mały Pakiet',
    regularTokens: 50,
    bonusTokens: 10,
    price: 25,
    pln: '25 zł',
  },
  {
    id: 'pkg-medium',
    name: 'Średni Pakiet',
    regularTokens: 80,
    bonusTokens: 20,
    price: 40,
    pln: '40 zł',
  },
  {
    id: 'pkg-large',
    name: 'Duży Pakiet',
    regularTokens: 150,
    bonusTokens: 50,
    price: 75,
    pln: '75 zł',
  },
  {
    id: 'pkg-xlarge',
    name: 'Duży Pakiet+',
    regularTokens: 200,
    bonusTokens: 100,
    price: 100,
    pln: '100 zł',
  },
];

const products = [
  {
    id: 'unprzerwa',
    name: 'UNPRZERWA',
    pricePerUnit: 10,
    description: 'Usuwa aktywną przerwę w grze - wpisz ilość',
    category: 'unprzerwa',
  },
  {
    id: 'unwarn',
    name: 'UNWARN',
    pricePerUnit: 30,
    description: 'Usuwa ostrzeżenie z konta - wpisz ilość',
    category: 'unwarn',
  },
  {
    id: 'szatnia-2',
    name: 'Szatnia Poziom II',
    price: 50,
    description: 'Odblokowuje szatnię na poziomie II dla Twojego klubu.',
    category: 'szatnia',
  },
  {
    id: 'stroje-dodatkowe',
    name: 'Dodatkowe Stroje',
    price: 15,
    description: 'Odblokowuje dodatkowe stroje dla Twojego klubu.',
    category: 'stroje',
  },
  {
    id: 'vip-trial-1',
    name: 'VIP Trial I (7 dni)',
    price: '15,99 zł',
    description: 'Subskrypcja VIP na 7 dni + 10 bonus tokenów.',
    category: 'vip',
    badge: 'SUBSKRYPCJA',
    currency: 'pln',
  },
  {
    id: 'vip-trial-2',
    name: 'VIP Trial II (14 dni)',
    price: '22,50 zł',
    description: 'Subskrypcja VIP na 14 dni + 15 bonus tokenów.',
    category: 'vip',
    badge: 'SUBSKRYPCJA',
    currency: 'pln',
  },
  {
    id: 'unban',
    name: 'UNBAN',
    price: '50 zł',
    description: 'Odblokowanie banowania z serwera.',
    category: 'unban',
    badge: 'PREMIUM',
    currency: 'pln',
  },
];

export default function SklepPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState({ balance: 0, items: {} });
  const [tab, setTab] = useState<'tokens' | 'products'>('tokens');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<typeof tokenPackages[0] | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      fetch(`/api/user/tokens?id=${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setBalance(data);
        })
        .catch(err => console.error('Error fetching tokens:', err));
    }
  }, []);

  const handleBuyTokens = (pkg: typeof tokenPackages[0]) => {
    setConfirmModal(pkg);
  };

  const handleBuyProduct = (product: typeof products[0]) => {
    router.push(`/sklep/${product.id}`);
  };

  const confirmTokenPurchase = (pkg: typeof tokenPackages[0]) => {
    setLoading(true);
    setMessage(null);

    fetch('/api/user/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        action: 'addTokens',
        amount: { regular: pkg.regularTokens, bonus: pkg.bonusTokens },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage({ type: 'error', text: data.error });
        } else {
          setBalance(data);
          setMessage({ type: 'success', text: `Zakupiono ${pkg.regularTokens + pkg.bonusTokens} tokenów!` });
          setConfirmModal(null);
        }
      })
      .catch(err => {
        console.error('Purchase error:', err);
        setMessage({ type: 'error', text: 'Błąd podczas zakupu' });
      })
      .finally(() => setLoading(false));
  };

  const discordAuthUrl = "https://discord.com/oauth2/authorize?client_id=1448788697653973082&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=email+identify";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-inter">
      <Navbar />
      
      {/* Header section */}
      <div className="relative py-16 overflow-hidden bg-gradient-to-b from-[#003087] to-[#0a0a0a]">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
            `
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-black/40 rounded-3xl border border-white/10 p-8 backdrop-blur-md text-center">
            <h1 className="text-6xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-r from-white via-[#00ccff] to-white bg-clip-text text-transparent">
              SKLEP PFF
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-medium">
              Zdobądź unikalne bonusy i ulepszenia dla swojego klubu korzystając z PFF Tokens.
            </p>
            
            <div className="mt-8 flex flex-col items-center gap-4">
              {user ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,204,255,0.1)]">
                    <img 
                      src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border-2 border-[#00ccff]"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white/40 uppercase">Zalogowany jako</p>
                      <p className="text-lg font-black text-white">{user.global_name || user.username}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,204,255,0.1)]">
                      <span className="text-sm font-bold text-white/40 uppercase">Twoje Tokeny:</span>
                      <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="PFF Token" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-black text-[#00ccff]">{balance.balance}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      localStorage.removeItem('discord_user');
                      setUser(null);
                    }}
                    className="text-xs text-white/40 hover:text-white transition-colors uppercase font-bold"
                  >
                    Wyloguj się
                  </button>
                </div>
              ) : (
                <a 
                  href={discordAuthUrl}
                  className="flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] px-8 py-4 rounded-2xl font-black uppercase tracking-tight transition-all active:scale-95 shadow-[0_0_20px_rgba(88,101,242,0.3)]"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2914a.077.077 0 01-.0066.1277 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                  </svg>
                  Zaloguj się przez Discord
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {user && (
        <>
          {/* Message alert */}
          {message && (
            <div className={`mx-4 mt-4 p-4 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
            <div className="container mx-auto px-4">
              <div className="flex gap-4">
                <button 
                  onClick={() => setTab('tokens')}
                  className={`px-6 py-4 uppercase font-black tracking-tight transition-all ${tab === 'tokens' ? 'text-[#00ccff] border-b-2 border-[#00ccff]' : 'text-white/40 hover:text-white'}`}
                >
                  Kup Tokeny
                </button>
                <button 
                  onClick={() => setTab('products')}
                  className={`px-6 py-4 uppercase font-black tracking-tight transition-all ${tab === 'products' ? 'text-[#00ccff] border-b-2 border-[#00ccff]' : 'text-white/40 hover:text-white'}`}
                >
                  Produkty
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div 
            className="relative py-20 bg-fixed bg-center bg-cover"
            style={{ backgroundImage: 'url(https://i.ibb.co/G4rD13m6/tlo.png)' }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            
            <div className="container mx-auto px-4 relative z-10">
              {tab === 'tokens' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {tokenPackages.map((pkg) => (
                    <div 
                      key={pkg.id}
                      className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-[#00ccff]/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-4">
                          <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-[#00ccff] transition-colors">
                            {pkg.name}
                          </h3>
                          <div className="flex flex-col gap-1 text-sm">
                            <p className="text-white/60">{pkg.regularTokens} Tokeny</p>
                            <p className="text-[#00ff88] font-bold">+{pkg.bonusTokens} Bonus</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                          <span className="text-xl font-black text-[#00ccff]">{pkg.pln}</span>
                          
                          <button 
                            onClick={() => handleBuyTokens(pkg)}
                            className="px-5 py-2.5 bg-[#00ccff] hover:bg-[#00ccff]/80 text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,204,255,0.3)]"
                          >
                            KUP
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-[#00ccff]/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {product.badge && (
                        <div className="absolute top-3 right-3 bg-[#ff0080]/80 px-3 py-1 rounded-full text-xs font-black uppercase z-20">
                          {product.badge}
                        </div>
                      )}
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-[#00ccff] transition-colors">
                          {product.name}
                        </h3>
                        
                        <p className="text-white/50 text-sm mb-6 flex-grow">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            {!product.currency && <img src="https://i.ibb.co/355TzsFG/ssss.png" alt="Token" className="w-5 h-5 object-contain" />}
                            <span className="text-xl font-black text-[#00ccff]">
                              {'price' in product && typeof product.price === 'string' ? product.price : (product.pricePerUnit ? `${product.pricePerUnit}/szt` : (product.price || 'N/A'))}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => handleBuyProduct(product)}
                            className="px-5 py-2.5 bg-[#00ccff] hover:bg-[#00ccff]/80 text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,204,255,0.3)]"
                          >
                            WYBIÉR
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Token Purchase Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#00ccff]/30 rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-black uppercase mb-4 text-[#00ccff]">Potwierdzenie Zakupu</h2>
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-6">
              <p className="text-white/40 text-sm uppercase font-bold mb-2">Pakiet Tokenów</p>
              <p className="text-2xl font-black text-white mb-4">{confirmModal.name}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-white/40 uppercase font-bold">Zawiera:</span>
                <span className="text-white">{confirmModal.regularTokens + confirmModal.bonusTokens} tokenów</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                <span className="text-white/40 uppercase font-bold">Cena:</span>
                <span className="text-2xl font-black text-[#00ccff]">{confirmModal.pln}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => confirmTokenPurchase(confirmModal)}
                disabled={loading}
                className="flex-1 bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:bg-white/20 text-black font-black py-3 rounded-2xl uppercase transition-all"
              >
                {loading ? '...' : 'Potwierdź'}
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-2xl uppercase transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
