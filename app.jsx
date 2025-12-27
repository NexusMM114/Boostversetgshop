import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'boostversetg';

// --- SHOP SETTINGS ---
const SETTINGS = {
  adminPassword: "nexus@mm",
  upiId: "lavyanshboss@fam",
  telegramBot: "BoostVerseLoginBoT",
  formLink: "https://forms.gle/8cfhKqFBmtFYqWRa6",
  brandLogo: "brandlogo.png" 
};

// --- LOGO CATALOG DATA ---
const LOGO_CATALOG = {
  'logo-1': { 
    name: 'Chrome Typography', 
    price: '₹20', 
    img: 'logo1.png',
    desc: 'Logo 1 (Chrome Typography): A high-polish, metallic silver "nexus" wordmark in a sharp, gothic-inspired font set against a dark, textured background with subtle lens flares on the tips.' 
  },
  'logo-2': { 
    name: 'Claw Marks', 
    price: '₹20', 
    img: 'logo2.png',
    desc: 'Logo 2 (Claw Marks): The word "NEXUS" in a cyan, jagged brush font overlaid on four large, diagonal white claw scratches with a dark, grimy background.' 
  },
  'logo-3': { 
    name: 'Naruto Avatar', 
    price: '₹20', 
    img: 'logo3.png',
    desc: 'Logo 3 (Naruto Avatar): An illustration of Naruto Uzumaki centered in front of a metallic "NEXUS MM" text against a grey, horizontally striped background.' 
  },
  'logo-4': { 
    name: 'Suited Avatar', 
    price: '₹20', 
    img: 'logo4.png',
    desc: 'Logo 4 (Suited Avatar): A mysterious figure in a black suit with their head completely wrapped in white bandages, positioned below a textured silver "NEXUS MM" title.' 
  },
  'logo-5': { 
    name: 'Red Glitch', 
    price: '₹20', 
    img: 'logo5.png',
    desc: 'Logo 5 (Red Glitch): A stylized "NEXUS" text in red and white with a heavy glitch effect, featuring a person in a red hoodie and chains in the background.' 
  },
  'logo-6': { 
    name: 'Spider-Man GFX', 
    price: '₹20', 
    img: 'logo6.png',
    desc: 'Logo 6 (Spider-Man GFX): A vibrant, purple-toned graphic of Spider-Man sitting down, featuring the signature "Lavyansh gfx" in cursive neon purple text.' 
  },
  'logo-7': { 
    name: 'Forest Green', 
    price: '₹20', 
    img: 'logo7.png',
    desc: 'Logo 7 (Forest Green): A bright, neon green "NEXUS" wordmark in an aggressive brush style, set against a dark, misty forest background with floating green particles.' 
  },
  'logo-8': { 
    name: 'Ghostface', 
    price: '₹20', 
    img: 'logo8.png',
    desc: 'Logo 8 (Ghostface): The iconic "Scream" Ghostface mask in a circular frame, with "NEXUS" written in a sharp white font across the center of the dark silhouette.' 
  },
  'logo-9': { 
    name: 'Batman Silhouette', 
    price: '₹20', 
    img: 'logo9.png',
    desc: 'Logo 9 (Batman Silhouette): A stylized Batman figure standing within a circular white glow, with "NEXUS MM" displayed in a clean, futuristic white font at the bottom.' 
  },
  'logo-10': { 
    name: 'Targeted Anime', 
    price: '₹20', 
    img: 'logo10.png',
    desc: 'Logo 10 (Targeted Anime): An anime character with a "NEXUS" blindfold, centered inside a bright orange target reticle with chains and a chaotic monochrome background.' 
  }
};

