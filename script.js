// ========== 成员数据 ==========
const members = [
    { id: 0, name: '朱志鑫', color: '#FFD700', color2: '#FFA500' },
    { id: 1, name: '张泽禹', color: '#32CD32', color2: '#228B22' },
    { id: 2, name: '张极',   color: '#FF8C00', color2: '#FF6347' },
    { id: 3, name: '左航',   color: '#1E90FF', color2: '#4169E1' },
    { id: 4, name: '苏新皓', color: '#DC143C', color2: '#B22222' }
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
let groupClickTracker = [];

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initButterflies();
    initMusic();
    initPhotoClicks();
    initSidebar();
    initMessageWall();       // 新增：留言墙
    initAlbum();             // 新增：相册回忆墙
    initTypingAnimation();   // 新增：开屏打字机

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
            const id = parseInt(this.dataset.id);
            const name = this.dataset.name;
            const color = this.dataset.color;
            
            trackGroupClick(id);
            
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
    document.getElementById('groupModal').addEventListener('click', closeGroupMode);
}

function pauseWheel() {
    document.getElementById('ferrisWheel').classList.add('paused');
}
function resumeWheel() {
    document.getElementById('ferrisWheel').classList.remove('paused');
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
    document.getElementById('inviteBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('inviteSidebar').classList.toggle('open');
    });
    document.getElementById('inviteClose').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('inviteSidebar').classList.remove('open');
    });
    const inviteeInput = document.getElementById('inviteeInput');
    const saved = localStorage.getItem('top_invitee_name');
    if (saved) inviteeInput.value = saved;
    inviteeInput.addEventListener('input', function() {
         localStorage.setItem('top_invitee_name', this.value);
});
}

// ========== 签到 ==========
function initCheckin() {
    const btn = document.getElementById('checkinBtn');
    const modal = document.getElementById('checkinModal');
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        let firstDate = localStorage.getItem('top_first_date');
        if (!firstDate) {
            firstDate = new Date().toISOString().split('T')[0];
            localStorage.setItem('top_first_date', firstDate);
        }
        
        const first = new Date(firstDate);
        const today = new Date();
        const diffDays = Math.floor((today - first) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('daysCount').textContent = diffDays;
        
        let total = parseInt(localStorage.getItem('top_checkin_total') || '0');
        const lastCheckin = localStorage.getItem('top_last_checkin');
        const todayStr = today.toISOString().split('T')[0];
        
        if (lastCheckin !== todayStr) {
            total++;
            localStorage.setItem('top_checkin_total', total);
            localStorage.setItem('top_last_checkin', todayStr);
            spawnConfetti();
        }
        
        document.getElementById('totalCheckin').textContent = total;
        modal.classList.remove('hidden');
    });
    
    document.getElementById('checkinOk').addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.add('hidden');
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

function spawnConfetti() {
    const colors = ['#FFD700', '#FF69B4', '#1E90FF', '#32CD32', '#FF8C00', '#DC143C'];
    for (let i = 0; i < 50; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = (2 + Math.random() * 2) + 's';
        c.style.animationDelay = Math.random() * 0.5 + 's';
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4500);
    }
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

// ========== 五人同框彩蛋 ==========
function trackGroupClick(id) {
    const now = Date.now();
    groupClickTracker.push({ id, time: now });
    groupClickTracker = groupClickTracker.filter(item => now - item.time < 6000);
    const uniqueIds = new Set(groupClickTracker.map(item => item.id));
    
    if (uniqueIds.size >= 5) {
        triggerGroupMode();
        groupClickTracker = [];
    }
}

function triggerGroupMode() {
    document.getElementById('groupModal').classList.remove('hidden');
    spawnFireworks();
}

function closeGroupMode() {
    document.getElementById('groupModal').classList.add('hidden');
    clearSelection();
    resumeWheel();
}

function spawnFireworks() {
    const container = document.getElementById('fireworks');
    container.innerHTML = '';
    
    for (let b = 0; b < 5; b++) {
        setTimeout(() => {
            const cx = 20 + Math.random() * 60;
            const cy = 20 + Math.random() * 50;
            const color = members[Math.floor(Math.random() * 5)].color;
            
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.className = 'firework';
                p.style.left = cx + '%';
                p.style.top = cy + '%';
                p.style.background = color;
                p.style.boxShadow = `0 0 6px ${color}`;
                const angle = (Math.PI * 2 / 20) * i;
                const distance = 60 + Math.random() * 60;
                p.style.setProperty('--fx', Math.cos(angle) * distance + 'px');
                p.style.setProperty('--fy', Math.sin(angle) * distance + 'px');
                p.style.animationDelay = Math.random() * 0.2 + 's';
                container.appendChild(p);
                setTimeout(() => p.remove(), 2000);
            }
        }, b * 400);
    }
}
