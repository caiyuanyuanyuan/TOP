// 本地存储兼容层：隐私模式或部分内嵌浏览器禁用 storage 时自动降级到内存
const safeStorage = (() => {
    const memory = new Map();
    return {
        getItem(key) {
            try { return window.localStorage.getItem(key); }
            catch (_) { return memory.has(key) ? memory.get(key) : null; }
        },
        setItem(key, value) {
            const text = String(value);
            try { window.localStorage.setItem(key, text); }
            catch (_) { memory.set(key, text); }
        },
        removeItem(key) {
            try { window.localStorage.removeItem(key); }
            catch (_) { memory.delete(key); }
        }
    };
})();

// ========== Supabase 云端配置 ==========
// 1. 在 Supabase 创建项目并执行同目录的 supabase-setup.sql
// 2. 开启 Authentication > Providers > Anonymous Sign-Ins
// 3. 将下面两项替换成项目设置里的 Project URL 和 Publishable Key（或 legacy anon key）
const SUPABASE_URL = 'https://tsydxgednpxyqnbzzcpu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable__2aJq5w8cm7j1OH1BGRAzA_IBUhQf_9';
const CLOUD_CONFIGURED = !SUPABASE_URL.includes('YOUR_PROJECT_ID')
    && !SUPABASE_PUBLISHABLE_KEY.includes('YOUR_SUPABASE');
let cloud = null;
let supabaseSdkPromise = null;

function initSupabaseCloud() {
    if (cloud || !CLOUD_CONFIGURED) return cloud;
    const supabaseFactory = window.supabase?.createClient;
    if (typeof supabaseFactory !== 'function') return null;
    cloud = supabaseFactory(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    return cloud;
}

function loadSupabaseSdk() {
    if (!CLOUD_CONFIGURED) return Promise.resolve(null);
    if (initSupabaseCloud()) return Promise.resolve(cloud);
    if (supabaseSdkPromise) return supabaseSdkPromise;
    supabaseSdkPromise = new Promise(resolve => {
        const sdk = document.createElement('script');
        sdk.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        sdk.async = true;
        sdk.onload = () => resolve(initSupabaseCloud());
        sdk.onerror = () => {
            console.warn('Supabase SDK 加载失败，页面继续使用本地模式。');
            resolve(null);
        };
        document.head.appendChild(sdk);
    });
    return supabaseSdkPromise;
}

window.initSupabaseCloud = initSupabaseCloud;

let cloudSessionPromise = null;
let currentCloudUserId = null;

async function ensureCloudSession() {
    if (!cloud) return null;
    if (cloudSessionPromise) return cloudSessionPromise;
    cloudSessionPromise = (async () => {
        const { data: sessionData, error: sessionError } = await cloud.auth.getSession();
        if (sessionError) throw sessionError;
        let session = sessionData.session;
        if (!session) {
            const { data, error } = await cloud.auth.signInAnonymously();
            if (error) throw error;
            session = data.session;
        }
        currentCloudUserId = session?.user?.id || null;
        if (currentCloudUserId) {
            userId = currentCloudUserId;
            safeStorage.setItem('wedding_user_id', currentCloudUserId);
        }
        return session;
    })().catch(error => {
        console.warn('Supabase 匿名登录失败，将使用本地模式：', error);
        cloudSessionPromise = null;
        return null;
    });
    return cloudSessionPromise;
}

function cloudStatusText(text, state = '') {
    const status = document.getElementById('inviteCloudStatus');
    if (!status) return;
    status.textContent = text;
    status.dataset.state = state;
}

function getInviteeName() {
    return (document.getElementById('inviteeInput')?.value || safeStorage.getItem('top_invitee_name') || '').trim();
}

async function saveInviteeNameToCloud(rawName) {
    const name = String(rawName || '').trim().slice(0, 12);
    safeStorage.setItem('top_invitee_name', name);
    if (!name) {
        cloudStatusText('请填写昵称后再进入心选页面', 'warning');
        return false;
    }
    if (!cloud) {
        cloudStatusText('当前为本地预览，配置 Supabase 后可多人共享', 'local');
        return true;
    }
    cloudStatusText('正在同步昵称…', 'syncing');
    const session = await ensureCloudSession();
    if (!session || !currentCloudUserId) {
        cloudStatusText('云端连接失败，已保存在本机', 'warning');
        return false;
    }
    const payload = { user_id: currentCloudUserId, username: name, updated_at: new Date().toISOString() };
    const { error } = await cloud.from('wedding_guests').upsert(payload, { onConflict: 'user_id' });
    if (error) {
        console.warn('昵称同步失败：', error);
        cloudStatusText('同步失败，已保存在本机', 'warning');
        return false;
    }
    await cloud.from('heart_choices')
        .update({ username: name, updated_at: new Date().toISOString() })
        .eq('user_id', currentCloudUserId);
    cloudStatusText('已同步到婚礼星球 ✦', 'success');
    return true;
}

async function loadInviteeNameFromCloud() {
    if (!cloud) {
        cloudStatusText('当前为本地预览，配置 Supabase 后可多人共享', 'local');
        return;
    }
    const session = await ensureCloudSession();
    if (!session || !currentCloudUserId) return;
    const { data, error } = await cloud.from('wedding_guests')
        .select('username')
        .eq('user_id', currentCloudUserId)
        .maybeSingle();
    if (error) {
        console.warn('读取云端昵称失败：', error);
        cloudStatusText('云端昵称读取失败，继续使用本地昵称', 'warning');
        return;
    }
    if (data?.username) {
        const input = document.getElementById('inviteeInput');
        if (input) input.value = data.username;
        safeStorage.setItem('top_invitee_name', data.username);
    }
    cloudStatusText('已连接婚礼星球 ✦', 'success');
}

async function initCloudSync() {
    await loadInviteeNameFromCloud();
}


// ========== 成员数据 ==========
const members = [
    { id: 0, key: 'zzx', name: '朱志鑫', image: 'zzx.jpg', color: '#FFD700', color2: '#FFA500' },
    { id: 1, key: 'zzy', name: '张泽禹', image: 'zzy.jpg', color: '#32CD32', color2: '#228B22' },
    { id: 2, key: 'zj', name: '张极', image: 'zj.jpg', color: '#FF8C00', color2: '#FF6347' },
    { id: 3, key: 'zh', name: '左航', image: 'zh.jpg', color: '#1E90FF', color2: '#4169E1' },
    { id: 4, key: 'sxh', name: '苏新皓', image: 'sxh.jpg', color: '#DC143C', color2: '#B22222' }
];

// ========== 回忆墙文案 ==========
const memoryTexts = [
    '从初次相遇的青涩到如今并肩的模样，六百日星光相伴，五个少年紧紧相依。用心拼凑出专属彼此的圆满，往后无数个朝夕，继续带着热爱并肩向前，奔赴更多闪闪发光的未来。',
    '车库灯光衬着一身白衣，五个少年肆意鲜活。每一次整齐的律动、默契的对视，都是藏在舞蹈里的热忱。汗水与热爱相伴，舞台之外同样耀眼，带着十足气场起舞，奔赴属于我们的热烈与星光。',
    '荣耀之夜并肩站上领奖台，五人同举奖杯，挥手迎接属于我们的荣光。舞台上全力以赴的每一刻都有了答案，汗水化作闪闪发光的勋章。往后继续携手前行，带着这份胜利的热烈，奔赴更多更高的顶峰。'
];

// 唯粉情话库
const fanWords = {
    0: ['朱志鑫，你是最耀眼的光！', '鑫光璀璨，只为你而来', '今天也在为朱志鑫心动💛', '朱志鑫往前走，我们在身后', '愿你永远闪闪发光'],
    1: ['张泽禹，你就是答案！', '禹你同行，岁岁年年', '张小宝永远是最棒的💚', '张泽禹的声音是天籁', '愿你被世界温柔以待'],
    2: ['张极，极刻心动！', '桔光万里，张极无敌🧡', '张极天生属于舞台', '你的笑容是最美的风景', '极尽全力奔向你'],
    3: ['左航，航向有你的未来！', '左饺子最帅最酷💙', '左航的rap永远的神', '愿你永远自由如风', '左航值得所有美好'],
    4: ['苏新皓，皓月当空！', '苏信号永远在舞台中央❤️', '苏新皓就是实力本身', '你的努力我们都看得见', '苏新皓未来可期']
};

// 应援口号库
const slogans = {
    0: ['志在必得，鑫光闪耀！', '朱志鑫，TOP！', '鑫光璀璨，王者归来'],
    1: ['张泽禹，最强主唱！', '禹你同行，不离不弃！', '泽被万物，禹众不同'],
    2: ['张极登场，全场沸腾！', '极光闪耀，万丈光芒！', '张极，天生偶像'],
    3: ['左航一出，谁与争锋！', '航向未来，永不止步！', '左航，实力rapper'],
    4: ['苏新皓，全能ACE！', '皓月千里，苏你最帅！', '新皓出征，寸草不生']
};

let selectedCards = [];
let ferrisController = null;
let suppressFerrisClick = false;
let groupUnlockedThisSession = false;
let groupCollectMode = false;

function readStoredGroupIds() {
    try {
        const value = JSON.parse(safeStorage.getItem('top_group_seen_ids') || '[]');
        return new Set(Array.isArray(value) ? value.map(Number).filter(Number.isInteger) : []);
    } catch (error) {
        return new Set();
    }
}

let groupSeenIds = readStoredGroupIds();

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initButterflies();
    initMusic();
    initFerrisWheelControls();
    initPhotoClicks();
    initGroupEgg();
    initSidebar();
    initMessageWall();       // 新增：留言墙
    initAlbum();             // 新增：相册回忆墙
    initTypingAnimation();   // 新增：开屏打字机
    initBanquetPage();
    initHeartPicker();
    loadSupabaseSdk().then(() => initCloudSync());

        // 新郎新娘切换 + hover 光晕
    document.querySelectorAll('.name-toggle').forEach(el => {
        el.style.cursor = 'pointer';
        el.dataset.isGroom = "true";
        const name = el.dataset.name;
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            const flag = this.dataset.isGroom === "true";
            this.dataset.isGroom = String(!flag);
            this.textContent = (flag ? '新娘' : '新郎') + name;
        });
    });

    // 开屏结束显示主页面
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('mainPage').classList.remove('hidden');
    }, 3000);

    // 首次点击播放音乐
    document.body.addEventListener('click', function firstClick() {
        const music = document.getElementById('bgMusic');
        if (music.paused) {
            music.play().catch(() => {});
            document.getElementById('musicBtn').classList.add('playing');
        }
        document.body.removeEventListener('click', firstClick);
    }, { once: true });
});

