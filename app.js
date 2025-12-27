// --- 1. INITIALIZATION ---
firebase.initializeApp(CONFIG.firebase);
const db = firebase.firestore();
const auth = firebase.auth();
const appId = CONFIG.firebase.projectId;

let currentUser = JSON.parse(localStorage.getItem('bv_user') || 'null');
const appContent = document.getElementById('app-content');

// --- 2. DATA ---
const CATEGORIES = {
    'A': { title: '🌐 Digital Products', full: 'Websites, Bio Links, and landing pages.' },
    'B': { title: '🎨 Design Services', full: 'Gaming logos and custom banners in multiple styles.' },
    'C': { title: '🎮 Gaming Services', full: 'Sensitivity setups and professional montage editing.' },
    'D': { title: '⚡ Custom Services', full: 'Bespoke branding and bulk orders.' }
};

const SERVICES = {
    'web-bio-link': { cat: 'A', name: 'Bio Link Website', price: '₹149', qrPrice: 149 },
    'gaming-logo': { cat: 'B', name: 'Gaming Logo', price: '₹20', qrPrice: 20 },
    'telegram-banner': { 
        cat: 'B', name: 'Telegram Banner', price: '₹69', qrPrice: 69,
        variants: ['Modern', 'Gaming', 'Professional', 'Futuristic', 'Minimal', 'Digital Shop']
    },
    'sensitivity': { cat: 'C', name: 'Sensitivity Settings', price: '₹20', qrPrice: 20 },
    'gaming-montage': { cat: 'C', name: 'Montage Edit', price: '₹149', qrPrice: 149 }
};

// --- 3. UTILS ---
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.remove('opacity-0', 'scale-90'); t.classList.add('opacity-100', 'scale-100');
    setTimeout(() => { t.classList.add('opacity-0', 'scale-90'); t.classList.remove('opacity-100', 'scale-100'); }, 3000);
}

function navigate(path) { window.location.hash = path; window.scrollTo(0,0); render(); }

// --- 4. RENDERER ---
async function render() {
    if (!auth.currentUser) await auth.signInAnonymously().catch(() => {});
    
    const hash = window.location.hash.slice(1);
    const pathName = window.location.pathname;
    const [page, id] = hash.split('/');

    if (pathName.endsWith('/admin') || page === 'admin') { renderAdmin(); return; }

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
                    <p class="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Member Dashboard</p>
                    <p class="text-sm font-semibold italic">Hi, ${currentUser.name}! ❄️</p>
                </div>
            </div>
            <span class="text-red-400 font-bold">Dash →</span>
        </div>` : '';
    
    let html = welcome + `<div class="space-y-4">`;
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
            <h2 class="text-3xl christmas-font text-indigo-400 mb-6 text-center">Telegram Auth</h2>
            <input type="text" id="tg-username" placeholder="@your_username" class="input-style mb-4">
            <button onclick="requestOTP()" class="w-full bg-indigo-600 py-4 rounded-xl font-bold text-lg uppercase">Send OTP 🚀</button>
        </div>
        <div id="login-step-2" class="glass-card p-8 hidden">
            <h2 class="text-2xl christmas-font text-red-400 mb-4 text-center">Verify Identity</h2>
            <p class="text-[10px] text-gray-500 text-center mb-6">Message <a href="https://t.me/${CONFIG.telegramBot}" class="text-indigo-400 font-bold underline">@${CONFIG.telegramBot}</a> for code</p>
            <input type="number" id="otp-input" placeholder="000000" class="input-style text-center text-xl tracking-[0.5em] mb-4">
            <button onclick="verifyOTP()" class="w-full bg-red-600 py-4 rounded-xl font-bold text-lg uppercase">Login</button>
        </div>
    `;
}

window.requestOTP = () => {
    const u = document.getElementById('tg-username').value.trim().replace('@', '').toLowerCase();
    if (!u) { showToast("Enter Telegram username"); return; }
    document.getElementById('login-step-1').classList.add('hidden');
    document.getElementById('login-step-2').classList.remove('hidden');
    showToast("Check Telegram Bot!");
};

window.verifyOTP = async () => {
    const username = document.getElementById('tg-username').value.trim().replace('@', '').toLowerCase();
    const inputOtp = document.getElementById('otp-input').value.trim();
    try {
        const doc = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('otps').doc(username).get();
        if (doc.exists && doc.data().otp === inputOtp) {
            currentUser = { name: "@" + username };
            localStorage.setItem('bv_user', JSON.stringify(currentUser));
            showToast("Login Successful!"); navigate('dashboard');
        } else { showToast("Invalid Code."); }
    } catch (e) { showToast("Sync Error."); }
};