export default function App() {
  const [view, setView] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [toast, setToast] = useState('');
  const [orders, setOrders] = useState([]);
  const [adminAuth, setAdminAuth] = useState(false);

  // --- BOOTSTRAP AUTH ---
  useEffect(() => {
    const init = async () => {
      try { await signInAnonymously(auth); } catch (e) { console.error("Cloud Connection Error"); }
    };
    init();

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) setIsAuthReady(true);
      const saved = JSON.parse(localStorage.getItem('bv_user'));
      if (saved) setUser(saved);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const navigate = (page, id = null) => {
    if (id) setSelectedId(id);
    setView(page);
    window.scrollTo(0, 0);
  };

  const fetchMyOrders = async () => {
    if (!user || !isAuthReady) return;
    try {
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      const snap = await getDocs(q);
      const filtered = snap.docs
        .map(d => d.data())
        .filter(o => o.client?.toLowerCase() === user.name.toLowerCase());
      setOrders(filtered);
    } catch (e) { showToast("Sync Error"); }
  };

  useEffect(() => {
    if (view === 'dashboard' && user) fetchMyOrders();
  }, [view, user, isAuthReady]);

  // --- COMPONENTS ---

  const Header = () => (
    <header className="py-8 text-center flex flex-col items-center">
      <div className="w-24 h-24 mb-3 relative group cursor-pointer" onClick={() => navigate('home')}>
        <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full group-hover:bg-red-600/40 transition-all"></div>
        <img 
          src={SETTINGS.brandLogo} 
          className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(239,68,68,0.4)]"
          onError={(e) => { e.target.style.display = 'none'; }}
          alt="Brand"
        />
      </div>
      <h1 
        className="text-4xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-500" 
        style={{ fontFamily: "'Mountains of Christmas', cursive" }}
      >
        BoostVerseTG
      </h1>
      <p className="text-gray-500 text-[8px] tracking-[0.6em] uppercase font-black italic">Identity Collective</p>
    </header>
  );

  const Home = () => (
    <div className="space-y-10 animate-fadeIn">
      <section className="text-center px-6">
        <div className="inline-flex bg-red-600 border border-red-400/30 px-5 py-1.5 rounded-full mb-6 shadow-xl">
          <p className="text-[10px] text-white font-black uppercase tracking-widest">❄️ WINTER SALE: ALL LOGOS ₹20</p>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-white leading-tight" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Nexus Catalog</h2>
        <p className="text-[11px] text-gray-400 italic">Select a template to begin your professional branding.</p>
      </section>

      {/* Single Column Layout */}
      <div className="flex flex-col gap-6 px-2">
        {Object.entries(LOGO_CATALOG).map(([id, logo]) => (
          <div 
            key={id} 
            onClick={() => navigate('detail', id)}
            className="group bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden cursor-pointer hover:border-red-600 transition-all active:scale-[0.98] shadow-2xl"
          >
            <div className="h-48 bg-black/40 relative overflow-hidden">
                <img 
                  src={logo.img} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                  alt={logo.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=Premium+Logo"; }}
                />
                <div className="absolute bottom-4 right-4 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-2xl">
                    {logo.price}
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white uppercase mb-2" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>{logo.name}</h3>
                <p className="text-[11px] text-gray-400 line-clamp-2 italic leading-relaxed">{logo.desc}</p>
                <div className="mt-4 text-red-500 font-black text-[9px] uppercase tracking-widest">
                    Order Details →
                </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="py-12 opacity-20 text-center uppercase text-[8px] font-bold tracking-[0.5em]">
          Nexus MM Studio • Official 2025
      </div>
    </div>
  );

  const LogoDetail = () => {
    const logo = LOGO_CATALOG[selectedId];
    const [utr, setUtr] = useState('');
    const [req, setReq] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const upi = `upi://pay?pa=${SETTINGS.upiId}&pn=BoostVerseTG&am=20&cu=INR&tn=${encodeURIComponent(logo.name)}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upi)}`;

    const handleOrder = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      const oid = "BV" + Math.floor(100000 + Math.random() * 900000);
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', oid), {
          id: oid, service: logo.name, client: user ? user.name : document.getElementById('c-name').value, req, utr, status: 'Pending', date: new Date().toLocaleString()
        });
        window.open(SETTINGS.formLink, "_blank");
        showToast("Success! Screenshot form opening...");
        navigate('dashboard');
      } catch (err) { showToast("Sync Error"); } finally { setSubmitting(false); }
    };

    return (
      <div className="animate-slideUp pb-12">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">
            <div className="h-64 bg-black/80 p-4 relative flex justify-center items-center">
                <button onClick={() => navigate('home')} className="absolute top-6 left-6 bg-black/60 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-xl">←</button>
                <img 
                  src={logo.img} 
                  className="h-full object-contain drop-shadow-2xl" 
                  alt="Quality Preview"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=Preview"; }}
                />
            </div>

            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>{logo.name}</h2>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Fixed Pricing</p>
                    </div>
                    <span className="bg-red-600 text-white px-5 py-2 rounded-2xl text-xs font-black shadow-xl">{logo.price}</span>
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border-l-4 border-red-600 mb-10">
                    <p className="text-xs text-gray-300 leading-relaxed italic font-medium">
                        {logo.desc}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center mb-10 shadow-2xl">
                    <img src={qr} className="w-44 h-44 mb-3" alt="QR Code" />
                    <p className="text-[10px] text-black font-black uppercase tracking-widest bg-red-600/10 px-6 py-1.5 rounded-full">Scan To Pay ₹20</p>
                </div>

                <form onSubmit={handleOrder} className="space-y-4">
                    {!user && <input id="c-name" type="text" placeholder="Your Telegram @Username" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-red-500" />}
                    <textarea placeholder="Logo Name, Preferred Colors, & Specific Style Requests..." required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-red-500" rows="3" value={req} onChange={(e) => setReq(e.target.value)}></textarea>
                    <input type="text" placeholder="Transaction UTR Number" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-red-500" value={utr} onChange={(e) => setUtr(e.target.value)} />
                    <button type="submit" disabled={submitting} className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-red-900/40 active:scale-95 transition">
                        {submitting ? 'CONNECTING...' : 'Submit Secure Order'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    );
  };

  const Login = () => {
    const [step, setStep] = useState(1);
    const [inputUser, setInputUser] = useState('');
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async () => {
      if (!isAuthReady) return showToast("Connecting...");
      setVerifying(true);
      const cleanName = inputUser.trim().toLowerCase().replace('@', '');
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'otps', cleanName);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().otp == otp) {
          const newUser = { name: "@" + cleanName };
          setUser(newUser);
          localStorage.setItem('bv_user', JSON.stringify(newUser));
          showToast("Authorized! ❄️");
          navigate('dashboard');
        } else { showToast("Invalid OTP"); }
      } catch (err) { showToast("Sync Error"); } finally { setVerifying(false); }
    };

    return (
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-center animate-slideUp mt-4 shadow-2xl">
        {step === 1 ? (
          <>
            <h2 className="text-3xl font-bold mb-2 text-indigo-400" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Cloud Portal</h2>
            <p className="text-[10px] text-gray-500 mb-10 font-bold uppercase tracking-widest">Verify Access</p>
            <input type="text" placeholder="@your_username" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white text-center outline-none mb-8 focus:border-indigo-500 font-bold" value={inputUser} onChange={(e) => setInputUser(e.target.value)} />
            <button onClick={() => { if(inputUser.includes('@')) setStep(2); else showToast("Use @ prefix"); }} className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest">Request Login Code</button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-red-400" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Verify Identity</h2>
            <p className="text-[10px] text-gray-500 mb-10 italic">Check <a href={`https://t.me/${SETTINGS.telegramBot}`} target="_blank" className="text-indigo-400 font-bold underline">@{SETTINGS.telegramBot}</a></p>
            <input type="number" placeholder="000000" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-4xl tracking-[0.4em] mb-10 outline-none focus:border-red-500" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={handleVerify} disabled={verifying} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase shadow-xl shadow-red-900/40">{verifying ? 'SYNCING...' : 'Enter Dashboard'}</button>
          </>
        )}
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] border-b-4 border-red-500 text-center shadow-2xl relative">
        <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>{user?.name}</h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Official Studio Log</p>
      </div>
      <div className="space-y-4">
        {orders.length === 0 ? <p className="text-center text-gray-500 py-20 uppercase text-[9px] font-black tracking-widest italic opacity-40">No records found.</p> : orders.map(o => (
          <div key={o.id} className={`bg-white/5 border border-white/10 p-6 rounded-[2rem] flex justify-between items-center border-l-4 ${o.status === 'Completed' ? 'border-green-500' : 'border-yellow-500'} shadow-xl`}>
            <div><p className="text-white text-xs font-black uppercase tracking-widest">{o.service}</p><p className="text-[9px] text-gray-500 font-mono mt-1">{o.id}</p></div>
            <span className={`text-[10px] font-black uppercase ${o.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{o.status}</span>
          </div>
        ))}
      </div>
      <button onClick={() => { localStorage.removeItem('bv_user'); setUser(null); navigate('home'); }} className="w-full py-6 text-red-500 text-[10px] font-black uppercase tracking-widest opacity-40 underline transition-all">Sign Out Account</button>
    </div>
  );

  const Track = () => {
    const [id, setId] = useState('');
    const [res, setRes] = useState(null);
    const [searching, setSearching] = useState(false);

    const handleTrack = async () => {
      if(!id) return;
      setSearching(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', id.toUpperCase());
        const snap = await getDoc(docRef);
        if(snap.exists()) setRes(snap.data());
        else showToast("Not Found");
      } catch (err) { showToast("Sync Error"); } finally { setSearching(false); }
    };

    return (
      <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center animate-fadeIn shadow-2xl mt-4">
        <h2 className="text-3xl font-bold mb-10 text-white uppercase tracking-widest" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Order Tracker</h2>
        <input type="text" placeholder="BV123456" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white text-center tracking-widest uppercase mb-8 outline-none focus:border-red-500 font-bold" value={id} onChange={(e) => setId(e.target.value)} />
        <button onClick={handleTrack} className="w-full bg-red-600 py-5 rounded-[2rem] font-black uppercase shadow-xl shadow-red-900/40 active:scale-95 transition">{searching ? 'SEARCHING...' : 'Find My Logo'}</button>
        {res && (
          <div className="mt-12 bg-green-500/10 border-l-4 border-green-500 p-8 rounded-2xl text-center animate-fadeIn shadow-xl">
            <p className="text-green-400 font-black uppercase text-[10px] mb-2 tracking-widest">Order Status: {res.status}</p>
            <p className="text-[12px] text-white uppercase font-bold tracking-widest">{res.service}</p>
          </div>
        )}
      </div>
    );
  };

  const AdminPanel = () => {
    const [pass, setPass] = useState('');
    const [all, setAll] = useState([]);
    const [authIn, setAuthIn] = useState(false);

    const handleLogin = () => {
      if(pass === SETTINGS.adminPassword) setAuthIn(true);
      else showToast("Denied");
    };

    const fetchAll = async () => {
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      const snap = await getDocs(q);
      setAll(snap.docs.map(d => d.data()));
    };

    useEffect(() => { if(authIn) fetchAll(); }, [authIn]);

    if(!authIn) return (
      <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center">
        <h2 className="text-2xl font-bold mb-10 text-white uppercase tracking-widest">Master Key</h2>
        <input type="password" placeholder="Pass" className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-white text-center mb-10 outline-none" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-red-600 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-900/40">Enter Control</button>
      </div>
    );

    return (
      <div className="space-y-6 pb-24 px-1 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Production Queue</h2>
          <button onClick={() => setAuthIn(false)} className="text-red-400 text-[10px] font-black underline uppercase">EXIT</button>
        </div>
        {all.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-[10px] space-y-4 shadow-xl">
            <div className="flex justify-between border-b border-white/10 pb-4">
              <p className="font-black text-white uppercase tracking-widest">{o.id} - {o.service}</p>
              <p className="text-yellow-500 font-black uppercase">{o.status}</p>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest">Client: <span className="text-white font-black">{o.client}</span></p>
            <div className="bg-black/60 p-5 rounded-3xl border border-white/5">
                <p className="text-white text-[11px] font-medium leading-relaxed italic">Req: {o.req}</p>
            </div>
            <p className="text-red-500 font-black uppercase text-[11px] tracking-widest">UTR: {o.utr}</p>
            <div className="flex gap-4 pt-4">
              <button onClick={async () => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', o.id), { status: 'Completed' }); fetchAll(); showToast("Done!"); }} className="flex-grow bg-green-600 text-white p-4 rounded-3xl uppercase font-black text-[10px] shadow-lg shadow-green-900/30">Complete Order</button>
              <button onClick={async () => { if(confirm("Del?")) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', o.id)); fetchAll(); } }} className="bg-red-600/20 text-red-500 p-4 rounded-3xl px-8 text-[10px] font-black border border-red-500/10 uppercase">DEL</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050a18] flex flex-col justify-center items-center">
      <div className="text-7xl animate-pulse">❄️</div>
      <p className="text-gray-500 text-[10px] mt-8 tracking-[1.5em] uppercase font-black italic">BoostVerse</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050a18] text-[#f1f5f9] relative overflow-hidden flex justify-center">
      <div className="fixed top-[-15%] left-[-15%] w-[80%] h-[80%] bg-red-600/[0.08] blur-[180px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-15%] right-[-15%] w-[80%] h-[80%] bg-indigo-600/[0.08] blur-[180px] rounded-full pointer-events-none"></div>

      {[...Array(12)].map((_, i) => (
        <div key={i} className="fixed top-[-20px] text-white opacity-10 pointer-events-none animate-fall" style={{ left: `${Math.random() * 100}vw`, animationDuration: `${Math.random() * 8 + 8}s`, animationDelay: `${Math.random() * 10}s`, fontSize: `${Math.random() * 15 + 10}px` }}>❄</div>
      ))}

      <div className="w-full max-w-[480px] p-6 flex flex-col relative z-10">
        <Header />
        <main className="flex-grow pb-36">
          {view === 'home' && <Home />}
          {view === 'login' && <Login />}
          {view === 'dashboard' && <Dashboard />}
          {view === 'track' && <Track />}
          {view === 'detail' && <LogoDetail />}
          {view === 'admin' && <AdminPanel />}
        </main>
        
        {/* Navigation Bar */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[380px] z-50">
          <div className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] flex justify-around items-center p-5 shadow-2xl">
            <div onClick={() => navigate('home')} className={`flex flex-col items-center cursor-pointer transition-all ${view === 'home' ? 'text-red-500' : 'opacity-30'}`}><span className="text-2xl">🏠</span><span className="text-[8px] font-black mt-1 uppercase tracking-widest">Shop</span></div>
            <div onClick={() => navigate('dashboard')} className={`flex flex-col items-center cursor-pointer transition-all ${view === 'dashboard' ? 'text-red-500' : 'opacity-30'}`}><span className="text-2xl">📊</span><span className="text-[8px] font-black mt-1 uppercase tracking-widest">Dash</span></div>
            <div onClick={() => navigate('login')} className={`flex flex-col items-center cursor-pointer transition-all ${view === 'login' ? 'text-red-500' : 'opacity-30'}`}><span className="text-2xl">👤</span><span className="text-[8px] font-black mt-1 uppercase tracking-widest">Auth</span></div>
          </div>
        </nav>

        {toast && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-full shadow-2xl z-[100] animate-bounce text-[10px] font-black uppercase tracking-widest text-center min-w-[260px]">
            {toast}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); } 100% { transform: translateY(115vh) rotate(360deg); } }
        .animate-fall { animation: fall linear infinite; }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 2.5rem; }
      `}</style>
    </div>
  );
}