// ========== 星光粒子 ==========
function initParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's, ' + (Math.random() * 15) + 's';
        star.style.animationDuration = (2 + Math.random() * 3) + 's, ' + (10 + Math.random() * 10) + 's';
        const size = 2 + Math.random() * 3;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        container.appendChild(star);
    }
}

// ========== 蝴蝶 ==========
function initButterflies() {
    const container = document.getElementById('butterflies');
    for (let i = 0; i < 12; i++) {
        const bf = document.createElement('div');
        bf.className = 'butterfly';
        bf.textContent = '🦋';
        bf.style.left = Math.random() * 100 + '%';
        bf.style.top = (100 + Math.random() * 20) + '%';
        bf.style.fontSize = (16 + Math.random() * 16) + 'px';
        bf.style.animationDuration = (8 + Math.random() * 10) + 's';
        bf.style.animationDelay = Math.random() * 8 + 's';
        bf.style.opacity = 0.6 + Math.random() * 0.3;
        container.appendChild(bf);
    }
}

// ========== 音乐控制 ==========
function initMusic() {
    const btn = document.getElementById('musicBtn');
    const music = document.getElementById('bgMusic');
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (music.paused) {
            music.play();
            btn.textContent = '🔊';
            btn.classList.add('playing');
        } else {
            music.pause();
            btn.textContent = '🔇';
            btn.classList.remove('playing');
        }
    });
}

// ========== 照片点击交互 ==========
function initPhotoClicks() {
    const cards = document.querySelectorAll('.photo-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            if (suppressFerrisClick) return;
            const id = parseInt(this.dataset.id);
            const name = this.dataset.name;
            const color = this.dataset.color;
            
            const groupJustUnlocked = trackGroupClick(id);
            if (groupJustUnlocked) return;
            
            // 点同一张 → 取消选中恢复旋转
            if (selectedCards.length === 1 && selectedCards[0].id === id) {
                resumeWheel();
                clearSelection();
                hideFanBubble();
                return;
            }
            
            // 点第二张不同的 → CP模式
            if (selectedCards.length === 1) {
                const first = selectedCards[0];
                selectedCards.push({ id, name, color, card: this });
                triggerCPMode(first, { id, name, color, card: this });
                return;
            }
            
            // 选中第一张
            if (selectedCards.length === 0) {
                pauseWheel();
                this.classList.add('selected');
                selectedCards.push({ id, name, color, card: this });
                
                setTimeout(() => {
                    if (selectedCards.length === 1 && selectedCards[0].id === id) {
                        triggerFanMode(id, name, color, this);
                    }
                }, 350);
            }
        });
    });
    
    // 点击空白恢复
    document.getElementById('mainPage').addEventListener('click', function(e) {
        if (e.target.closest('.photo-card') || 
            e.target.closest('.fan-bubble') ||
            e.target.closest('.cp-modal') ||
            e.target.closest('.group-modal') ||
            e.target.closest('.checkin-modal') ||
            e.target.closest('.invite-sidebar') ||
            e.target.closest('button')) return;
        
        if (selectedCards.length > 0) {
            resumeWheel();
            clearSelection();
            hideFanBubble();
        }
    });
    
    document.getElementById('cpModal').addEventListener('click', closeCPMode);
}

function pauseWheel() {
    document.getElementById('ferrisWheel').classList.add('paused');
    ferrisController?.setSelectionPaused(true);
}
function resumeWheel() {
    document.getElementById('ferrisWheel').classList.remove('paused');
    ferrisController?.setSelectionPaused(false);
}

