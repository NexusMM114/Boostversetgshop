import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// --- FIREBASE INITIALIZATION ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Use the environment appId or fallback to your hardcoded one
const appId = typeof __app_id !== 'undefined' ? __app_id : 'boostversetg';

const SETTINGS = {
  adminPassword: "madarapapa",
  upiId: "lavyanshboss@fam",
  telegramBot: "BoostVerseTG_Bot",
  formLink: "https://forms.gle/8cfhKqFBmtFYqWRa6"
};

const SERVICES = {
  'gaming-logo': { name: 'Gaming Logo (Mascot/Text)', price: '₹20', qr: 20, cat: 'Design' },
  'sensitivity': { name: 'Sensi Settings (Zero Recoil)', price: '₹20', qr: 20, cat: 'Gaming' },
  'web-bio': { name: 'Bio Link Website', price: '₹149', qr: 149, cat: 'Web' },
  'tg-banner': { name: 'Telegram Channel Banner', price: '₹69', qr: 69, cat: 'Design' },
  'gaming-montage': { name: 'Gaming Montage Edit', price: '₹149', qr: 149, cat: 'Gaming' }
};

export default function App() {
  const [view, setView] = useState('home');
  const [selectedService, setSelectedService] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [toast, setToast] = useState('');
  const [orders, setOrders] = useState([]);
  const [adminAuth, setAdminAuth] = useState(false);

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Always ensure we have an anonymous session for DB access
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth failed", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthReady(true);
      }
      const savedUser = JSON.parse(localStorage.getItem('bv_user'));
      if (savedUser) setUser(savedUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const navigate = (page, id = null) => {
    if (id) setSelectedService(id);
    setView(page);
    window.scrollTo(0, 0);
  };

  const fetchUserOrders = async () => {
    if (!user || !isAuthReady) return;
    try {
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      const snap = await getDocs(q);
      const filtered = snap.docs
        .map(d => d.data())
        .filter(o => o.client?.toLowerCase() === user.name.toLowerCase());
      setOrders(filtered);
    } catch (err) {
      showToast("Orders Sync Error");
    }
  };

  useEffect(() => {
    if (view === 'dashboard' && user) fetchUserOrders();
  }, [view, user, isAuthReady]);

  // --- COMPONENTS ---

  const Header = () => (
    <header className="py-8 text-center">
      <h1 
        className="text-5xl font-bold cursor-pointer select-none mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-pulse" 
        style={{ fontFamily: "'Mountains of Christmas', cursive" }}
        onClick={() => navigate('home')}
      >
        BoostVerseTG
      </h1>
      <p className="text-gray-500 text-[9px] tracking-[0.4em] uppercase font-bold italic">Digital Identity Shop</p>
    </header>
  );

  const Navigation = () => (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-50">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] flex justify-around items-center p-3 shadow-2xl">
        <NavItem icon="🏠" label="HOME" onClick={() => navigate('home')} />
        <NavItem icon="📊" label="DASH" onClick={() => navigate('dashboard')} />
        <NavItem icon="📌" label="TRACK" onClick={() => navigate('track')} />
        <NavItem icon="👤" label="ACCOUNT" onClick={() => navigate('login')} />
      </div>
    </nav>
  );

  const NavItem = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex flex-col items-center cursor-pointer group">
      <span className="text-xl transition-transform group-active:scale-125">{icon}</span>
      <span className="text-[8px] font-bold mt-1 text-gray-500 group-hover:text-red-500 transition-colors uppercase">{label}</span>
    </div>
  );

  const Home = () => (
    <div className="animate-fadeIn">
      {user && (
        <div 
          onClick={() => navigate('dashboard')}
          className="bg-red-500/5 border-l-4 border-red-500 rounded-2xl p-4 mb-8 flex items-center justify-between cursor-pointer"
        >
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-bold">Member Portal</p>
            <p className="text-sm font-bold">Hi, {user.name}! ❄️</p>
          </div>
          <span className="text-red-500 font-bold text-xs uppercase underline">View Dashboard</span>
        </div>
      )}
      <section className="text-center mb-10 px-4">
        <h2 className="text-3xl font-bold mb-2 text-white" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Our Premium Services</h2>
        <p className="text-[11px] text-gray-400 italic">Fast Delivery • Quality Assured • Cloud Secured</p>
      </section>
      <div className="grid gap-4 px-2">
        {Object.entries(SERVICES).map(([sid, s]) => (
          <div 
            key={sid}
            onClick={() => navigate('service', sid)}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl flex justify-between items-center cursor-pointer hover:border-red-500/50 transition active:scale-95"
          >
            <div>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">{s.cat}</p>
              <h4 className="font-bold text-white text-sm uppercase">{s.name}</h4>
            </div>
            <span className="text-yellow-500 font-bold text-sm">{s.price}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const Login = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async () => {
      if (!isAuthReady) {
        showToast("Wait... Connecting to Cloud");
        return;
      }
      setVerifying(true);
      const cleanName = username.trim().replace('@', '').toLowerCase();
      try {
        // Path MUST match bot save path exactly
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'otps', cleanName);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().otp == otp) {
          const newUser = { name: "@" + cleanName };
          setUser(newUser);
          localStorage.setItem('bv_user', JSON.stringify(newUser));
          showToast("Welcome! ❄️");
          navigate('dashboard');
        } else {
          showToast("Wrong Code! Use /login in bot.");
        }
      } catch (err) {
        console.error(err);
        showToast("Cloud Denied: Check Firebase Rules");
      } finally {
        setVerifying(false);
      }
    };

    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center animate-slideUp">
        {step === 1 ? (
          <>
            <h2 className="text-3xl font-bold mb-2 text-indigo-400" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Telegram Auth</h2>
            <p className="text-[10px] text-gray-500 mb-10 uppercase font-bold tracking-widest">Secure Access</p>
            <input 
              type="text" 
              placeholder="@your_username" 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none mb-4 focus:border-indigo-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button 
              onClick={() => { if(username.includes('@')) setStep(2); else showToast("Include @ in username"); }}
              className="w-full bg-indigo-600 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-900/40"
            >
              Next Step 🚀
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2 text-red-400" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Enter OTP</h2>
            <p className="text-[10px] text-gray-500 mb-8 italic">Get code from <a href={`https://t.me/${SETTINGS.telegramBot}`} target="_blank" className="text-indigo-400 font-bold underline">@{SETTINGS.telegramBot}</a></p>
            <input 
              type="number" 
              placeholder="000000" 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-2xl tracking-[0.4em] mb-8 outline-none focus:border-red-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button 
              onClick={handleVerify}
              disabled={verifying}
              className={`w-full ${verifying ? 'bg-gray-600' : 'bg-red-600'} py-4 rounded-2xl font-bold uppercase tracking-widest transition`}
            >
              {verifying ? 'Verifying...' : 'Login Now'}
            </button>
          </>
        )}
      </div>
    );
  };

  const ServiceForm = ({ id }) => {
    const s = SERVICES[id];
    const [utr, setUtr] = useState('');
    const [req, setReq] = useState('');
    const [clientName, setClientName] = useState(user ? user.name : '');
    const [submitting, setSubmitting] = useState(false);

    const upi = `upi://pay?pa=${SETTINGS.upiId}&pn=BoostVerseTG&am=${s.qr}&cu=INR&tn=${encodeURIComponent(s.name)}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upi)}`;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isAuthReady) return showToast("Syncing with Cloud...");
      setSubmitting(true);
      const oid = "BV" + Math.floor(100000 + Math.random() * 900000);
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', oid), {
          id: oid, service: s.name, client: clientName, req, utr, status: 'Pending', date: new Date().toLocaleString()
        });
        window.open(SETTINGS.formLink, "_blank");
        showToast("Success! Opening Form...");
        navigate('dashboard');
      } catch (err) {
        showToast("Submission Failed");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 animate-fadeIn">
        <button onClick={() => navigate('home')} className="text-[10px] text-red-500 mb-6 font-bold uppercase tracking-widest">← BACK</button>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>{s.name}</h2>
          <p className="text-yellow-500 font-bold mb-6 italic">{s.price}</p>
          <div className="bg-white p-3 rounded-2xl inline-block shadow-2xl border-4 border-red-500/10 mb-2">
            <img src={qr} className="w-32 h-32" alt="QR" />
          </div>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">Scan to pay ₹{s.qr}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Telegram @Username" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <textarea placeholder="Your Requirements..." required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none" rows="2" value={req} onChange={(e) => setReq(e.target.value)}></textarea>
          <input type="text" placeholder="UTR Number" required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none" value={utr} onChange={(e) => setUtr(e.target.value)} />
          <button type="submit" disabled={submitting} className="w-full bg-red-600 py-4 rounded-2xl font-bold uppercase shadow-xl shadow-red-900/40">
            {submitting ? 'Syncing...' : 'Submit Order 🎁'}
          </button>
        </form>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] border-b-4 border-indigo-500 text-center">
        <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>{user?.name}</h2>
        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Cloud Dashboard</p>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-10 uppercase text-[9px] tracking-widest italic">No active orders found.</p>
        ) : (
          orders.map(o => (
            <div key={o.id} className={`bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center border-l-2 ${o.status === 'Completed' ? 'border-green-500' : 'border-yellow-500'}`}>
              <div>
                <p className="text-white text-[10px] font-bold uppercase tracking-tight">{o.service}</p>
                <p className="text-[9px] text-gray-500 font-mono tracking-tighter">{o.id}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase ${o.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{o.status}</span>
            </div>
          ))
        )}
      </div>
      <button onClick={() => { localStorage.removeItem('bv_user'); setUser(null); navigate('home'); }} className="w-full py-3 text-red-500 text-[9px] font-bold uppercase tracking-widest opacity-60 underline">Sign Out</button>
    </div>
  );

  const Track = () => {
    const [id, setId] = useState('');
    const [result, setResult] = useState(null);
    const [searching, setSearching] = useState(false);

    const handleTrack = async () => {
      if(!id || !isAuthReady) return;
      setSearching(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', id.toUpperCase());
        const snap = await getDoc(docRef);
        if(snap.exists()) setResult(snap.data());
        else showToast("Order ID Not Found");
      } catch (err) {
        showToast("Tracking Sync Error");
      } finally {
        setSearching(false);
      }
    };

    return (
      <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center animate-fadeIn">
        <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-widest" style={{ fontFamily: "'Mountains of Christmas', cursive" }}>Track Order</h2>
        <input type="text" placeholder="BV123456" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center tracking-widest uppercase mb-4 outline-none" value={id} onChange={(e) => setId(e.target.value)} />
        <button onClick={handleTrack} className="w-full bg-red-600 py-4 rounded-2xl font-bold uppercase">{searching ? 'Searching...' : 'Check Status'}</button>
        {result && (
          <div className="mt-8 bg-green-500/10 border-l-4 border-green-500 p-5 rounded-2xl text-center">
            <p className="text-green-400 font-bold uppercase text-xs mb-1">Status: {result.status}</p>
            <p className="text-[10px] text-white uppercase tracking-tighter">{result.service}</p>
          </div>
        )}
      </div>
    );
  };

  const Admin = () => {
    const [pass, setPass] = useState('');
    const [allOrders, setAllOrders] = useState([]);

    const handleLogin = () => {
      if(pass === SETTINGS.adminPassword) setAdminAuth(true);
      else showToast("Password Incorrect");
    };

    const fetchAll = async () => {
      if (!isAuthReady) return;
      try {
        const q = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
        const snap = await getDocs(q);
        setAllOrders(snap.docs.map(d => d.data()));
      } catch(e) { showToast("Admin Sync Failed"); }
    };

    useEffect(() => {
      if(adminAuth) fetchAll();
    }, [adminAuth, isAuthReady]);

    const completeOrder = async (id) => {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', id), { status: 'Completed' });
      fetchAll();
      showToast("Updated!");
    };

    if(!adminAuth) return (
      <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] text-center">
        <h2 className="text-2xl font-bold mb-8 text-white uppercase tracking-widest">Admin</h2>
        <input type="password" placeholder="Pass" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center mb-6 outline-none" value={pass} onChange={(e) => setPass(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-red-600 py-4 rounded-2xl font-bold uppercase">Enter</button>
      </div>
    );

    return (
      <div className="space-y-4 pb-10">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Management</h2>
          <button onClick={() => setAdminAuth(false)} className="text-red-400 text-[10px] font-bold underline uppercase">Exit</button>
        </div>
        {allOrders.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl text-[10px] space-y-2">
            <p className="font-bold text-white">{o.id} - {o.client}</p>
            <p className="text-indigo-400 font-bold uppercase">{o.service}</p>
            <p className="text-gray-500 italic bg-black/40 p-2 rounded">{o.req}</p>
            <p className="text-indigo-300 font-bold text-[9px]">UTR: {o.utr}</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => completeOrder(o.id)} className="flex-grow bg-green-600/20 text-green-400 p-2 rounded uppercase font-bold text-[9px] border border-green-500/30">Complete</button>
              <button onClick={async () => { if(confirm("Del?")) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', o.id)); fetchAll(); } }} className="bg-red-600/20 text-red-500 p-2 rounded px-4 text-[9px] border border-red-500/30">Del</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050a18] flex flex-col justify-center items-center">
      <div className="text-4xl text-red-500 animate-bounce">❄</div>
      <p className="text-gray-500 text-[10px] mt-4 tracking-[0.4em] uppercase font-bold">Syncing Shop...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050a18] text-[#f1f5f9] relative overflow-hidden flex justify-center">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {[...Array(10)].map((_, i) => (
        <div key={i} className="fixed top-[-20px] text-white opacity-10 pointer-events-none animate-fall" style={{ left: `${Math.random() * 100}vw`, animationDuration: `${Math.random() * 5 + 5}s`, animationDelay: `${Math.random() * 5}s`, fontSize: `${Math.random() * 15 + 10}px` }}>❄</div>
      ))}

      <div className="w-full max-w-[480px] p-4 flex flex-col relative z-10">
        <Header />
        <main className="flex-grow pb-32">
          {view === 'home' && <Home />}
          {view === 'login' && <Login />}
          {view === 'dashboard' && <Dashboard />}
          {view === 'track' && <Track />}
          {view === 'admin' && <Admin />}
          {view === 'service' && <ServiceForm id={selectedService} />}
        </main>
        <Navigation />
        {toast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-bounce text-[10px] font-bold uppercase tracking-widest">
            {toast}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fall { 0% { transform: translateY(-10vh) rotate(0deg); } 100% { transform: translateY(110vh) rotate(360deg); } }
        .animate-fall { animation: fall linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.4s ease forwards; }
        .animate-slideUp { animation: slideUp 0.4s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