function renderServiceForm(id) {
    const s = SERVICES[id];
    const upiLink = `upi://pay?pa=${CONFIG.upiId}&pn=BoostVerseTG&am=${s.qrPrice}&cu=INR&tn=${encodeURIComponent(s.name)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
    appContent.innerHTML = `<div class="glass-card p-6"><button onclick="navigate('category/${s.cat}')" class="text-xs text-red-400 mb-2">← Back</button><h2 class="text-2xl christmas-font text-white mb-1">${s.name}</h2><p class="text-yellow-500 font-bold mb-6">${s.price}</p><div class="bg-white p-3 rounded-xl mb-6 text-center"><img src="${qrUrl}" alt="QR" class="mx-auto w-32 h-32 border-2 border-red-500 mb-2"><p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest italic">Scan To Pay ₹${s.qrPrice}</p></div><form onsubmit="placeOrder(event, '${id}')" class="space-y-4"><input type="text" id="ord-name" value="${currentUser?currentUser.name:''}" placeholder="Telegram @Username" required class="input-style"><textarea id="ord-req" placeholder="Project details/requirements..." required class="input-style" rows="3"></textarea><input type="text" id="ord-utr" placeholder="UTR Number" required class="input-style"><button type="submit" class="w-full bg-red-600 py-4 rounded-xl font-bold text-lg uppercase shadow-xl shadow-red-900/40">Submit Order 🎁</button></form></div>`;
}

async function placeOrder(e, sid) {
    e.preventDefault();
    const oid = "BV" + Math.floor(100000 + Math.random() * 900000);
    const data = { id: oid, service: SERVICES[sid].name, client: document.getElementById('ord-name').value, req: document.getElementById('ord-req').value, utr: document.getElementById('ord-utr').value, status: 'Pending', date: new Date().toLocaleString() };
    try {
        await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(oid).set(data);
        window.open(CONFIG.screenshotForm, "_blank"); navigate('dashboard');
    } catch (e) { showToast("DB Error."); }
}

async function renderDashboard() {
    if (!currentUser) { navigate('login'); return; }
    appContent.innerHTML = `<div class="text-center p-20 text-gray-500 italic christmas-font text-xl">Loading Cloud Data...</div>`;
    const snap = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').get();
    const myOrders = snap.docs.map(d => d.data()).filter(o => o.client === currentUser.name);
    appContent.innerHTML = `<div class="space-y-6"><div class="glass-card p-6 border-b-4 border-indigo-500 text-center"><h2 class="text-3xl christmas-font">${currentUser.name}</h2><p class="text-[10px] text-gray-500 uppercase tracking-widest">My Cloud Dashboard</p></div><div class="space-y-3">${myOrders.length === 0 ? '<p class="text-center text-gray-500 py-10 italic">No orders found.</p>' : myOrders.map(o => `<div class="glass-card p-4 flex justify-between items-center border-l-2 ${o.status==='Completed'?'border-green-500':'border-yellow-500'}"><div><p class="text-white text-sm font-bold">${o.service}</p><p class="text-[10px] text-gray-500 font-mono">${o.id}</p></div><span class="text-[10px] font-bold uppercase ${o.status==='Completed'?'text-green-400':'text-yellow-400'}">${o.status}</span></div>`).join('')}</div><button onclick="localStorage.removeItem('bv_user');navigate('home')" class="w-full bg-red-600/10 py-3 rounded-xl text-red-500 text-xs font-bold uppercase">Logout Account</button></div>`;
}

async function renderAdmin() {
    const loggedIn = sessionStorage.getItem('isAdmin') === 'true';
    if (!loggedIn) {
        appContent.innerHTML = `<div class="glass-card p-8 text-center"><h2 class="text-2xl christmas-font mb-4">Admin Portal</h2><input type="password" id="adm-p" placeholder="Password" class="input-style mb-4 text-center"><button onclick="if(document.getElementById('adm-p').value===CONFIG.adminPassword){sessionStorage.setItem('isAdmin','true');render();}" class="w-full bg-red-600 py-3 rounded-xl font-bold uppercase">Login</button></div>`;
        return;
    }
    const snap = await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').get();
    const all = snap.docs.map(d => d.data());
    appContent.innerHTML = `<div class="space-y-4"><div class="flex justify-between items-center"><h2 class="text-2xl christmas-font">Orders</h2><button onclick="sessionStorage.removeItem('isAdmin');render();" class="text-xs text-red-400 underline uppercase font-bold">Exit</button></div>${all.map(o => `<div class="glass-card p-4 text-[11px] space-y-1"><p class="font-bold text-white text-[12px]">${o.id} - ${o.service}</p><p class="text-gray-400">Client: ${o.client}</p><p class="text-yellow-600 font-bold uppercase">UTR: ${o.utr}</p><div class="flex gap-2 pt-2"><button onclick="updateCloudStatus('${o.id}', 'Completed')" class="flex-grow bg-green-600/20 text-green-400 p-2 rounded font-bold uppercase">Mark Done</button><button onclick="deleteCloudOrder('${o.id}')" class="bg-red-600/20 text-red-500 p-2 rounded px-4">DEL</button></div></div>`).join('')}</div>`;
}

window.updateCloudStatus = async (oid, s) => { await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(oid).update({ status: s }); render(); };
window.deleteCloudOrder = async (oid) => { if (confirm("Delete forever?")) { await db.collection('artifacts').doc(appId).collection('public').doc('data').collection('orders').doc(oid).delete(); render(); } };

function createSnow() {
    const s = document.createElement('div'); s.className = 'snowflake'; s.innerHTML = '❄';
    s.style.left = Math.random() * 100 + 'vw'; s.style.animationDuration = Math.random() * 3 + 2 + 's';
    s.style.fontSize = Math.random() * 10 + 8 + 'px'; document.body.appendChild(s);
    setTimeout(() => s.remove(), 5000);
}
setInterval(createSnow, 500);

window.onhashchange = render();
window.onload = render;