// ========== 摩天轮：自动旋转，同时支持用户手动拖动 ==========
function initFerrisWheelControls() {
    const container = document.querySelector('.ferris-container');
    const wheel = document.getElementById('ferrisWheel');
    if (!container || !wheel) return;

    let angle = Number(safeStorage.getItem('top_wheel_angle') || 0);
    let selectionPaused = false;
    let dragging = false;
    let pointerId = null;
    let lastX = 0;
    let lastMoveAt = 0;
    let dragDistance = 0;
    let inertia = 0;
    let lastFrameAt = performance.now();
    let saveTimer = null;

    const render = () => {
        wheel.style.transform = `rotateY(${angle}deg)`;
    };

    const saveStateSoon = () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            safeStorage.setItem('top_wheel_angle', String(Math.round(angle * 100) / 100));
        }, 180);
    };

    const endPointer = event => {
        if (!dragging || (pointerId !== null && event.pointerId !== pointerId)) return;
        dragging = false;
        container.classList.remove('dragging');
        try { container.releasePointerCapture(pointerId); } catch (_) {}
        pointerId = null;
        if (dragDistance > 7) {
            suppressFerrisClick = true;
            setTimeout(() => { suppressFerrisClick = false; }, 160);
        }
        saveStateSoon();
    };

    container.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        dragging = true;
        pointerId = event.pointerId;
        lastX = event.clientX;
        lastMoveAt = performance.now();
        dragDistance = 0;
        inertia = 0;
        container.classList.add('dragging');
        try { container.setPointerCapture(pointerId); } catch (_) {}
    });

    container.addEventListener('pointermove', event => {
        if (!dragging || event.pointerId !== pointerId) return;
        const now = performance.now();
        const dx = event.clientX - lastX;
        const dt = Math.max(8, now - lastMoveAt);
        dragDistance += Math.abs(dx);
        angle += dx * 0.48;
        inertia = (dx * 0.48) / dt;
        lastX = event.clientX;
        lastMoveAt = now;
        render();
    });

    container.addEventListener('pointerup', endPointer);
    container.addEventListener('pointercancel', endPointer);
    container.addEventListener('lostpointercapture', endPointer);

    container.addEventListener('wheel', event => {
        if (Math.abs(event.deltaX) < Math.abs(event.deltaY) && !event.shiftKey) return;
        event.preventDefault();
        angle -= (event.deltaX || event.deltaY) * 0.18;
        inertia = 0;
        render();
        saveStateSoon();
    }, { passive: false });

    function tick(now) {
        const dt = Math.min(48, now - lastFrameAt);
        lastFrameAt = now;
        if (!dragging && !selectionPaused) {
            if (Math.abs(inertia) > 0.0008) {
                angle += inertia * dt;
                inertia *= Math.pow(0.91, dt / 16.67);
            } else {
                angle += 0.012 * dt;
            }
            render();
        }
        requestAnimationFrame(tick);
    }

    ferrisController = {
        setSelectionPaused(value) { selectionPaused = Boolean(value); }
    };

    render();
    requestAnimationFrame(tick);
}
function clearSelection() {
    document.querySelectorAll('.photo-card').forEach(c => c.classList.remove('selected'));
    selectedCards = [];
}
function hideFanBubble() {
    document.getElementById('fanBubble').classList.add('hidden');
}

// ========== 唯粉模式 ==========
function triggerFanMode(id, name, color, card) {
    const mode = Math.floor(Math.random() * 3);
    
    if (mode === 0) {
        const words = fanWords[id];
        showFanBubble(words[Math.floor(Math.random() * words.length)]);
    } else if (mode === 1) {
        const slogan = slogans[id];
        showFanBubble('📣 ' + slogan[Math.floor(Math.random() * slogan.length)]);
    } else {
        burstHearts(card, color);
    }
}

function showFanBubble(text) {
    const bubble = document.getElementById('fanBubble');
    document.getElementById('fanText').textContent = text;
    bubble.classList.remove('hidden');
    bubble.style.animation = 'none';
    bubble.offsetHeight;
    bubble.style.animation = '';
    
    clearTimeout(showFanBubble.timer);
    showFanBubble.timer = setTimeout(() => bubble.classList.add('hidden'), 3000);
}

function burstHearts(card, color) {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const container = document.createElement('div');
    container.className = 'heart-burst';
    container.style.left = centerX + 'px';
    container.style.top = centerY + 'px';
    document.body.appendChild(container);
    
    for (let i = 0; i < 15; i++) {
        const heart = document.createElement('div');
        heart.className = 'flying-heart';
        heart.textContent = '❤️';
        const angle = (Math.PI * 2 / 15) * i + Math.random() * 0.5;
        const distance = 80 + Math.random() * 100;
        heart.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        heart.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        heart.style.animationDelay = Math.random() * 0.3 + 's';
        container.appendChild(heart);
    }
    setTimeout(() => container.remove(), 2500);
}

// ========== CP模式 ==========
function triggerCPMode(first, second) {
    const leftEl = document.getElementById('cpLeft');
    const rightEl = document.getElementById('cpRight');
    const nameplate = document.getElementById('cpNameplate');
    
    leftEl.style.background = `linear-gradient(135deg, ${first.color}, ${members[first.id].color2})`;
    rightEl.style.background = `linear-gradient(135deg, ${second.color}, ${members[second.id].color2})`;
    
    const firstImg = first.card.querySelector('img');
    const secondImg = second.card.querySelector('img');
    if (firstImg && firstImg.src && firstImg.style.display !== 'none') {
        leftEl.style.backgroundImage = `url(${firstImg.src})`;
        leftEl.style.backgroundSize = 'cover';
        leftEl.style.backgroundPosition = 'center';
    }
    if (secondImg && secondImg.src && secondImg.style.display !== 'none') {
        rightEl.style.backgroundImage = `url(${secondImg.src})`;
        rightEl.style.backgroundSize = 'cover';
        rightEl.style.backgroundPosition = 'center';
    }
    
    nameplate.textContent = `${first.name} & ${second.name}`;
    nameplate.style.background = `linear-gradient(90deg, ${first.color}, ${second.color})`;
    
    document.getElementById('cpModal').classList.remove('hidden');
    setTimeout(() => triggerFlash(), 600);
    spawnPetals(first.color, second.color);
    
    clearTimeout(triggerCPMode.timer);
    triggerCPMode.timer = setTimeout(closeCPMode, 2500);
}

function closeCPMode() {
    document.getElementById('cpModal').classList.add('hidden');
    clearSelection();
    resumeWheel();
    document.getElementById('cpPetals').innerHTML = '';
}

function triggerFlash() {
    const flash = document.getElementById('flashLayer');
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 100);
}

function spawnPetals() {
    const container = document.getElementById('cpPetals');
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        petal.textContent = Math.random() > 0.5 ? '🌸' : '💮';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (2 + Math.random() * 2) + 's';
        petal.style.animationDelay = Math.random() * 1.5 + 's';
        petal.style.fontSize = (14 + Math.random() * 10) + 'px';
        container.appendChild(petal);
    }
}

// ========== 请柬侧边栏 ==========
function initSidebar() {
    const sidebar = document.getElementById('inviteSidebar');
    const inviteeInput = document.getElementById('inviteeInput');
    let saveTimer = null;

    document.getElementById('inviteBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });
    document.getElementById('inviteClose').addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.remove('open');
        saveInviteeNameToCloud(inviteeInput.value);
    });

    const saved = safeStorage.getItem('top_invitee_name');
    if (saved) inviteeInput.value = saved;
    inviteeInput.addEventListener('input', function() {
        safeStorage.setItem('top_invitee_name', this.value);
        cloudStatusText('昵称尚未同步', 'syncing');
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => saveInviteeNameToCloud(this.value), 650);
    });
    inviteeInput.addEventListener('blur', () => saveInviteeNameToCloud(inviteeInput.value));
}

// ========== 开屏打字机动画 ==========
function initTypingAnimation() {
    const text = '欢迎来到我们的婚礼星球';
    const target = document.getElementById('typingText');
    let i = 0;
    // 延迟 1 秒后开始打字，配合弧形文字出现
    setTimeout(function type() {
        if (i < text.length) {
            target.textContent += text.charAt(i);
            i++;
            setTimeout(type, 160);
        }
    }, 1000);
}

// ========== 留言墙 ==========
function initMessageWall() {
    const btn = document.getElementById('messageBtn');
    const modal = document.getElementById('messageModal');
    const input = document.getElementById('messageInput');
    const countEl = document.getElementById('msgCount');
    const cancelBtn = document.getElementById('msgCancel');
    const submitBtn = document.getElementById('msgSubmit');
    const floatContainer = document.getElementById('floatingMessages');

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.remove('hidden');
        input.value = '';
        countEl.textContent = '0';
        setTimeout(() => input.focus(), 100);
    });

    // 字数统计
    input.addEventListener('input', function() {
        countEl.textContent = this.value.length;
    });

    // 取消
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.add('hidden');
    });

    // 提交
    submitBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const msg = input.value.trim();
        if (!msg) {
            input.focus();
            return;
        }
        spawnFloatingMessage(msg);
        modal.classList.add('hidden');
    });

    // 点击遮罩关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

