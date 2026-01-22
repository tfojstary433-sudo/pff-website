'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const tokenPackages = [
  {
    id: 'pkg-small',
    name: 'BRĄZOWY PAKIET',
    logo: 'https://i.ibb.co/35CBs6hY/obraz-2026-01-22-144514080.png',
    regularTokens: 50,
    bonusTokens: 10,
    price: 25,
    pln: '25 zł',
  },
  {
    id: 'pkg-medium',
    name: 'SREBRNY PAKIET',
    logo: 'https://i.ibb.co/5hLZTwbG/obraz-2026-01-22-144537167.png',
    regularTokens: 80,
    bonusTokens: 20,
    price: 40,
    pln: '40 zł',
  },
  {
    id: 'pkg-large',
    name: 'ZŁOTY PAKIET',
    logo: 'https://i.ibb.co/Hp94m0x8/obraz-2026-01-22-144558424.png',
    regularTokens: 150,
    bonusTokens: 50,
    price: 75,
    pln: '75 zł',
  },
  {
    id: 'pkg-xlarge',
    name: 'DIAMENTOWY PAKIET',
    logo: 'https://i.ibb.co/twzxFRCs/obraz-2026-01-22-144623517.png',
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
    price: 10, // 5 PLN
    description: 'Usuwa aktywną przerwę w grze.',
    category: 'unprzerwa',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'unwarn',
    name: 'UNWARN',
    price: 30, // 15 PLN
    description: 'Usuwa ostrzeżenie z konta.',
    category: 'unwarn',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'szatnia-2',
    name: 'Szatnia Poziom II',
    price: 50, // 25 PLN
    description: 'Odblokowuje szatnię na poziomie II dla Twojego klubu.',
    category: 'szatnia',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'stroje-dodatkowe',
    name: 'Dodatkowe Stroje',
    price: 15, // 7.5 PLN
    description: 'Odblokowuje dodatkowe stroje dla Twojego klubu.',
    category: 'stroje',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
  {
    id: 'unban',
    name: 'UNBAN',
    price: 100, // 50 PLN
    description: 'Odblokowanie banowania z serwera.',
    category: 'unban',
    badge: 'PREMIUM',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  },
];

const subscriptions = [
  {
    id: 'vip-trial',
    name: 'SUBSKRYPCJA VIP',
    description: 'Status VIP dający liczne bonusy i przywileje w grze.',
    pricePerDay: 4, // 2 PLN za dzień
    category: 'vip',
    badge: 'SUBSKRYPCJA',
    image: 'https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png'
  }
];

