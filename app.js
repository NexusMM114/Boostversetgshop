/**
 * MAIN APPLICATION LOGIC - BoostVerseTG Shop
 * Handles Firebase connection, Services Data, Navigation, and Rendering.
 */

// --- 1. Initialization ---
if (typeof CONFIG === 'undefined') {
    console.error("Critical Error: config.js not found!");
} else {
    firebase.initializeApp(CONFIG.firebase);
    var db = firebase.firestore();
    var auth = firebase.auth();
    var appId = CONFIG.firebase.projectId;
}

let currentUser = JSON.parse(localStorage.getItem('bv_user') || 'null');
const appContent = document.getElementById('app-content');

// --- 2. Full Service & Category Data ---
const CATEGORIES = {
    'A': { title: '🌐 Digital Products', full: 'Websites, Bio Links, and high-converting landing pages.' },
    'B': { title: '🎨 Design Services', full: 'Professional logos, thumbnails, and custom Telegram banners.' },
    'C': { title: '🎮 Gaming Services', full: 'Sensitivity setups, keybind designs, and montage edits.' },
    'D': { title: '⚡ Custom Services', full: 'Bespoke branding and custom bulk order fulfillment.' }
};

const SERVICES = {
    // Category A
    'web-bio-link': { cat: 'A', name: 'Webpage / Bio Link Website', price: '₹149', qrPrice: 149 },
    'full-template': { cat: 'A', name: 'Full Website Template', price: '₹299', qrPrice: 299 },
    'portfolio-page': { cat: 'A', name: 'Portfolio / Business Page', price: '₹199', qrPrice: 199 },
    'custom-landing': { cat: 'A', name: 'Custom Landing Page', price: '₹399', qrPrice: 399 },

    // Category B
    'gaming-logo': { cat: 'B', name: 'Gaming Logo', price: '₹20', qrPrice: 20 },
    'professional-logo': { cat: 'B', name: 'Professional Logo', price: '₹20', qrPrice: 20 },
    'youtube-thumbnail': { cat: 'B', name: 'YouTube Thumbnail', price: '₹20', qrPrice: 20 },
    'instagram-banner': { cat: 'B', name: 'Instagram Banner', price: '₹20', qrPrice: 20 },
    'telegram-banner': { 
        cat: 'B', name: 'Telegram Channel Banner', price: '₹20', qrPrice: 20,
        variants: [
            '1. Modern Telegram Banner',
            '2. Gaming Style Banner',
            '3. Business/Professional Banner',
            '4. Futuristic / Sci-Fi Banner',
            '5. Minimal Aesthetic Banner',
            '6. Digital Shop Banner'
        ]
    },

    // Category C
    'sensitivity': { cat: 'C', name: 'Sensitivity Settings', price: '₹20', qrPrice: 20 },
    'keybind-layout': { cat: 'C', name: 'Keybind Layout Design', price: '₹20', qrPrice: 59 },
    'game-thumbnail': { cat: 'C', name: 'Game Thumbnail / Cover', price: '₹49', qrPrice: 49 },
    
    // Category D
    'custom-pack': { cat: 'D', name: 'Custom Full Service', price: '₹499', qrPrice: 499 }
};

// --- 3. Utility Functions ---
function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; 
    t.classList.remove('opacity-0', 'scale-90'); 
    t.classList.add('opacity-100', 'scale-100');
    setTimeout(() => { 
        t.classList.add('opacity-0', 'scale-90'); 
        t.classList.remove('opacity-100', 'scale-100'); 
    }, 3000);
}

function navigate(path) { 
    window.location.hash = path; 
    window.scrollTo(0,0); 
    render(); 
}

// --- 4. Navigation & Page Rendering ---
async function render() {
    if (!auth.currentUser) await auth.signInAnonymously().catch(e => console.error("Auth error", e));
    
    const hash = window.location.hash.slice(1);
    const pathName = window.location.pathname;
    const [page, id] = hash.split('/');

    if (pathName.endsWith('/admin') || page === 'admin') { 
        renderAdmin(); 
        return; 
    }

    appContent.innerHTML = '';
    if (page === 'dashboard') renderDashboard();
    else if (page === 'category' && id) renderCategory(id);
    else if (page === 'service' && id) renderServiceForm(id);
    else if (page === 'track-order') renderTrack();
    else if (page === 'login') renderLogin();
    else renderHome();
}