function spawnFloatingMessage(text) {
    const container = document.getElementById('floatingMessages');
    const msg = document.createElement('div');
    msg.className = 'float-msg';
    msg.textContent = text;
    // 随机水平位置（左右两侧区域，避开中间摩天轮）
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const baseX = side === 'left' ? 5 + Math.random() * 20 : 75 + Math.random() * 20;
    msg.style.left = baseX + '%';
    // 随机颜色（五个应援色）
    const colors = ['#FFD700', '#32CD32', '#FF8C00', '#1E90FF', '#DC143C'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    msg.style.color = color;
    msg.style.animationDuration = (7 + Math.random() * 3) + 's';
    // 随机字号
    msg.style.fontSize = (13 + Math.random() * 4) + 'px';
    container.appendChild(msg);
    setTimeout(() => msg.remove(), 10000);
}

// ========== 相册回忆墙（修改：移除大图查看，切换自动显示文案） ==========
let currentAlbumIndex = 0;
const totalAlbums = 3;
let albumAutoTimer = null;

function initAlbum() {
    const btn = document.getElementById('albumBtn');
    const modal = document.getElementById('albumModal');
    const closeBtn = document.getElementById('albumClose');
    const prevBtn = document.getElementById('albumPrev');
    const nextBtn = document.getElementById('albumNext');
    const track = document.getElementById('albumTrack');
    const dots = document.querySelectorAll('#albumDots .dot');
    const slides = document.querySelectorAll('.album-slide');
    const captions = document.querySelectorAll('.slide-caption');

    // 打开相册
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.remove('hidden');
        fillCurrentCaption();
        startAlbumAutoPlay();
    });

    // 关闭相册
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeAlbum();
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeAlbum();
    });

    // 左右切换
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        prevAlbum();
        resetAlbumTimer();
    });

    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        nextAlbum();
        resetAlbumTimer();
    });

    // 指示点切换
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            goToAlbum(idx);
            resetAlbumTimer();
        });
    });

    // 滑动手势
    initAlbumSwipe(track);
}

// 填充当前幻灯片文案
function fillCurrentCaption() {
    const captions = document.querySelectorAll('.slide-caption');
    captions.forEach((cap, idx) => {
        cap.textContent = memoryTexts[idx];
    });
}

function closeAlbum() {
    document.getElementById('albumModal').classList.add('hidden');
    stopAlbumAutoPlay();
}