export default function SklepPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState({ balance: 0, items: {} });
  const [tab, setTab] = useState<'tokens' | 'products' | 'subscriptions'>('tokens');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<any | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [subDays, setSubDays] = useState<Record<string, number>>({ 'vip-trial': 30 });
  const [robloxUsername, setRobloxUsername] = useState<string>('');
  const [settingRoblox, setSettingRoblox] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('discord_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setRobloxUsername(userData.robloxUsername || '');

      fetch(`/api/user/tokens?id=${userData.id}`)
        .then(res => res.json())
        .then(data => {
          setBalance(data);
        })
        .catch(err => console.error('Error fetching tokens:', err));
    }

    const savedCart = localStorage.getItem('pff_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('pff_cart', JSON.stringify(newCart));
  };

  const addToCart = (item: any) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      updateCart(cart.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
    } else {
      updateCart([...cart, { ...item, quantity: 1 }]);
    }
    setMessage({ type: 'success', text: 'Dodano do koszyka!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const removeFromCart = (id: string) => {
    updateCart(cart.filter(i => i.id !== id));
  };

  const handleBuyTokens = (pkg: typeof tokenPackages[0]) => {
    setConfirmModal({ ...pkg, type: 'tokens' });
  };

  const handleCustomTokens = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Podaj poprawną ilość tokenów' });
      return;
    }
    const price = amount * 0.5;
    setConfirmModal({
      id: 'custom',
      name: 'Własna Ilość',
      regularTokens: amount,
      bonusTokens: 0,
      price: price,
      pln: `${price.toFixed(2)} zł`,
      type: 'tokens'
    });
  };

  const handleBuyProduct = (product: any) => {
    addToCart(product);
  };

  const handleBuySubscription = (sub: any) => {
    const days = subDays[sub.id] || 30;
    const totalTokens = sub.pricePerDay * days;
    addToCart({
      ...sub,
      id: `${sub.id}-${days}`,
      name: `${sub.name} (${days} dni)`,
      price: totalTokens,
      days: days
    });
  };

  const saveRobloxUsername = async () => {
    if (!robloxUsername.trim()) return;

    setSettingRoblox(true);
    try {
      // Get Roblox ID from username
      const response = await fetch(`/api/roblox/avatar?username=${encodeURIComponent(robloxUsername.trim())}`);
      if (response.ok) {
        const data = await response.json();
        // Update user data
        const updatedUser = { ...user, robloxUsername: robloxUsername.trim(), robloxId: data.robloxId };
        localStorage.setItem('discord_user', JSON.stringify(updatedUser));
        localStorage.setItem('roblox_id', data.robloxId);
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Nazwa Roblox zapisana!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Nieprawidłowa nazwa użytkownika Roblox' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Błąd podczas zapisywania' });
      setTimeout(() => setMessage(null), 3000);
    }
    setSettingRoblox(false);
  };

  const confirmPurchase = (item: any) => {
    setLoading(true);
    setMessage(null);

    if (item.type === 'tokens') {
      fetch('/api/user/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'addTokens',
          amount: { regular: item.regularTokens, bonus: item.bonusTokens },
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setMessage({ type: 'error', text: data.error });
          } else {
            setBalance(data);
            setMessage({ type: 'success', text: `Zakupiono ${item.regularTokens + item.bonusTokens} tokenów!` });
            setConfirmModal(null);
            // Otwórz nową stronę z potwierdzeniem lub szczegółami
            window.open(`/sklep/sukces?type=tokens&amount=${item.regularTokens + item.bonusTokens}`, '_blank');
          }
        })
        .catch(err => {
          console.error('Purchase error:', err);
          setMessage({ type: 'error', text: 'Błąd podczas zakupu' });
        })
        .finally(() => setLoading(false));
    } else {
      // Logic for buying products/subscriptions with tokens
      const totalCost = cart.reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0);
      
      if (balance.balance < totalCost) {
        setMessage({ type: 'error', text: 'Niewystarczająca ilość tokenów' });
        setLoading(false);
        return;
      }

      fetch('/api/user/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: 'removeTokens',
          amount: totalCost,
          items: cart
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setMessage({ type: 'error', text: data.error });
          } else {
            setBalance(data);
            setMessage({ type: 'success', text: 'Zakup pomyślny!' });
            updateCart([]);
            setShowCart(false);
            window.open(`/sklep/sukces?type=cart&cost=${totalCost}`, '_blank');
          }
        })
        .catch(err => {
          console.error('Purchase error:', err);
          setMessage({ type: 'error', text: 'Błąd podczas zakupu' });
        })
        .finally(() => setLoading(false));
    }
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
                        <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="PFF Token" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-black text-[#00ccff]">{balance.balance}</span>
                      </div>
                    </div>

                    {/* Roblox Username */}
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 shadow-[0_0_20px_rgba(0,204,255,0.1)]">
                      <span className="text-sm font-bold text-white/40 uppercase">Roblox:</span>
                      <input
                        type="text"
                        value={robloxUsername}
                        onChange={(e) => setRobloxUsername(e.target.value)}
                        placeholder="Nazwa użytkownika"
                        className="bg-transparent text-white placeholder-white/40 outline-none border-none text-sm font-medium"
                      />
                      <button
                        onClick={saveRobloxUsername}
                        disabled={settingRoblox || !robloxUsername.trim()}
                        className="px-3 py-1 bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:bg-white/20 text-black font-black text-xs uppercase rounded-lg transition-all"
                      >
                        {settingRoblox ? '...' : 'Zapisz'}
                      </button>
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
              <div className="flex items-center justify-between">
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
                  <button 
                    onClick={() => setTab('subscriptions')}
                    className={`px-6 py-4 uppercase font-black tracking-tight transition-all ${tab === 'subscriptions' ? 'text-[#00ccff] border-b-2 border-[#00ccff]' : 'text-white/40 hover:text-white'}`}
                  >
                    Subskrypcje
                  </button>
                </div>
                
                {cart.length > 0 && (
                  <button 
                    onClick={() => setShowCart(true)}
                    className="relative p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                  >
                    <svg className="w-6 h-6 text-[#00ccff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-[#00ccff] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.length}
                    </span>
                  </button>
                )}
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
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tokenPackages.map((pkg) => (
                      <div 
                        key={pkg.id}
                        className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-[#00ccff]/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col"
                      >
                        <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="mb-6 flex justify-center">
                            <img src={pkg.logo} alt={pkg.name} className="h-32 object-contain group-hover:scale-110 transition-transform duration-500" />
                          </div>
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

                  {/* Custom Recharge */}
                  <div className="max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                      <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="" className="w-8 h-8" />
                      Doładuj dowolną ilość
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <input 
                          type="number" 
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Wpisz ilość tokenów..."
                          className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black focus:border-[#00ccff]/50 transition-all outline-none"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black">PFF</div>
                      </div>
                      <button 
                        onClick={handleCustomTokens}
                        className="px-8 py-4 bg-gradient-to-r from-[#00ccff] to-[#0088ff] text-black font-black uppercase rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(0,204,255,0.3)]"
                      >
                        DOŁADUJ
                      </button>
                    </div>
                    {customAmount && !isNaN(parseInt(customAmount)) && (
                      <p className="mt-4 text-white/40 font-bold">
                        Koszt: <span className="text-white">{(parseInt(customAmount) * 0.5).toFixed(2)} zł</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : tab === 'products' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <div 
                      key={product.id}
                      className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-[#00ccff]/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-[#00ccff] transition-colors">
                            {product.name}
                          </h3>
                          {product.badge && (
                            <div className="bg-[#ff0080]/80 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                              {product.badge}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-white/50 text-sm mb-6 flex-grow">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="Token" className="w-5 h-5 object-contain" />
                            <span className="text-xl font-black text-[#00ccff]">
                              {product.price}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => handleBuyProduct(product)}
                            className="px-5 py-2.5 bg-white/10 hover:bg-[#00ccff] hover:text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 border border-white/10"
                          >
                            DODAJ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {subscriptions.map((sub) => (
                    <div 
                      key={sub.id}
                      className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#00ccff]/50 transition-all duration-500 hover:translate-y-[-8px] flex flex-col"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-b from-[#00ccff]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-[#00ccff] transition-colors">
                            {sub.name}
                          </h3>
                          <div className="bg-yellow-500/80 px-3 py-1 rounded-full text-[10px] font-black uppercase text-black">
                            {sub.badge}
                          </div>
                        </div>
                        
                        <p className="text-white/50 text-sm mb-8">
                          {sub.description}
                        </p>

                        <div className="space-y-4 mb-8">
                          <label className="text-xs font-bold text-white/40 uppercase block">Wybierz okres (dni):</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[7, 30, 90].map((d) => (
                              <button
                                key={d}
                                onClick={() => setSubDays({ ...subDays, [sub.id]: d })}
                                className={`py-2 rounded-xl font-black transition-all ${subDays[sub.id] === d ? 'bg-[#00ccff] text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/40 uppercase">Razem:</span>
                            <div className="flex items-center gap-2">
                              <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="Token" className="w-5 h-5 object-contain" />
                              <span className="text-2xl font-black text-[#00ccff]">
                                {sub.pricePerDay * (subDays[sub.id] || 30)}
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleBuySubscription(sub)}
                            className="px-8 py-3 bg-[#00ccff] hover:bg-[#00ccff]/80 text-black font-black text-sm uppercase rounded-xl transition-all active:scale-95 shadow-[0_4px_15px_rgba(0,204,255,0.3)]"
                          >
                            DODAJ DO KOSZYKA
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

      {/* Cart Sidebar/Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-2xl font-black uppercase tracking-tight">KOSZYK</h3>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex-1">
                    <h4 className="font-black uppercase text-sm">{item.name}</h4>
                    <div className="flex items-center gap-2 text-[#00ccff]">
                      <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="" className="w-3 h-3" />
                      <span className="text-xs font-bold">{item.price}</span>
                      {item.quantity > 1 && <span className="text-white/40 text-[10px]">x{item.quantity}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-20 text-white/20 font-bold uppercase">Koszyk jest pusty</div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-white/40 uppercase">Suma:</span>
                <div className="flex items-center gap-2">
                  <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="" className="w-6 h-6" />
                  <span className="text-2xl font-black text-[#00ccff]">
                    {cart.reduce((acc, i) => acc + (i.price * (i.quantity || 1)), 0)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => confirmPurchase({ type: 'cart' })}
                disabled={cart.length === 0 || loading}
                className="w-full py-4 bg-[#00ccff] hover:bg-[#00ccff]/80 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(0,204,255,0.3)]"
              >
                {loading ? 'PRZETWARZANIE...' : 'ZAPŁAĆ TOKENAMI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Purchase Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmModal(null)}></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Potwierdź zakup</h3>
            <p className="text-white/40 text-sm mb-6">Zamawiasz: <span className="text-white font-bold">{confirmModal.name}</span></p>
            
            <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white/40 uppercase text-xs font-bold">Otrzymasz:</span>
                <div className="flex items-center gap-2">
                  <img src="https://i.ibb.co/SXJ3TDjY/obraz-2026-01-22-144700123.png" alt="" className="w-5 h-5" />
                  <span className="text-xl font-black text-[#00ccff]">{confirmModal.regularTokens + (confirmModal.bonusTokens || 0)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 uppercase text-xs font-bold">Do zapłaty:</span>
                <span className="text-xl font-black text-white">{confirmModal.pln}</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase rounded-2xl transition-all"
              >
                ANULUJ
              </button>
              <button 
                onClick={() => confirmPurchase(confirmModal)}
                disabled={loading}
                className="flex-1 py-4 bg-[#00ccff] hover:bg-[#00ccff]/80 text-black font-black uppercase rounded-2xl transition-all active:scale-95 shadow-[0_0_30px_rgba(0,204,255,0.3)]"
              >
                {loading ? 'ŁADOWANIE...' : 'POTWIERDZAM'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