function renderHome() {
    let welcome = currentUser ? `
        <div onclick="navigate('dashboard')" class="glass-card p-4 mb-6 flex items-center justify-between bg-red-600/10 cursor-pointer border-l-2 border-red-500">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white christmas-font text-xl">${currentUser.name[1].toUpperCase()}</div>
                <div>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Member Dashboard</p>
                    <p class="text-sm font-semibold italic">Hi, ${currentUser.name}! ❄️</p>
                </div>
            </div>
            <span class="text-red-400 font-bold">Dash →</span>
        </div>` : '';
    
    let html = welcome + `<section class="text-center mb-8 py-2"><h2 class="text-3xl font-bold christmas-font text-white mb-2">Premium Digital Shop</h2><p class="text-[10px] text-gray-400 px-8 tracking-widest leading-relaxed font-light uppercase">Visual Excellence with Precision</p></section><div class="space-y-4">`;
    Object.entries(CATEGORIES).forEach(([id, cat]) => {
        html += `
            <div onclick="navigate('category/${id}')" class="glass-card p-6 cursor-pointer flex justify-between items-center group transition-all hover:bg-white/5">
                <div>
                    <h3 class="text-xl font-bold text-white mb-1 christmas-font group-hover:text-red-400 transition">${cat.title}</h3>
                    <p class="text-[10px] text-gray-400 font-medium">${cat.full}</p>
                </div>
                <span class="text-gray-600 group-hover:text-red-400 transition text-xl">→</span>
            </div>`;
    });
    appContent.innerHTML = html + `</div>`;
}

function renderLogin() {
    if (currentUser) { navigate('dashboard'); return; }
    appContent.innerHTML = `
        <div id="login-step-1" class="glass-card p-8">
            <h2 class="text-3xl christmas-font text-indigo-400 mb-6 text-center">Telegram Login</h2>
            <input type="text" id="tg-username" placeholder="@your_username" class="input-style mb-4">
            <button onclick="requestOTP()" class="w-full bg-indigo-600 py-4 rounded-xl font-bold text-lg uppercase shadow-xl shadow-indigo-900/40">Request OTP 🚀</button>
        </div>
        <div id="login-step-2" class="glass-card p-8 hidden">
            <h2 class="text-2xl christmas-font text-red-400 mb-4 text-center">Verify OTP</h2>
            <p class="text-[10px] text-gray-500 text-center mb-6 leading-relaxed">Message <a href="https://t.me/${CONFIG.telegramBot}" target="_blank" class="text-indigo-400 font-bold underline italic">@${CONFIG.telegramBot}</a> to get your code.</p>
            <input type="number" id="otp-input" placeholder="000000" class="input-style text-center text-xl tracking-[0.5em] mb-4">
            <button onclick="verifyOTP()" class="w-full bg-red-600 py-4 rounded-xl font-bold text-lg uppercase shadow-xl shadow-red-900/40">Verify Login</button>
        </div>
    `;
}

window.requestOTP = () => {
    const u = document.getElementById('tg-username').value.trim().replace('@', '').toLowerCase();
    if (!u) { showToast("Enter Telegram username"); return; }
    document.getElementById('login-step-1').classList.add('hidden');
    document.getElementById('login-step-2').classList.remove('hidden');
    showToast("Now check Telegram Bot!");
};

window.verifyOTP = async () => {
    const u = document.getElementById('tg-username').value.trim().replace('@', '').toLowerCase();
    const inputOtp = document.getElementById('otp-input').value.trim();
    try {
        const doc = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('otps').doc(u).get();
        if (doc.exists && doc.data().otp === inputOtp) {
            currentUser = { name: "@" + u };
            localStorage.setItem('bv_user', JSON.stringify(currentUser));
            showToast("Login Successful! ❄️");
            navigate('dashboard');
        } else {
            showToast("Invalid Code. Request again from bot.");
        }
    } catch (e) { showToast("Sync Error. Check Project ID."); }
};

function renderCategory(id) {
    let html = `<div class="mb-6"><button onclick="navigate('home')" class="text-xs text-red-400 mb-2">← Back to Home</button><h2 class="text-3xl christmas-font text-white">${CATEGORIES[id].title}</h2></div><div class="space-y-3">`;
    Object.entries(SERVICES).filter(([_, s]) => s.cat === id).forEach(([sid, s]) => {
        html += `<div onclick="navigate('service/${sid}')" class="glass-card p-4 flex justify-between items-center cursor-pointer border-l-4 border-red-500 hover:bg-white/5 transition"><span class="text-white text-sm font-medium">${s.name}</span><span class="text-yellow-500 font-bold text-xs">${s.price}</span></div>`;
    });
    appContent.innerHTML = html + `</div>`;
}