function updateAlbumDisplay() {
    const track = document.getElementById('albumTrack');
    const dots = document.querySelectorAll('#albumDots .dot');
    track.style.transform = `translateX(-${currentAlbumIndex * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === currentAlbumIndex));
}

function nextAlbum() {
    currentAlbumIndex = (currentAlbumIndex + 1) % totalAlbums;
    updateAlbumDisplay();
}

function prevAlbum() {
    currentAlbumIndex = (currentAlbumIndex - 1 + totalAlbums) % totalAlbums;
    updateAlbumDisplay();
}

function goToAlbum(idx) {
    currentAlbumIndex = idx;
    updateAlbumDisplay();
}

function startAlbumAutoPlay() {
    stopAlbumAutoPlay();
    albumAutoTimer = setInterval(nextAlbum, 3500);
}

function stopAlbumAutoPlay() {
    if (albumAutoTimer) {
        clearInterval(albumAutoTimer);
        albumAutoTimer = null;
    }
}

function resetAlbumTimer() {
    startAlbumAutoPlay();
}

// 触屏滑动
function initAlbumSwipe(track) {
    let startX = 0;
    let moveX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAlbumAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        moveX = e.touches[0].clientX - startX;
    }, { passive: true });

    track.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(moveX) > 50) {
            if (moveX > 0) prevAlbum();
            else nextAlbum();
        }
        moveX = 0;
        startAlbumAutoPlay();
    });
}

// ========== 五人同框彩蛋：点击五位成员后自动解锁 ==========
function initGroupEgg() {
    const button = document.getElementById('groupEggBtn');
    const modal = document.getElementById('groupModal');
    const closeBtn = document.getElementById('groupClose');
    if (!button || !modal) return;

    updateGroupProgress();

    button.addEventListener('click', event => {
        event.stopPropagation();
        const unlocked = groupSeenIds.size >= members.length || safeStorage.getItem('top_group_unlocked') === '1';
        if (unlocked) {
            triggerGroupMode();
            return;
        }

        const remaining = Math.max(0, members.length - groupSeenIds.size);
        showFanBubble(`彩蛋还在准备中～还差 ${remaining} 位成员，点亮摩天轮里的五张照片后就能开启啦 ✨`);
    });

    closeBtn?.addEventListener('click', event => {
        event.stopPropagation();
        closeGroupMode();
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) closeGroupMode();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeGroupMode();
    });
}

function updateGroupProgress() {
    const button = document.getElementById('groupEggBtn');
    const unlocked = groupSeenIds.size >= members.length || safeStorage.getItem('top_group_unlocked') === '1';
    button?.classList.toggle('unlocked', unlocked);
    if (button) {
        const remaining = Math.max(0, members.length - groupSeenIds.size);
        button.textContent = '彩蛋';
        button.setAttribute('aria-label', unlocked ? '打开彩蛋' : `彩蛋尚未解锁，还差${remaining}位成员`);
        button.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
        button.title = unlocked ? '打开彩蛋' : `还差 ${remaining} 位成员即可解锁`;
    }
}

function trackGroupClick(id) {
    if (!groupSeenIds.has(id)) {
        groupSeenIds.add(id);
        safeStorage.setItem('top_group_seen_ids', JSON.stringify([...groupSeenIds]));
        updateGroupProgress();
    }

    if (groupSeenIds.size >= members.length && safeStorage.getItem('top_group_unlocked') !== '1') {
        safeStorage.setItem('top_group_unlocked', '1');
        groupUnlockedThisSession = true;
        updateGroupProgress();
        clearSelection();
        setTimeout(triggerGroupMode, 280);
        return true;
    }
    return false;
}

function triggerGroupMode() {
    const modal = document.getElementById('groupModal');
    if (!modal) return;
    clearSelection();
    hideFanBubble();
    pauseWheel();
    modal.classList.remove('hidden');
    spawnFireworks();
}

function closeGroupMode() {
    document.getElementById('groupModal')?.classList.add('hidden');
    clearSelection();
    resumeWheel();
}

function spawnFireworks() {
    const container = document.getElementById('fireworks');
    if (!container) return;
    container.innerHTML = '';
    for (let b = 0; b < 6; b++) {
        setTimeout(() => {
            const cx = 14 + Math.random() * 72;
            const cy = 15 + Math.random() * 55;
            const color = members[b % members.length].color;
            for (let i = 0; i < 22; i++) {
                const particle = document.createElement('div');
                particle.className = 'firework';
                particle.style.left = cx + '%';
                particle.style.top = cy + '%';
                particle.style.background = color;
                particle.style.boxShadow = `0 0 7px ${color}`;
                const angle = (Math.PI * 2 / 22) * i;
                const distance = 58 + Math.random() * 72;
                particle.style.setProperty('--fx', Math.cos(angle) * distance + 'px');
                particle.style.setProperty('--fy', Math.sin(angle) * distance + 'px');
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 1900);
            }
        }, b * 310);
    }
}

// ====================== 婚宴席位页面逻辑｜Supabase 云端座位 ======================
const TABLE_IDS = ['left1', 'left2', 'left3', 'right1', 'right2', 'right3'];

const tableEmojiMap = {
    left1: "🦋",
    left2: "🐱",
    left3: "🐷",
    right1: "🐶",
    right2: "😺",
    right3: "🐰"
};

let userId = safeStorage.getItem("wedding_user_id");
if (!userId) {
    userId = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    safeStorage.setItem("wedding_user_id", userId);
}

let seatData = null;
let pendingSeat = null;
let entranceAnimation = null;
let entranceFinishTimer = null;
let resizeSeatTimer = null;

function createEmptySeatData() {
    return { seats: Object.fromEntries(TABLE_IDS.map(id => [id, Array(8).fill(null)])) };
}

function normalizeSeatData(data) {
    const normalized = data && typeof data === 'object' ? data : createEmptySeatData();
    if (!normalized.seats || typeof normalized.seats !== 'object') normalized.seats = {};
    TABLE_IDS.forEach(id => {
        const source = Array.isArray(normalized.seats[id]) ? normalized.seats[id].slice(0, 8) : [];
        while (source.length < 8) source.push(null);
        normalized.seats[id] = source;
    });
    return normalized;
}

async function loadRemoteSeat({ silent = false } = {}) {
    if (!cloud) {
        try {
            seatData = normalizeSeatData(JSON.parse(safeStorage.getItem('localSeatBackup') || 'null'));
        } catch (_) {
            seatData = createEmptySeatData();
        }
        renderAllSeat();
        if (!silent) showTip('当前为本地预览，配置 Supabase 后可共享座位');
        return false;
    }
    try {
        const session = await ensureCloudSession();
        if (!session) throw new Error('未建立匿名会话');
        const { data, error } = await cloud.from('banquet_seats')
            .select('table_id,seat_index,user_id');
        if (error) throw error;
        seatData = createEmptySeatData();
        (data || []).forEach(row => {
            if (TABLE_IDS.includes(row.table_id) && Number.isInteger(row.seat_index)
                && row.seat_index >= 0 && row.seat_index < 8) {
                seatData.seats[row.table_id][row.seat_index] = row.user_id;
            }
        });
        safeStorage.setItem('localSeatBackup', JSON.stringify(seatData));
        renderAllSeat();
        return true;
    } catch (error) {
        console.warn('云端座位读取失败，启用本地缓存：', error);
        try {
            seatData = normalizeSeatData(JSON.parse(safeStorage.getItem('localSeatBackup') || 'null'));
        } catch (_) {
            seatData = createEmptySeatData();
        }
        renderAllSeat();
        if (!silent) showTip('网络异常，当前显示本地座位缓存');
        return false;
    }
}

async function claimRemoteSeat(tableId, seatIndex) {
    if (!cloud) {
        seatData = normalizeSeatData(seatData);
        if (seatData.seats[tableId][seatIndex] !== null) return { ok: false, message: 'occupied' };
        TABLE_IDS.forEach(id => {
            seatData.seats[id] = seatData.seats[id].map(value => value === userId ? null : value);
        });
        seatData.seats[tableId][seatIndex] = userId;
        safeStorage.setItem('localSeatBackup', JSON.stringify(seatData));
        return { ok: true, local: true };
    }
    const session = await ensureCloudSession();
    if (!session) return { ok: false, message: 'offline' };
    const { data, error } = await cloud.rpc('claim_banquet_seat', {
        p_table_id: tableId,
        p_seat_index: seatIndex
    });
    if (error) {
        console.warn('落座失败：', error);
        return { ok: false, message: error.message };
    }
    return data || { ok: false };
}

async function releaseRemoteSeat(tableId, seatIndex) {
    if (!cloud) {
        seatData = normalizeSeatData(seatData);
        if (seatData.seats[tableId][seatIndex] === userId) {
            seatData.seats[tableId][seatIndex] = null;
            safeStorage.setItem('localSeatBackup', JSON.stringify(seatData));
            return { ok: true, local: true };
        }
        return { ok: false };
    }
    const session = await ensureCloudSession();
    if (!session) return { ok: false, message: 'offline' };
    const { data, error } = await cloud.rpc('release_banquet_seat');
    if (error) return { ok: false, message: error.message };
    return data || { ok: true };
}

function initBanquetPage() {
    const seatBtn = document.getElementById("seatBtn");
    const banquetPage = document.getElementById("banquetPage");
    const backBtn = document.getElementById("banquetBackBtn");
    const refreshBtn = document.getElementById("refreshSeatBtn");
    const confirmModal = document.getElementById("seatConfirmModal");
    const tipModal = document.getElementById("tipModal");
    const confirmCancel = confirmModal.querySelector(".confirm-cancel");
    const confirmOk = confirmModal.querySelector(".confirm-ok");
    const tipOk = tipModal.querySelector(".tip-ok");

    document.querySelectorAll(".round-table").forEach(table => {
        const ring = table.querySelector(".seats-ring");
        if (ring.children.length) return;
        const tableId = table.dataset.table;
        for (let index = 0; index < 8; index++) {
            const seat = document.createElement("button");
            seat.type = 'button';
            seat.className = "seat";
            seat.dataset.table = tableId;
            seat.dataset.seatIdx = String(index);
            seat.setAttribute('aria-label', `${tableId} 第${index + 1}号座位`);
            ring.appendChild(seat);

            seat.addEventListener("click", async event => {
                event.stopPropagation();
                const tid = seat.dataset.table;
                const sid = Number(seat.dataset.seatIdx);
                await loadRemoteSeat({ silent: true });
                if (!seatData?.seats) return;
                const occupier = seatData.seats[tid][sid];
                if (occupier !== null) {
                    showTip(occupier === userId ? "这是你当前的座位，长按可释放" : "该座位已被其他人占用");
                    return;
                }
                pendingSeat = { tableId: tid, seatIndex: sid };
                openConfirm();
            });

            let longPressTimer = null;
            let longPressTriggered = false;
            const cancelLongPress = () => {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            };
            seat.addEventListener('pointerdown', () => {
                longPressTriggered = false;
                longPressTimer = setTimeout(async () => {
                    const tid = seat.dataset.table;
                    const sid = Number(seat.dataset.seatIdx);
                    if (seatData?.seats?.[tid]?.[sid] === userId) {
                        longPressTriggered = true;
                        const result = await releaseRemoteSeat(tid, sid);
                        await loadRemoteSeat({ silent: true });
                        showTip(result.ok ? "已释放你的座位" : "座位释放失败，请稍后重试");
                    }
                }, 720);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => seat.addEventListener(type, cancelLongPress));
            seat.addEventListener('contextmenu', event => event.preventDefault());
        }
    });

    seatBtn.addEventListener("click", async event => {
        event.stopPropagation();
        banquetPage.classList.remove("hidden");
        resetEntrance();
        requestAnimationFrame(() => {
            layoutSeatRings();
            startWalkAnimation();
        });
        await loadRemoteSeat({ silent: true });
    });

    backBtn.addEventListener("click", () => {
        banquetPage.classList.add("hidden");
        resetEntrance();
    });

    refreshBtn.addEventListener("click", async () => {
        const success = await loadRemoteSeat({ silent: true });
        showTip(success ? "座位已刷新" : "刷新失败，已显示本地缓存");
    });

    document.querySelectorAll(".stage-emoji").forEach(emoji => {
        emoji.addEventListener("click", event => createClickEffect(event.clientX, event.clientY, "✨"));
    });

    confirmOk.onclick = async () => {
        if (!pendingSeat) return;
        const { tableId, seatIndex } = pendingSeat;
        confirmOk.disabled = true;
        const result = await claimRemoteSeat(tableId, seatIndex);
        await loadRemoteSeat({ silent: true });
        confirmOk.disabled = false;
        confirmModal.classList.add("hidden");
        pendingSeat = null;
        if (result.ok) {
            showTip(`落座成功！欢迎来到${tableDisplayName(tableId)}`);
        } else if (result.message === 'occupied') {
            showTip("座位刚刚被其他人占用，请重新选择");
        } else {
            showTip("云端落座失败，请检查网络后重试");
        }
    };

    confirmCancel.onclick = () => {
        confirmModal.classList.add("hidden");
        pendingSeat = null;
    };
    tipOk.onclick = () => tipModal.classList.add("hidden");
    confirmModal.addEventListener('click', event => {
        if (event.target === confirmModal) confirmCancel.click();
    });
    tipModal.addEventListener('click', event => {
        if (event.target === tipModal) tipModal.classList.add('hidden');
    });

    window.addEventListener('resize', () => {
        clearTimeout(resizeSeatTimer);
        resizeSeatTimer = setTimeout(layoutSeatRings, 100);
    });
}

function tableDisplayName(tableId) {
    return ({ left1: '福来方亲友席', left2: '棍方亲友席', left3: '极方亲友席', right1: '宝方亲友席', right2: '航方亲友席', right3: '铲方亲友席' })[tableId] || '婚宴席';
}

function layoutSeatRings() {
    document.querySelectorAll('.seats-ring').forEach(ring => {
        const seats = [...ring.querySelectorAll('.seat')];
        const rect = ring.getBoundingClientRect();
        if (!seats.length || rect.width < 20 || rect.height < 20) return;
        const seatSize = seats[0].getBoundingClientRect().width || 24;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) / 2 + seatSize * 0.5 + 10;
        seats.forEach((seat, index) => {
            const angle = -Math.PI / 2 + (Math.PI * 2 / seats.length) * index;
            seat.style.left = `${centerX + Math.cos(angle) * radius}px`;
            seat.style.top = `${centerY + Math.sin(angle) * radius}px`;
        });
    });
}

function openConfirm() {
    document.getElementById("seatConfirmModal").classList.remove("hidden");
}

function showTip(text) {
    const tipText = document.getElementById("tipText");
    const modal = document.getElementById("tipModal");
    if (!tipText || !modal) return;
    tipText.textContent = text;
    modal.classList.remove("hidden");
}

function resetEntrance() {
    clearTimeout(entranceFinishTimer);
    entranceAnimation?.cancel();
    entranceAnimation = null;
    const walkGroup = document.getElementById("walkMemberGroup");
    const stageGroup = document.getElementById("stageMemberGroup");
    const status = document.getElementById('entranceStatus');
    if (!walkGroup || !stageGroup) return;
    walkGroup.style.display = "flex";
    walkGroup.style.opacity = '1';
    walkGroup.style.transform = 'translateX(-50%)';
    walkGroup.classList.remove('is-walking');
    stageGroup.classList.add("hidden");
    if (status) status.textContent = '五位新人正在入场';
}

function startWalkAnimation() {
    const walkGroup = document.getElementById("walkMemberGroup");
    const stageGroup = document.getElementById("stageMemberGroup");
    const stage = document.querySelector('.wedding-stage');
    const status = document.getElementById('entranceStatus');
    if (!walkGroup || !stageGroup || !stage) return;

    const finish = () => {
        walkGroup.classList.remove('is-walking');
        walkGroup.style.display = 'none';
        stageGroup.classList.remove('hidden');
        if (status) status.textContent = '欢迎五位新人登上婚礼舞台';
        scatterStagePetals();
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof walkGroup.animate !== 'function') {
        entranceFinishTimer = setTimeout(finish, reduceMotion ? 350 : 4000);
        return;
    }

    const groupRect = walkGroup.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const targetCenterY = stageRect.bottom - Math.min(48, stageRect.height * 0.22);
    const startCenterY = groupRect.top + groupRect.height / 2;
    const dy = targetCenterY - startCenterY;
    walkGroup.classList.add('is-walking');

    entranceAnimation = walkGroup.animate([
        { transform: 'translateX(-50%) translateY(28px) scale(.9)', opacity: 0, offset: 0 },
        { transform: `translateX(-50%) translateY(${dy * .08}px) scale(.94)`, opacity: 1, offset: .1 },
        { transform: `translateX(calc(-50% - 9px)) translateY(${dy * .34}px) rotate(-1.5deg)`, opacity: 1, offset: .34 },
        { transform: `translateX(calc(-50% + 8px)) translateY(${dy * .62}px) rotate(1.5deg)`, opacity: 1, offset: .62 },
        { transform: `translateX(calc(-50% - 4px)) translateY(${dy * .84}px)`, opacity: 1, offset: .84 },
        { transform: `translateX(-50%) translateY(${dy}px) scale(1.04)`, opacity: 1, offset: 1 }
    ], {
        duration: 4000,
        easing: 'cubic-bezier(.22,.72,.22,1)',
        fill: 'forwards'
    });
    entranceAnimation.onfinish = finish;
    entranceAnimation.oncancel = () => walkGroup.classList.remove('is-walking');
}

function scatterStagePetals() {
    const container = document.getElementById('stagePetals');
    if (!container) return;
    container.innerHTML = '';
    const icons = ['🌸', '✨', '💜', '💮'];
    for (let index = 0; index < 24; index++) {
        const petal = document.createElement('span');
        petal.className = 'stage-petal';
        petal.textContent = icons[index % icons.length];
        petal.style.left = `${8 + Math.random() * 84}%`;
        petal.style.fontSize = `${12 + Math.random() * 10}px`;
        petal.style.setProperty('--petal-x', `${-35 + Math.random() * 70}px`);
        petal.style.animationDelay = `${Math.random() * .7}s`;
        container.appendChild(petal);
        setTimeout(() => petal.remove(), 3700);
    }
}

function renderAllSeat() {
    seatData = normalizeSeatData(seatData);
    document.querySelectorAll(".seat").forEach(seat => {
        const tableId = seat.dataset.table;
        const seatIndex = Number(seat.dataset.seatIdx);
        const occupier = seatData.seats[tableId][seatIndex];
        const occupied = occupier !== null;
        seat.textContent = occupied ? tableEmojiMap[tableId] : "";
        seat.classList.toggle("occupied", occupied);
        seat.classList.toggle("own-seat", occupier === userId);
        seat.setAttribute('aria-label', occupied
            ? (occupier === userId ? `${tableDisplayName(tableId)}第${seatIndex + 1}号，你的座位` : `${tableDisplayName(tableId)}第${seatIndex + 1}号，已占用`)
            : `${tableDisplayName(tableId)}第${seatIndex + 1}号，空位`);
    });
    requestAnimationFrame(layoutSeatRings);
}

function createClickEffect(x, y, text) {
    const container = document.querySelector(".click-effect-container");
    if (!container) return;
    const element = document.createElement("div");
    element.className = "click-effect";
    element.textContent = text;
    element.style.left = x + "px";
    element.style.top = y + "px";
    container.appendChild(element);
    setTimeout(() => element.remove(), 700);
}


// ====================== 心选之人页面 ======================
const HEART_CATEGORIES = [
    { key: 'parents', title: '你的父母是', roles: ['爸爸', '妈妈'] },
    { key: 'daughter', title: '你的女儿是', roles: ['女儿'] },
    { key: 'son', title: '你的儿子是', roles: ['儿子'] },
    { key: 'wife', title: '你的老婆是', roles: ['老婆'] },
    { key: 'husband', title: '你的老公是', roles: ['老公'] }
];
const RELATION_ORDER = ['爸爸', '妈妈', '女儿', '儿子', '老婆', '老公'];
let activeHeartCategory = null;
let heartSlotsState = [];
let completedHeartRoles = new Set();
let lastHeartCategoryKey = safeStorage.getItem('last_heart_category') || '';
let relationScrollTimers = [];

function initHeartPicker() {
    const openBtn = document.getElementById('heartPickBtn');
    const backBtn = document.getElementById('heartBackBtn');
    const nextBtn = document.getElementById('heartNextRoleBtn');
    const heartPage = document.getElementById('heartPage');
    const mainPage = document.getElementById('mainPage');

    openBtn.addEventListener('click', async event => {
        event.stopPropagation();
        const name = getInviteeName();
        if (!name) {
            document.getElementById('inviteSidebar').classList.add('open');
            document.getElementById('inviteeInput').focus();
            cloudStatusText('请先填写昵称，再来开启命运轮盘 ✦', 'warning');
            return;
        }
        await saveInviteeNameToCloud(name);
        await loadCompletedHeartRoles();
        mainPage.classList.add('hidden');
        heartPage.classList.remove('hidden');
        startNewHeartRound();
    });

    backBtn.addEventListener('click', () => {
        clearRelationScrollTimers();
        heartPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
    });
    nextBtn.addEventListener('click', () => startNewHeartRound());

    document.getElementById('heartCategoryTabs').addEventListener('click', event => {
        const button = event.target.closest('button[data-heart-category]');
        if (!button) return;
        startNewHeartRound(button.dataset.heartCategory);
    });

    document.getElementById('heartSlots').addEventListener('click', event => {
        const button = event.target.closest('button[data-heart-action]');
        if (!button) return;
        const index = Number(button.closest('[data-heart-slot]')?.dataset.heartSlot);
        if (!Number.isInteger(index)) return;
        const action = button.dataset.heartAction;
        if (action === 'spin') spinHeartSlot(index);
        if (action === 'satisfy') satisfyHeartSlot(index);
        if (action === 'reject') rejectHeartSlot(index);
        if (action === 'unlock') unlockHeartSlot(index);
        if (action === 'reset') resetHeartHistory(index);
    });
}

async function loadCompletedHeartRoles() {
    const activeUserId = currentCloudUserId || userId;
    let rows = [];
    if (cloud) {
        const session = await ensureCloudSession();
        if (session && currentCloudUserId) {
            const { data, error } = await cloud.from('heart_choices')
                .select('relation_type')
                .eq('user_id', currentCloudUserId);
            if (!error) rows = data || [];
            else console.warn('读取已选身份失败：', error);
        }
    }
    if (!rows.length) {
        rows = readLocalHeartChoices().filter(item => item.user_id === activeUserId);
    }
    completedHeartRoles = new Set(rows.map(item => item.relation_type));
    renderHeartCategoryTabs();
}

function chooseHeartCategory() {
    const unfinished = HEART_CATEGORIES.filter(category =>
        category.roles.some(role => !completedHeartRoles.has(role))
        && category.key !== lastHeartCategoryKey
    );
    const pool = unfinished.length
        ? unfinished
        : HEART_CATEGORIES.filter(item => item.key !== lastHeartCategoryKey);
    return pool[Math.floor(Math.random() * pool.length)] || HEART_CATEGORIES[0];
}

function renderHeartCategoryTabs() {
    const container = document.getElementById('heartCategoryTabs');
    if (!container) return;
    container.innerHTML = HEART_CATEGORIES.map(category => {
        const complete = category.roles.every(role => completedHeartRoles.has(role));
        const active = activeHeartCategory?.key === category.key;
        return `<button type="button" data-heart-category="${category.key}" class="heart-category-tab ${active ? 'is-active' : ''} ${complete ? 'is-complete' : ''}">
            <span>${category.roles.join('＋')}</span>${complete ? '<b>✓</b>' : ''}
        </button>`;
    }).join('');
}

function startNewHeartRound(categoryKey = '') {
    clearRelationScrollTimers();
    activeHeartCategory = HEART_CATEGORIES.find(item => item.key === categoryKey) || chooseHeartCategory();
    lastHeartCategoryKey = activeHeartCategory.key;
    safeStorage.setItem('last_heart_category', lastHeartCategoryKey);
    heartSlotsState = activeHeartCategory.roles.map(role => ({
        role,
        history: new Set(),
        current: null,
        satisfied: false,
        rejected: false,
        spinning: false,
        exhausted: false
    }));
    document.getElementById('heartRoleTitle').textContent = activeHeartCategory.title;
    document.getElementById('heartResultPanel').classList.add('hidden');
    const nextButton = document.getElementById('heartNextRoleBtn');
    nextButton.classList.add('hidden');
    nextButton.textContent = completedHeartRoles.size >= RELATION_ORDER.length ? '继续改选其他身份' : '随机抽下一种身份';
    renderHeartCategoryTabs();
    document.getElementById('heartRoundTip').textContent = activeHeartCategory.roles.length === 2
        ? '爸爸和妈妈分别抽取；满意的一边会锁定，另一边可以继续重抽。'
        : '点击“开始”，照片会循环转动；不满意时再次开始，旧结果不会重复。';
    renderHeartSlots();
}

function renderHeartSlots() {
    const container = document.getElementById('heartSlots');
    container.classList.toggle('double', heartSlotsState.length === 2);
    container.innerHTML = heartSlotsState.map((slot, index) => {
        const member = slot.current;
        const status = slot.spinning ? '命运转动中…'
            : member ? member.name
            : '等待星光降落';
        const startLabel = slot.current ? '再次循环' : '开始';
        const decisionHidden = !slot.current || slot.spinning || slot.satisfied;
        const startDisabled = slot.spinning || slot.satisfied || slot.exhausted;
        return `
            <article class="destiny-slot ${slot.satisfied ? 'is-satisfied' : ''} ${slot.spinning ? 'is-spinning' : ''}" data-heart-slot="${index}">
                <div class="destiny-role"><span>你的</span><strong>${slot.role}</strong></div>
                <div class="destiny-window">
                    <div class="destiny-halo"></div>
                    ${member
                        ? `<img src="${member.image}" alt="${member.name}">`
                        : '<div class="destiny-placeholder">✦</div>'}
                    <div class="destiny-shine"></div>
                </div>
                <div class="destiny-name">${escapeHtml(status)}</div>
                <button class="destiny-start" data-heart-action="spin" type="button" ${startDisabled ? 'disabled' : ''}>${slot.spinning ? '转动中…' : startLabel}</button>
                <div class="destiny-decisions ${decisionHidden ? 'hidden' : ''}">
                    <button class="destiny-satisfy" data-heart-action="satisfy" type="button">满意</button>
                    <button class="destiny-reject" data-heart-action="reject" type="button">不满意</button>
                </div>
                ${slot.satisfied ? '<div class="destiny-locked">✓ 已满意 <button data-heart-action="unlock" type="button">改选</button></div>' : ''}
                ${slot.exhausted ? '<div class="destiny-exhausted">新的候选已经全部看过<br><button data-heart-action="reset" type="button">重新洗牌</button></div>' : ''}
            </article>`;
    }).join('');
}

function candidateMembersForSlot(index) {
    const slot = heartSlotsState[index];
    const otherCurrentIds = new Set(heartSlotsState
        .filter((_, otherIndex) => otherIndex !== index)
        .map(item => item.current?.id)
        .filter(Number.isInteger));
    return members.filter(member => !slot.history.has(member.id) && !otherCurrentIds.has(member.id));
}

function spinHeartSlot(index) {
    const slot = heartSlotsState[index];
    if (!slot || slot.spinning || slot.satisfied) return;
    let candidates = candidateMembersForSlot(index);
    if (!candidates.length) {
        slot.exhausted = true;
        renderHeartSlots();
        showHeartToast(`${slot.role}的新候选已经全部出现过啦`);
        return;
    }

    slot.spinning = true;
    slot.rejected = false;
    renderHeartSlots();
    const slotElement = document.querySelector(`[data-heart-slot="${index}"]`);
    const imageWindow = slotElement?.querySelector('.destiny-window');
    const nameElement = slotElement?.querySelector('.destiny-name');
    let frame = 0;
    const cycleTimer = setInterval(() => {
        candidates = candidateMembersForSlot(index);
        if (!candidates.length) return;
        const preview = candidates[frame % candidates.length];
        imageWindow.innerHTML = `<div class="destiny-halo"></div><img src="${preview.image}" alt="${preview.name}"><div class="destiny-shine"></div>`;
        nameElement.textContent = '命运转动中…';
        frame += 1;
    }, 90);

    setTimeout(() => {
        clearInterval(cycleTimer);
        const finalCandidates = candidateMembersForSlot(index);
        if (!finalCandidates.length) {
            slot.spinning = false;
            slot.exhausted = true;
            renderHeartSlots();
            return;
        }
        const chosen = finalCandidates[Math.floor(Math.random() * finalCandidates.length)];
        slot.current = chosen;
        slot.history.add(chosen.id);
        slot.spinning = false;
        slot.exhausted = candidateMembersForSlot(index).length === 0;
        renderHeartSlots();
    }, 1750 + Math.random() * 450);
}

function satisfyHeartSlot(index) {
    const slot = heartSlotsState[index];
    if (!slot?.current) return;
    slot.satisfied = true;
    slot.rejected = false;
    renderHeartSlots();
    if (heartSlotsState.every(item => item.satisfied)) finalizeHeartRound();
}

function rejectHeartSlot(index) {
    const slot = heartSlotsState[index];
    if (!slot?.current) return;
    slot.satisfied = false;
    slot.rejected = true;
    slot.exhausted = candidateMembersForSlot(index).length === 0;
    renderHeartSlots();
    if (!slot.exhausted) showHeartToast(`已排除这次的${slot.role}，点击“再次循环”继续`);
}

function unlockHeartSlot(index) {
    const slot = heartSlotsState[index];
    if (!slot) return;
    slot.satisfied = false;
    slot.rejected = true;
    slot.exhausted = candidateMembersForSlot(index).length === 0;
    document.getElementById('heartResultPanel').classList.add('hidden');
    document.getElementById('heartNextRoleBtn').classList.add('hidden');
    renderHeartSlots();
}

function resetHeartHistory(index) {
    const slot = heartSlotsState[index];
    if (!slot) return;
    slot.history = new Set(slot.current ? [slot.current.id] : []);
    slot.exhausted = false;
    slot.satisfied = false;
    slot.rejected = true;
    renderHeartSlots();
    showHeartToast(`${slot.role}候选已重新洗牌，当前结果仍会被排除`);
}

async function finalizeHeartRound() {
    const username = getInviteeName() || '神秘宾客';
    document.getElementById('heartRoundTip').textContent = '心动答案已写入婚礼星球 ✦';
    await saveHeartChoices(username);
    heartSlotsState.forEach(slot => completedHeartRoles.add(slot.role));
    renderHeartCategoryTabs();
    await renderHeartResults(username);
    document.getElementById('heartResultPanel').classList.remove('hidden');
    const nextButton = document.getElementById('heartNextRoleBtn');
    nextButton.textContent = completedHeartRoles.size >= RELATION_ORDER.length ? '六种身份都已选好 · 继续改选' : '继续选择其他身份';
    nextButton.classList.remove('hidden');
    document.getElementById('heartResultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function saveHeartChoices(username) {
    const records = heartSlotsState.map(slot => ({
        user_id: currentCloudUserId || userId,
        username,
        relation_type: slot.role,
        member_key: slot.current.key,
        member_name: slot.current.name,
        updated_at: new Date().toISOString()
    }));

    if (cloud) {
        const session = await ensureCloudSession();
        if (session && currentCloudUserId) {
            records.forEach(record => { record.user_id = currentCloudUserId; });
            const { error } = await cloud.from('heart_choices')
                .upsert(records, { onConflict: 'user_id,relation_type' });
            if (!error) return true;
            console.warn('心选结果同步失败：', error);
            showHeartToast('云端同步失败，结果已保存在本机');
        }
    }

    const local = readLocalHeartChoices();
    records.forEach(record => {
        const index = local.findIndex(item => item.user_id === record.user_id && item.relation_type === record.relation_type);
        if (index >= 0) local[index] = record;
        else local.push(record);
    });
    safeStorage.setItem('heart_choices_local', JSON.stringify(local));
    return false;
}

function readLocalHeartChoices() {
    try {
        const value = JSON.parse(safeStorage.getItem('heart_choices_local') || '[]');
        return Array.isArray(value) ? value : [];
    } catch (_) {
        return [];
    }
}

async function fetchMemberRelations(memberKey) {
    const activeUserId = currentCloudUserId || userId;
    if (cloud) {
        const session = await ensureCloudSession();
        if (session) {
            const { data, error } = await cloud.from('heart_choices')
                .select('user_id,username,relation_type,member_key,member_name')
                .eq('member_key', memberKey)
                .neq('user_id', activeUserId);
            if (!error) return data || [];
            console.warn('读取关系簿失败：', error);
        }
    }
    return readLocalHeartChoices().filter(item => item.member_key === memberKey && item.user_id !== activeUserId);
}

async function renderHeartResults(username) {
    clearRelationScrollTimers();
    const list = document.getElementById('heartResultList');
    document.getElementById('heartResultTitle').textContent = `${username}的心选结果`;
    list.innerHTML = '<div class="heart-loading">正在翻阅婚礼关系簿…</div>';
    const panels = [];
    for (const slot of heartSlotsState) {
        const rows = await fetchMemberRelations(slot.current.key);
        panels.push(buildMemberRelationPanel(username, slot, rows));
    }
    list.innerHTML = panels.join('');
    requestAnimationFrame(setupRelationAutoScroll);
}

function buildMemberRelationPanel(username, slot, rows) {
    const groups = RELATION_ORDER.map((role, order) => ({
        role,
        order,
        names: rows.filter(row => row.relation_type === role).map(row => row.username).filter(Boolean)
    })).filter(group => group.names.length)
      .sort((a, b) => b.names.length - a.names.length || a.order - b.order);

    const relationHtml = groups.length
        ? groups.map(group => `
            <section class="relation-group">
                <div class="relation-group-title"><strong>${group.role}</strong><span>${group.names.length} 人</span></div>
                <div class="relation-name-list">${group.names.map(name => `<span>${escapeHtml(name)}的${group.role}</span>`).join('')}</div>
            </section>`).join('')
        : '<div class="relation-empty">目前还没有其他人抽到他<br>你是这段关系的第一颗星 ✦</div>';

    return `
        <article class="heart-final-card">
            <div class="heart-final-person">
                <img src="${slot.current.image}" alt="${slot.current.name}">
                <div><p>${escapeHtml(username)}的${slot.role}是</p><h3>${slot.current.name}</h3></div>
            </div>
            <div class="heart-also-title">他还是……</div>
            <div class="relation-loop" tabindex="0">
                <div class="relation-loop-track">${relationHtml}</div>
            </div>
        </article>`;
}

function setupRelationAutoScroll() {
    document.querySelectorAll('.relation-loop').forEach(viewport => {
        const track = viewport.querySelector('.relation-loop-track');
        if (!track || track.scrollHeight <= viewport.clientHeight + 8) return;
        track.insertAdjacentHTML('beforeend', track.innerHTML);
        let paused = false;
        ['pointerenter', 'pointerdown', 'touchstart', 'focusin'].forEach(type => viewport.addEventListener(type, () => { paused = true; }, { passive: true }));
        ['pointerleave', 'pointerup', 'touchend', 'focusout'].forEach(type => viewport.addEventListener(type, () => { paused = false; }, { passive: true }));
        const timer = setInterval(() => {
            if (paused) return;
            viewport.scrollTop += 1;
            if (viewport.scrollTop >= track.scrollHeight / 2) viewport.scrollTop = 0;
        }, 42);
        relationScrollTimers.push(timer);
    });
}

function clearRelationScrollTimers() {
    relationScrollTimers.forEach(clearInterval);
    relationScrollTimers = [];
}

function showHeartToast(text) {
    const toast = document.getElementById('heartToast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove('hidden');
    clearTimeout(showHeartToast.timer);
    showHeartToast.timer = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[char]);
}