function renderServiceForm(id) {
    const s = SERVICES[id];
    let variantHtml = '';
    if (s.variants) {
        variantHtml = `<select id="variant" class="input-style mb-4 font-bold text-red-400"><option value="">-- Choose Style --</option>${s.variants.map(v => `<option value="${v}">${v}</option>`).join('')}</select>`;
    }

    const upiLink = `upi://pay?pa=${CONFIG.upiId}&pn=BoostVerseTG&am=${s.qrPrice}&cu=INR&tn=${encodeURIComponent(s.name)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

    appContent.innerHTML = `
        <div class="glass-card p-6 text-center">
            <button onclick="navigate('category/${s.cat}')" class="text-xs text-red-400 mb-2 block text-left">← Back</button>
            <h2 class="text-2xl christmas-font text-white mb-2">${s.name}</h2>
            <img src="${qrUrl}" alt="QR" class="mx-auto w-32 h-32 border-2 border-red-500 mb-2 rounded-lg bg-white p-1">
            <p class="text-[9px] text-gray-500 font-bold uppercase mb-6 italic">Scan to Pay ₹${s.qrPrice} with any UPI App</p>
            
            <form onsubmit="placeOrder(event, '${id}')" class="space-y-4">
                <input type="text" id="ord-name" value="${currentUser?currentUser.name:''}" placeholder="Telegram @Username" required class="input-style text-left">
                ${variantHtml}
                <textarea id="ord-req" placeholder="Describe your requirements (colors, text, etc.)..." required class="input-style text-left" rows="3"></textarea>
                <input type="text" id="ord-utr" placeholder="UTR Number (Transaction ID)" required class="input-style text-left">
                <button type="submit" class="w-full bg-red-600 py-4 rounded-xl font-bold text-lg uppercase shadow-xl shadow-red-900/40">Submit Order 🎁</button>
            </form>
        </div>`;
}

async function placeOrder(e, sid) {
    e.preventDefault();
    const oid = "BV" + Math.floor(100000 + Math.random() * 900000);
    const variant = document.getElementById('variant')?.value || 'N/A';
    const data = { 
        id: oid, 
        service: SERVICES[sid].name, 
        variant: variant,
        client: document.getElementById('ord-name').value, 
        req: document.getElementById('ord-req').value, 
        utr: document.getElementById('ord-utr').value, 
        status: 'Pending', 
        date: new Date().toLocaleString() 
    };
    try {
        await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(oid).set(data);
        window.open(CONFIG.screenshotForm, "_blank");
        showToast("Order Submitted to Cloud!");
        navigate('dashboard');
    } catch (e) { showToast("Order Failed. Try again."); }
}

async function renderDashboard() {
    if (!currentUser) { navigate('login'); return; }
    appContent.innerHTML = `<div class="text-center p-20 text-gray-400 italic christmas-font text-xl">Syncing Cloud Dashboard...</div>`;
    try {
        const snap = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').get();
        const myOrders = snap.docs.map(d => d.data()).filter(o => o.client.toLowerCase() === currentUser.name.toLowerCase());
        appContent.innerHTML = `
            <div class="space-y-6">
                <div class="glass-card p-6 border-b-4 border-indigo-500 text-center">
                    <h2 class="text-3xl christmas-font">${currentUser.name}</h2>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Official Client Portal</p>
                </div>
                <div class="space-y-3">
                    ${myOrders.length === 0 ? '<p class="text-center text-gray-500 py-10 italic uppercase text-[10px] tracking-widest">No active orders found.</p>' : myOrders.map(o => `
                        <div class="glass-card p-4 flex justify-between items-center border-l-2 ${o.status==='Completed'?'border-green-500':'border-yellow-500'}">
                            <div><p class="text-white text-sm font-bold">${o.service}</p><p class="text-[10px] text-gray-500 font-mono">${o.id}</p></div>
                            <span class="text-[10px] font-bold uppercase ${o.status==='Completed'?'text-green-400':'text-yellow-400'}">${o.status}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="localStorage.removeItem('bv_user');navigate('home')" class="w-full bg-red-600/10 py-3 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest border border-white/5">Sign Out</button>
            </div>`;
    } catch (e) { appContent.innerHTML = `<p class="text-center p-10 text-red-400">Syncing Error.</p>`; }
}

async function renderAdmin() {
    const loggedIn = sessionStorage.getItem('isAdmin') === 'true';
    if (!loggedIn) {
        appContent.innerHTML = `<div class="glass-card p-8 text-center"><h2 class="text-2xl christmas-font mb-4">Admin Access</h2><input type="password" id="adm-p" placeholder="Master Password" class="input-style mb-4 text-center"><button onclick="adminCheck()" class="w-full bg-red-600 py-3 rounded-xl font-bold uppercase tracking-widest">Verify Access</button></div>`;
        return;
    }
    appContent.innerHTML = `<div class="text-center p-20 text-gray-500 italic">Loading Cloud Orders...</div>`;
    const snap = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').get();
    const all = snap.docs.map(d => d.data());
    appContent.innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between items-center"><h2 class="text-2xl christmas-font">Shop Manager</h2><button onclick="sessionStorage.removeItem('isAdmin');render();" class="text-xs text-red-400 font-bold underline">LOGOUT</button></div>
            ${all.map(o => `
                <div class="glass-card p-4 text-[11px] space-y-1">
                    <p class="font-bold text-white text-[12px]">${o.id} - ${o.service}</p>
                    <p class="text-gray-300">Client: ${o.client} (${o.variant})</p>
                    <p class="bg-black/40 p-2 rounded text-indigo-300 italic mb-2">Req: ${o.req}</p>
                    <p class="text-yellow-600 font-bold uppercase">UTR: ${o.utr}</p>
                    <div class="flex gap-2 pt-2">
                        <button onclick="updateCloudStatus('${o.id}', 'Completed')" class="flex-grow bg-green-600/20 text-green-400 p-2 rounded uppercase font-bold text-[10px]">Mark Done</button>
                        <button onclick="deleteCloudOrder('${o.id}')" class="bg-red-600/20 text-red-500 p-2 rounded px-4 text-[10px]">DEL</button>
                    </div>
                </div>`).join('')}
        </div>`;
}

window.adminCheck = () => {
    if(document.getElementById('adm-p').value === CONFIG.adminPassword) { sessionStorage.setItem('isAdmin', 'true'); render(); } 
    else showToast("Wrong Password!");
};

window.updateCloudStatus = async (oid, s) => { 
    await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(oid).update({ status: s }); 
    render(); 
};

window.deleteCloudOrder = async (oid) => { 
    if (confirm("Delete permanently?")) { 
        await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(oid).delete(); 
        render(); 
    } 
};

function renderTrack() {
    appContent.innerHTML = `<div class="glass-card p-6"><h2 class="text-2xl christmas-font text-white mb-4 text-center">Track Order</h2><input type="text" id="tr-id" placeholder="BV123456" class="input-style mb-4 text-center tracking-widest uppercase"><button onclick="trackNow()" class="w-full bg-red-600 py-3 rounded-xl font-bold uppercase text-xs tracking-widest">Verify Status</button><div id="tr-res" class="mt-6"></div></div>`;
}

async function trackNow() {
    const id = document.getElementById('tr-id').value.trim().toUpperCase();
    if (!id) return;
    try {
        const doc = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(id).get();
        if (!doc.exists) { document.getElementById('tr-res').innerHTML = `<p class="text-red-400 text-center uppercase font-bold text-[10px]">Order not found.</p>`; return; }
        const o = doc.data();
        document.getElementById('tr-res').innerHTML = `<div class="glass-card p-4 border-l-4 border-green-500 bg-green-500/5 text-center"><p class="text-sm font-bold text-green-400 mb-1 uppercase tracking-widest">Status: ${o.status}</p><p class="text-xs text-white">Item: ${o.service}</p></div>`;
    } catch (e) { showToast("Track error."); }
}

// Effect
function createSnow() {
    const s = document.createElement('div'); s.className = 'snowflake'; s.innerHTML = '❄';
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDuration = Math.random() * 3 + 2 + 's';
    s.style.fontSize = Math.random() * 10 + 8 + 'px'; document.body.appendChild(s);
    setTimeout(() => s.remove(), 5000);
}
setInterval(createSnow, 500);

// Handlers
window.addEventListener('hashchange', render);
window.onload = render;
