// ========== 歌曲列表（17首合作曲） ==========
const songList = [
    '2018 试训时期《泡沫》',
    '2018.8.29《改变自己》',
    '2020.7.3《Because of you》',
    '2020.11.6《只对你有感觉》',
    '2022.2.3《R&B all right》',
    '2022.10.24《诀爱》',
    '2023.1.26《流浪记》',
    '2023.4.16《Rolling In The Deep》',
    '2023.8.13《连名带姓》',
    '2024.2.3/4《勇敢》',
    '2024.2.3/4《Bite me》',
    '2024.8.10《笼》',
    '2024.8.25《Paris In The Rain》',
    '2024.8.25《Senorita》',
    '2025.5.2《不值得》',
    '2025.8.30《过》',
    '2026.2.1《暗香》'
];
// 不参与歌词挑战的歌曲索引
const noChallengeSongs = [2, 4, 7, 10, 12, 13];

// 歌词挑战题库（索引对应 songList）
const lyricData = {
    0: { // 泡沫
        lines: [
            { text: '美丽的泡沫 虽然一刹____', answer: '花火' },
            { text: '你所有承诺 虽然都太脆弱', answer: '' },
            { text: '爱本是泡沫 如果能够看破 有什么____', answer: '难过' },
            { text: '再美的花朵 盛开过就____', answer: '凋落' },
            { text: '再亮眼的星 一闪过就坠落', answer: '' }
        ]
    },
    1: { // 改变自己
        lines: [
            { text: '我可以改变世界 ____', answer: '改变自己' },
            { text: '改变隔膜 改变小气', answer: '' },
            { text: '要一直 努力努力 ____', answer: '永不放弃' },
            { text: '才可以改变世界 Come on ____', answer: '改变自己' }
        ]
    },
    3: { // 只对你有感觉
        lines: [
            { text: '微笑再美再甜 不是你的都不特别', answer: '' },
            { text: '眼泪再苦再咸 有你安慰又是____', answer: '晴天' },
            { text: '靠的再近再贴 少了拥抱就算太远', answer: '' },
            { text: '全世界只对你有____', answer: '感觉' },
            { text: '玩的再疯再野 你瞪一眼我就____', answer: '收敛' }
        ]
    },
    5: { // 诀爱
        lines: [
            { text: '等天崩地裂的那一瞬间', answer: '' },
            { text: '待坍塌破碎了睁开双眼', answer: '' },
            { text: '无处安放____ 只能降落', answer: '灵魂' },
            { text: '拔情诀爱的最后', answer: '' },
            { text: '指尖缠绕的____', answer: '温柔' },
            { text: '化作一把锋利剑 刺向了我', answer: '' },
            { text: '说再见____ 开不了口的惋惜', answer: '来不及' }
        ]
    },
    6: { // 流浪记
        lines: [
            { text: '怎样才能够看穿面具里的____', answer: '谎话' },
            { text: '别让我的真心散的像____', answer: '沙' },
            { text: '如果有一天我变得更____', answer: '复杂' },
            { text: '还能不能唱出歌声里的puyuma', answer: '' }
        ]
    },
    8: { // 连名带姓
        lines: [
            { text: '再被你提起 已是连名带姓', answer: '' },
            { text: '谎称是友谊 却疏远得可以', answer: '' },
            { text: '多少人爱我 偏放不下你', answer: '' },
            { text: '是公开的____', answer: '秘密' },
            { text: '算不清多少个____一起过', answer: '跨年夜' },
            { text: '我且爱且走 其实在等你', answer: '' },
            { text: '是仅有的____', answer: '默契' }
        ]
    },
    9: { // 勇敢
        lines: [
            { text: '是我勇敢太久', answer: '' },
            { text: '决定为你一个人而活', answer: '' },
            { text: '不能说出口 那么____', answer: '折磨' },
            { text: '勇敢了太久 城市充满短暂的____', answer: '烟火' },
            { text: '无处躲', answer: '' },
            { text: '照亮了沉默', answer: '' },
            { text: '明白是____', answer: '寂寞' }
        ]
    },
    11: { // 笼
        lines: [
            { text: '为何绚烂 叫人扑空', answer: '' },
            { text: '为何爱我者予我____', answer: '牢笼' },
            { text: '为何等待 都徒劳无功', answer: '' },
            { text: '为何囚人者也像____', answer: '困兽' },
            { text: '越珍贵 越浪费', answer: '' },
            { text: '致命的伤 诞生于____', answer: '亲密' }
        ]
    },
    14: { // 不值得
        lines: [
            { text: '这感情不值得我犹豫', answer: '' },
            { text: '不值得我考虑', answer: '' },
            { text: '不值得我爱过你', answer: '' },
            { text: '不值得想起', answer: '' },
            { text: '不值得____', answer: '哭泣' },
            { text: '这段感情早就应该放弃', answer: '' },
            { text: '早就不该让我浪费时间找____', answer: '奇迹' },
            { text: '我决定不为你而____ 放弃爱你', answer: '毁了心' }
        ]
    },
    15: { // 过
        lines: [
            { text: '爱情自带寂寞', answer: '' },
            { text: '爱情各种____', answer: '错过' },
            { text: '却在多年以后 还想回头', answer: '' },
            { text: '不见天日的____', answer: '伤口' },
            { text: '残留的快乐是无底漩涡', answer: '' },
            { text: '没有如果的____', answer: '结果' },
            { text: '我来不及说的话在永远里沉没', answer: '' }
        ]
    },
    16: { // 暗香
        lines: [
            { text: '当花瓣离开花朵 暗香残留', answer: '' },
            { text: '如果爱告诉我走下去', answer: '' },
            { text: '我会拼到____', answer: '爱尽头' },
            { text: '心若在灿烂中死去', answer: '' },
            { text: '爱会在灰烬里____', answer: '重生' },
            { text: '难忘缠绵细语时', answer: '' },
            { text: '用你笑容为我____', answer: '祭奠' }
        ]
    }
};

// 安全存储：本地文件、隐私模式或禁用 Cookie 时自动降级到内存
const safeStorage = (() => {
    const memory = new Map();
    try {
        const nativeStorage = window.localStorage;
        const testKey = '__jiyu_storage_test__';
        nativeStorage.setItem(testKey, '1');
        nativeStorage.removeItem(testKey);
        return nativeStorage;
    } catch (error) {
        console.warn('localStorage 不可用，当前访问将使用临时内存状态', error);
        return {
            getItem: key => memory.has(key) ? memory.get(key) : null,
            setItem: (key, value) => memory.set(key, String(value)),
            removeItem: key => memory.delete(key),
            clear: () => memory.clear()
        };
    }
})();

// 全局状态（对本地缓存做容错，避免异常数据让页面初始化失败）
function readStoredIndexArray(key) {
    try {
        const value = JSON.parse(safeStorage.getItem(key) || '[]');
        if (!Array.isArray(value)) return [];
        return [...new Set(value.filter(item => Number.isInteger(item) && item >= 0 && item < songList.length))];
    } catch (error) {
        console.warn(`读取 ${key} 失败，已使用空状态`, error);
        return [];
    }
}

let unlockedSongs = readStoredIndexArray('jiyu_unlocked');
let sequenceProgress = Math.min(songList.length, Math.max(0, Number.parseInt(safeStorage.getItem('jiyu_sequence') || '0', 10) || 0));
let lyricDone = readStoredIndexArray('jiyu_lyric_done');
let currentSongIndex = -1;
let lastBgmSrc = 'bite me.ogg';
let tripleClickTimer = null;
let tripleClickCount = 0;
let entranceTimer = null;
let timelineResizeTimer = null;

// ========== 页面初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    initViewportHeight();
    initStars();
    initBigStars();
    initSongRain();
    initTypewriter(); 
    initTimeline();
    initMusic();
    initPhotoClick();
    initSidebar();
    initInviteName(); // 新增
    initLyricChallenge(); // 新增
    initBanquetPage();
    
    // 恢复专属背景
    if (safeStorage.getItem('jiyu_special_bg') === '1') {
        document.body.classList.add('special-bg');
    }
    
    // 开屏结束显示主页
    setTimeout(() => {
        document.getElementById('splash').style.display = 'none';
        document.getElementById('mainPage').classList.remove('hidden');
    }, 3500);

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

// ========== 动态视口高度：兼容 iOS/Android 浏览器地址栏与安全区 ==========
function initViewportHeight() {
    const updateViewport = () => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(updateViewport, 120), { passive: true });
    window.visualViewport?.addEventListener('resize', updateViewport, { passive: true });
}

// ========== 小星星氛围 ==========
function initStars() {
    const layer = document.getElementById('starsLayer');
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star-item';
        star.textContent = '✦';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.fontSize = (8 + Math.random() * 14) + 'px';
        star.style.animationDuration = (3 + Math.random() * 4) + 's, ' + (2 + Math.random() * 3) + 's';
        star.style.animationDelay = Math.random() * 3 + 's, ' + Math.random() * 2 + 's';
        star.style.opacity = 0.4 + Math.random() * 0.6;
        layer.appendChild(star);
    }
}

// ========== 大际遇星横向飘过 ==========
function initBigStars() {
    const layer = document.getElementById('bigStarsLayer');
    
    function spawnBigStar() {
        const star = document.createElement('div');
        star.className = 'big-star';
        star.textContent = '✦';
        star.style.top = (10 + Math.random() * 75) + '%';
        star.style.fontSize = (22 + Math.random() * 18) + 'px';
        star.style.animationDuration = (12 + Math.random() * 10) + 's';
        layer.appendChild(star);
        setTimeout(() => star.remove(), 22000);
    }
    
    for (let i = 0; i < 3; i++) {
        setTimeout(spawnBigStar, i * 3000);
    }
    setInterval(spawnBigStar, 5000);
}

// ========== 歌曲碎片+花瓣雨 ==========
function initSongRain() {
    const layer = document.getElementById('songRain');
    
    function spawnCard() {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.textContent = songList[Math.floor(Math.random() * songList.length)];
        card.style.left = Math.random() * 92 + '%';
        card.style.animationDuration = (8 + Math.random() * 8) + 's';
        card.style.fontSize = (10 + Math.random() * 4) + 'px';
        card.style.opacity = 0.5 + Math.random() * 0.4;
        const rotateDir = Math.random() > 0.5 ? 1 : -1;
        card.style.transform = `rotate(${rotateDir * Math.random() * 20}deg)`;
        layer.appendChild(card);
        setTimeout(() => card.remove(), 16000);
    }
    
    function spawnPetal() {
        const petal = document.createElement('div');
        petal.className = 'rain-petal';
        const petals = ['🌸', '💮', '💗', '💕'];
        petal.textContent = petals[Math.floor(Math.random() * petals.length)];
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (6 + Math.random() * 6) + 's';
        petal.style.fontSize = (12 + Math.random() * 10) + 'px';
        layer.appendChild(petal);
        setTimeout(() => petal.remove(), 12000);
    }
    
    // 初始生成
    for (let i = 0; i < 8; i++) {
        setTimeout(spawnCard, i * 600);
    }
    for (let i = 0; i < 5; i++) {
        setTimeout(spawnPetal, i * 800 + 200);
    }
    
    // 持续生成
    setInterval(spawnCard, 1200);
    setInterval(spawnPetal, 1800);
}

// ========== 际遇星盘时光轴（自适应圆盘 + 精准连线） ==========
function initTimeline() {
    const container = document.getElementById('timelineDots');
    const modal = document.getElementById('songModal');
    const songImg = document.getElementById('songImg');
    const songName = document.getElementById('songName');
    const closeBtn = document.getElementById('songClose');
    const challengeBtn = document.getElementById('lyricChallengeBtn');

    const songImgNames = [
        '泡沫.jpg', '改变自己.jpg', 'Because of you.jpg',
        '只对你有感觉.jpg', 'R&B all right.jpg', '诀爱.jpg',
        '流浪记.jpg', 'Rolling In The Deep.jpg', '连名带姓.jpg',
        '勇敢.jpg', 'Bite me.jpg', '笼.jpg',
        'Paris In The Rain.jpg', 'Senorita.jpg', '不值得.jpg',
        '过.jpg', '暗香.jpg'
    ];

    const center = document.createElement('div');
    center.className = 'timeline-center';
    center.textContent = '✦';
    center.setAttribute('aria-hidden', 'true');
    container.appendChild(center);

    for (let i = 0; i < songList.length; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'timeline-dot';
        dot.dataset.index = String(i);
        dot.setAttribute('aria-label', `第 ${i + 1} 首：${songList[i]}`);

        if (unlockedSongs.includes(i)) dot.classList.add('unlocked');
        if (lyricDone.includes(i)) dot.classList.add('lyric-complete');

        dot.addEventListener('click', function(e) {
            e.stopPropagation();
            const idx = Number.parseInt(this.dataset.index, 10);
            currentSongIndex = idx;

            if (!unlockedSongs.includes(idx)) {
                unlockedSongs.push(idx);
                unlockedSongs.sort((a, b) => a - b);
                safeStorage.setItem('jiyu_unlocked', JSON.stringify(unlockedSongs));
                this.classList.add('unlocked');
                updateProgress();
                updateUnlockCards();
                checkAllUnlocked();
            }

            if (idx === sequenceProgress) {
                sequenceProgress = Math.min(songList.length, sequenceProgress + 1);
                safeStorage.setItem('jiyu_sequence', String(sequenceProgress));
                drawLines();
                if (sequenceProgress >= songList.length) unlockSpecialBg();
            } else if (idx !== sequenceProgress - 1) {
                this.classList.remove('dot-shake');
                void this.offsetWidth;
                this.classList.add('dot-shake');
            }

            document.querySelectorAll('.timeline-dot.active').forEach(item => item.classList.remove('active'));
            this.classList.add('active');

            songImg.src = songImgNames[idx];
            songImg.alt = `${songList[idx]}封面`;
            songImg.style.display = 'block';
            songName.textContent = songList[idx];
            modal.classList.remove('hidden');

            if (noChallengeSongs.includes(idx) || !lyricData[idx]) {
                challengeBtn.classList.add('hidden');
            } else {
                challengeBtn.classList.remove('hidden');
                const completed = lyricDone.includes(idx);
                challengeBtn.classList.toggle('done', completed);
                challengeBtn.textContent = completed ? '已获得星光印记 ★' : '来挑战歌词 ✨';
            }
        });

        container.appendChild(dot);
    }

    layoutTimelineWheel();
    updateTimelineCompletionMarks();
    drawLines();

    center.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        sequenceProgress = 0;
        safeStorage.setItem('jiyu_sequence', '0');
        drawLines();
    });

    const closeSongModal = () => {
        modal.classList.add('hidden');
        document.querySelectorAll('.timeline-dot.active').forEach(item => item.classList.remove('active'));
    };
    closeBtn.addEventListener('click', event => {
        event.stopPropagation();
        closeSongModal();
    });
    modal.addEventListener('click', event => {
        if (event.target === modal) closeSongModal();
    });

    window.addEventListener('resize', () => {
        clearTimeout(timelineResizeTimer);
        timelineResizeTimer = setTimeout(() => {
            layoutTimelineWheel();
            drawLines();
        }, 100);
    }, { passive: true });

    updateProgress();
    updateUnlockCards();
    initUnlockScroller();
}

function layoutTimelineWheel() {
    const container = document.getElementById('timelineDots');
    const dots = [...container.querySelectorAll('.timeline-dot')];
    if (!dots.length) return;

    const size = container.clientWidth || 200;
    const radius = Math.max(58, size / 2 - Math.max(18, size * 0.085));

    dots.forEach((dot, index) => {
        const angle = (Math.PI * 2 / dots.length) * index - Math.PI / 2;
        dot.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
        dot.style.setProperty('--y', `${Math.sin(angle) * radius}px`);
    });
}

// 绘制连线
function drawLines() {
    const canvas = document.getElementById('lineCanvas');
    const container = document.getElementById('timelineDots');
    const total = songList.length;
    const size = container.clientWidth || 200;
    const center = size / 2;
    const radius = Math.max(58, size / 2 - Math.max(18, size * 0.085));

    canvas.setAttribute('viewBox', `0 0 ${size} ${size}`);
    canvas.setAttribute('width', String(size));
    canvas.setAttribute('height', String(size));
    canvas.replaceChildren();

    const completedSegments = Math.min(Math.max(sequenceProgress - 1, 0), total - 1);
    for (let i = 0; i < completedSegments; i++) {
        const angle1 = (Math.PI * 2 / total) * i - Math.PI / 2;
        const angle2 = (Math.PI * 2 / total) * (i + 1) - Math.PI / 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(center + Math.cos(angle1) * radius));
        line.setAttribute('y1', String(center + Math.sin(angle1) * radius));
        line.setAttribute('x2', String(center + Math.cos(angle2) * radius));
        line.setAttribute('y2', String(center + Math.sin(angle2) * radius));
        line.style.setProperty('--line-delay', `${i * 45}ms`);
        canvas.appendChild(line);
    }
}

// 更新进度条
function updateProgress() {
    const count = unlockedSongs.length;
    document.getElementById('unlockCount').textContent = count;
    document.getElementById('progressFill').style.width = (count / 17 * 100) + '%';
}

// 更新解锁封面栏
function updateUnlockCards() {
    const container = document.getElementById('unlockCards');
    const previousScrollLeft = container.scrollLeft;
    const songImgNames = [
        '泡沫.jpg', '改变自己.jpg', 'Because of you.jpg',
        '只对你有感觉.jpg', 'R&B all right.jpg', '诀爱.jpg',
        '流浪记.jpg', 'Rolling In The Deep.jpg', '连名带姓.jpg',
        '勇敢.jpg', 'Bite me.jpg', '笼.jpg',
        'Paris In The Rain.jpg', 'Senorita.jpg', '不值得.jpg',
        '过.jpg', '暗香.jpg'
    ];

    container.replaceChildren();
    for (let i = 0; i < songList.length; i++) {
        const unlocked = unlockedSongs.includes(i);
        const completed = lyricDone.includes(i);
        const card = document.createElement(unlocked ? 'button' : 'div');
        if (unlocked) card.type = 'button';
        card.className = `mini-card${unlocked ? '' : ' locked'}${completed ? ' lyric-complete' : ''}`;
        card.setAttribute('role', 'listitem');

        if (unlocked) {
            const title = songList[i].includes('《') ? songList[i].split('《')[1].replace('》', '') : songList[i];
            card.innerHTML = `
                <span class="mini-cover-wrap">
                    <img src="${songImgNames[i]}" alt="${title}封面" loading="lazy">
                    ${completed ? '<span class="star-stamp" aria-label="歌词挑战已通关">★</span>' : ''}
                </span>
                <span class="mini-name">${title}</span>
            `;
            card.setAttribute('aria-label', `${title}${completed ? '，歌词挑战已通关' : '，已解锁'}`);
            card.addEventListener('click', () => {
                document.querySelectorAll('.timeline-dot')[i]?.click();
            });
        } else {
            card.innerHTML = '<span class="lock-icon">🔒</span><span class="mini-name">待解锁</span>';
            card.setAttribute('aria-label', `第 ${i + 1} 首歌曲尚未解锁`);
        }

        container.appendChild(card);
    }

    requestAnimationFrame(() => {
        container.scrollLeft = Math.min(previousScrollLeft, Math.max(0, container.scrollWidth - container.clientWidth));
    });
    updateTimelineCompletionMarks();
}

function updateTimelineCompletionMarks() {
    document.querySelectorAll('.timeline-dot').forEach(dot => {
        const index = Number.parseInt(dot.dataset.index, 10);
        const completed = lyricDone.includes(index);
        dot.classList.toggle('lyric-complete', completed);
        dot.setAttribute('aria-pressed', String(unlockedSongs.includes(index)));
    });
}

function initUnlockScroller() {
    const container = document.getElementById('unlockCards');
    if (!container || container.dataset.scrollReady === '1') return;
    container.dataset.scrollReady = '1';

    container.addEventListener('wheel', event => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || container.scrollWidth <= container.clientWidth) return;
        event.preventDefault();
        container.scrollLeft += event.deltaY;
    }, { passive: false });

    let isDragging = false;
    let didDrag = false;
    let startX = 0;
    let startScrollLeft = 0;

    container.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch') return;
        isDragging = true;
        didDrag = false;
        startX = event.clientX;
        startScrollLeft = container.scrollLeft;
        container.classList.add('dragging');
        container.setPointerCapture?.(event.pointerId);
    });

    container.addEventListener('pointermove', event => {
        if (!isDragging) return;
        const distance = event.clientX - startX;
        if (Math.abs(distance) > 4) didDrag = true;
        container.scrollLeft = startScrollLeft - distance;
    });

    const finishDrag = event => {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('dragging');
        if (container.hasPointerCapture?.(event.pointerId)) container.releasePointerCapture(event.pointerId);
    };
    container.addEventListener('pointerup', finishDrag);
    container.addEventListener('pointercancel', finishDrag);
    container.addEventListener('click', event => {
        if (!didDrag) return;
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
    }, true);
}

// 检查是否全部解锁
function checkAllUnlocked() {
    if (unlockedSongs.length === 17) {
        triggerFullEaster();
    }
}

// 解锁专属背景
function unlockSpecialBg() {
    document.body.classList.add('special-bg');
    safeStorage.setItem('jiyu_special_bg', '1');
}

// ========== 开屏打字机动画 ==========
function initTypewriter() {
    const text = '欢迎来到我们的婚礼星球';
    const el = document.getElementById('splashTypewriter');
    const sub = document.getElementById('splashSub');
    if (!el) return;
    let i = 0;

    function type() {
        if (i < text.length) {
            el.innerHTML = `${text.substring(0, i + 1)}<span class="typewriter-cursor"></span>`;
            i += 1;
            setTimeout(type, 180);
            return;
        }
        setTimeout(() => sub?.classList.remove('hidden'), 220);
    }

    setTimeout(type, 520);
}

// ========== 请柬昵称功能 ==========
function initInviteName() {
    const input = document.getElementById('hostNameInput');
    const saved = safeStorage.getItem('jiyu_host_name');
    if (saved) input.value = saved;
    
    input.addEventListener('blur', function() {
        safeStorage.setItem('jiyu_host_name', this.value);
    });
    
    input.addEventListener('click', e => e.stopPropagation());
}

// ========== 歌词挑战 ==========
function initLyricChallenge() {
    const modal = document.getElementById('lyricModal');
    const content = document.getElementById('lyricContent');
    const result = document.getElementById('lyricResult');
    const submitBtn = document.getElementById('lyricSubmit');
    const retryBtn = document.getElementById('lyricRetry');
    const closeBtn = document.getElementById('lyricClose');
    const challengeBtn = document.getElementById('lyricChallengeBtn');
    
    challengeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (lyricDone.includes(currentSongIndex)) return;
        openLyricModal();
    });
    
    function openLyricModal() {
        const data = lyricData[currentSongIndex];
        content.innerHTML = '';
        result.textContent = '';
        submitBtn.classList.remove('hidden');
        retryBtn.classList.add('hidden');
        
        data.lines.forEach((line, idx) => {
            const p = document.createElement('p');
            p.className = 'lyric-line';
            
            if (line.answer) {
                p.innerHTML = line.text.replace('____', 
                    `<input type="text" class="lyric-blank" data-answer="${line.answer}" maxlength="6">`);
            } else {
                p.textContent = line.text;
            }
            
            content.appendChild(p);
        });
        
        modal.classList.remove('hidden');
    }
    
    submitBtn.addEventListener('click', function() {
        const inputs = document.querySelectorAll('.lyric-blank');
        let allCorrect = true;
        
        inputs.forEach(input => {
            const correct = input.dataset.answer;
            const val = input.value.trim();
            
            if (val === correct) {
                input.classList.add('correct');
                input.classList.remove('wrong');
            } else {
                input.classList.add('wrong');
                input.classList.remove('correct');
                allCorrect = false;
            }
        });
        
        if (allCorrect) {
            result.textContent = '✨ 答对啦！星光印记已点亮 ✨';
            result.style.color = '#48a87e';
            submitBtn.classList.add('hidden');
            retryBtn.classList.add('hidden');
            
            // 标记完成
            if (!lyricDone.includes(currentSongIndex)) {
                lyricDone.push(currentSongIndex);
                safeStorage.setItem('jiyu_lyric_done', JSON.stringify(lyricDone));
                challengeBtn.classList.add('done');
                challengeBtn.textContent = '已获得星光印记 ★';
            }

            updateTimelineCompletionMarks();
            updateUnlockCards();
            const activeDot = document.querySelector(`.timeline-dot[data-index="${currentSongIndex}"]`);
            activeDot?.classList.add('completion-pop');
            setTimeout(() => activeDot?.classList.remove('completion-pop'), 900);

            // 星光动画
            burstStarlight();
        } else {
            result.textContent = '还差一点点哦，再试试吧~';
            result.style.color = '#d9534f';
            submitBtn.classList.add('hidden');
            retryBtn.classList.remove('hidden');
        }
    });
    
    retryBtn.addEventListener('click', function() {
        openLyricModal();
    });
    
    closeBtn.addEventListener('click', e => {
        e.stopPropagation();
        modal.classList.add('hidden');
    });
    modal.addEventListener('click', e => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// 答对星光特效
function burstStarlight() {
    const container = document.getElementById('heartBurst');
    for (let i = 0; i < 30; i++) {
        const s = document.createElement('div');
        s.className = 'burst-heart';
        s.textContent = '✨';
        s.style.left = '50%';
        s.style.top = '50%';
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 100;
        s.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        s.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        s.style.animationDelay = Math.random() * 0.3 + 's';
        s.style.fontSize = (14 + Math.random() * 10) + 'px';
        
        container.appendChild(s);
        setTimeout(() => s.remove(), 2000);
    }
}

// ========== 全屏彩蛋（修复关闭问题 + 4秒自动关闭） ==========
let easterCloseTimer = null;

function triggerFullEaster() {
    const modal = document.getElementById('easterModal');
    const music = document.getElementById('bgMusic');
    
    // 先清除之前的定时器，避免重复触发
    if (easterCloseTimer) clearTimeout(easterCloseTimer);
    
    // 记录当前BGM并切换
    lastBgmSrc = music.src.split('/').pop();
    music.src = '流浪记.ogg';
    music.volume = 0.6;
    music.play().catch(() => {});
    
    // 显示彩蛋
    modal.classList.remove('hidden');
    startFireworks();
    
    // 关闭函数
    function closeEaster() {
        if (easterCloseTimer) clearTimeout(easterCloseTimer);
        modal.classList.add('hidden');
        // 恢复原BGM
        music.src = lastBgmSrc;
        music.volume = 1;
        music.play().catch(() => {});
    }
    
    // 4秒后自动关闭
    easterCloseTimer = setTimeout(closeEaster, 8000);
    
    // 点击任意处关闭（只绑定一次）
    modal.onclick = closeEaster;
}

// 烟花动画
function startFireworks() {
    const container = document.getElementById('fireworksContainer');
    const colors = ['#ffb8d1', '#ff94b8', '#fff0f5', '#ffd6e5', '#ffc8dd', '#ffffff'];
    
    function launchFirework() {
        const x = Math.random() * 100;
        const y = 20 + Math.random() * 50;
        
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'firework';
            p.style.left = x + '%';
            p.style.top = y + '%';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.boxShadow = `0 0 6px ${p.style.background}`;
            
            const angle = (Math.PI * 2 / 30) * i;
            const dist = 40 + Math.random() * 40;
            p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
            p.style.animationDelay = Math.random() * 0.2 + 's';
            
            container.appendChild(p);
            setTimeout(() => p.remove(), 1800);
        }
    }
    
    // 持续放烟花
    const timer = setInterval(launchFirework, 800);
    // 10秒后停止
    setTimeout(() => clearInterval(timer), 10000);
}

// ========== 音乐选择器 ==========
function initMusic() {
    const btn = document.getElementById('musicBtn');
    const menu = document.getElementById('musicMenu');
    const music = document.getElementById('bgMusic');
    const items = document.querySelectorAll('.menu-item');
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    
    items.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const src = this.dataset.src;
            
            items.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            music.src = src;
            music.play();
            btn.classList.add('playing');
            menu.classList.add('hidden');
        });
    });
    
    document.addEventListener('click', function() {
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });
}

// ========== 合照点击 + 三击彩蛋 ==========
function initPhotoClick() {
    const photo = document.getElementById('couplePhoto');
    
    photo.addEventListener('click', function(e) {
        const rect = photo.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        // 三击检测
        tripleClickCount++;
        clearTimeout(tripleClickTimer);
        tripleClickTimer = setTimeout(() => {
            tripleClickCount = 0;
        }, 800);
        
        if (tripleClickCount >= 2) {
            tripleClickCount = 0;
            triggerEaster();
            return;
        }
        
        burstHearts(cx, cy);
    });
}

function burstHearts(cx, cy) {
    const container = document.getElementById('heartBurst');
    const hearts = ['💗', '💕', '💖', '💝', '🌸', '✨'];
    
    for (let i = 0; i < 20; i++) {
        const h = document.createElement('div');
        h.className = 'burst-heart';
        h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        h.style.left = cx + 'px';
        h.style.top = cy + 'px';
        
        const angle = (Math.PI * 2 / 20) * i + Math.random() * 0.4;
        const dist = 80 + Math.random() * 120;
        h.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        h.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
        h.style.animationDelay = Math.random() * 0.3 + 's';
        h.style.fontSize = (16 + Math.random() * 14) + 'px';
        
        container.appendChild(h);
        setTimeout(() => h.remove(), 2500);
    }
}

// ========== 三击彩 ==========
// 原三击彩蛋保留，触发全屏彩蛋
function triggerEaster() {
    triggerFullEaster();
}
// ========== 请柬侧边栏 ==========
function initSidebar() {
    const btn = document.getElementById('inviteBtn');
    const sidebar = document.getElementById('inviteSidebar');
    const closeBtn = document.getElementById('inviteClose');
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });
    
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.remove('open');
    });
}

function spawnPetalConfetti() {
    const container = document.getElementById('petalBurst');
    const items = ['🌸', '💮', '💗', '💕', '✨'];
    const colors = ['#ffb8d1', '#ff94b8', '#ffd6e5', '#fff0f5', '#ffc8dd'];
    
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-petal';
        p.textContent = items[Math.floor(Math.random() * items.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (2 + Math.random() * 2) + 's';
        p.style.animationDelay = Math.random() * 0.5 + 's';
        p.style.fontSize = (12 + Math.random() * 14) + 'px';
        container.appendChild(p);
        setTimeout(() => p.remove(), 4500);
    }
}

// 清空解锁记录
document.getElementById('resetBtn').addEventListener('click', function() {
    if (!confirm('确定要清空所有解锁记录、连线进度、歌词通关记录吗？')) return;
    
    safeStorage.removeItem('jiyu_unlocked');
    safeStorage.removeItem('jiyu_sequence');
    safeStorage.removeItem('jiyu_lyric_done');
    safeStorage.removeItem('jiyu_special_bg');
    
    alert('已清空所有记录！页面即将刷新');
    location.reload();
});

// ====================== 婚宴页面｜JSONBin云端座位同步 ======================
const BIN_ID = "6a562594da38895dfe5ba70a";
const ACCESS_KEY = "$2a$10$WvSYWhjxICFpZAf3.cxEbe/3BjIz1sFB22Pjqnq4uLBJawRI.pR0G";

// 用户唯一ID
let userId = safeStorage.getItem("jiyu_star_user_id");
if (!userId) {
    userId = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    safeStorage.setItem("jiyu_star_user_id", userId);
}

let seatData = null;
let pendingSeat = null;

// 云端读取座位
async function loadRemoteSeat() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`);
        if (!res.ok) throw new Error("读取失败");
        const json = await res.json();
        seatData = json.record;
        safeStorage.setItem("seatBackup", JSON.stringify(seatData));
        renderAllSeat();
        return true;
    } catch (err) {
        console.warn("云端读取失败", err);
        const backup = safeStorage.getItem("seatBackup");
        if(backup) seatData = JSON.parse(backup);
        showTip("⚠️网络异常，加载本地缓存座位");
        renderAllSeat();
        return false;
    }
}

// 云端写入座位（Header使用X-Access-Key 解决401）
async function saveRemoteSeat() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method:"PUT",
            headers:{
                "Content-Type":"application/json",
                "X-Access-Key": ACCESS_KEY
            },
            body: JSON.stringify(seatData)
        });
        if (!res.ok) throw new Error("写入失败 "+res.status);
        safeStorage.setItem("seatBackup", JSON.stringify(seatData));
        return true;
    } catch(err){
        console.error("座位保存失败",err);
        showTip("❌座位保存失败，请稍后重试");
        return false;
    }
}

// 初始化婚宴页面
function initBanquetPage(){
    const seatBtn = document.getElementById("seatBtn");
    const banquetPage = document.getElementById("banquetPage");
    const backBtn = document.getElementById("banquetBackBtn");
    const refreshBtn = document.getElementById("refreshSeatBtn");
    const confirmModal = document.getElementById("seatConfirmModal");
    const tipModal = document.getElementById("tipModal");
    const confirmCancel = confirmModal.querySelector(".confirm-cancel");
    const confirmOk = confirmModal.querySelector(".confirm-ok");
    const tipOk = tipModal.querySelector(".tip-ok");

    // 生成8个环形座位
    document.querySelectorAll(".round-table").forEach(table=>{
        const ringWrap = table.querySelector(".seats-ring");
        const tableId = table.dataset.table;
        const seatCount = 8;
        const radius = 57;
        for(let i=0;i<seatCount;i++){
            const seat = document.createElement("div");
            seat.className = "seat";
            seat.dataset.table = tableId;
            seat.dataset.seatIdx = i;
            const angle = (Math.PI * 2 / seatCount) * i;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            seat.style.left = `${x}%`;
            seat.style.top = `${y}%`;
            ringWrap.appendChild(seat);

            // 点击空位
            seat.addEventListener("click",async ()=>{
                const tid = seat.dataset.table;
                const sid = Number(seat.dataset.seatIdx);
                await loadRemoteSeat();
                if(!seatData?.seats) return;
                if(seatData.seats[tid][sid] !== null){
                    showTip("该座位已经被占用！");
                    return;
                }
                pendingSeat = {tableId:tid, seatIndex:sid};
                openConfirm();
            });
        }
    });

    // 打开婚宴页面
    seatBtn.addEventListener("click", async () => {
        banquetPage.classList.remove("hidden");
        document.body.classList.add("banquet-open");
        resetEntrance();
        requestAnimationFrame(() => startWalkAnimation());
        await loadRemoteSeat();
        renderAllSeat();
    });
    // 返回主页
    backBtn.addEventListener("click", () => {
        banquetPage.classList.add("hidden");
        document.body.classList.remove("banquet-open");
        resetEntrance();
    });
    // 手动刷新座位
    refreshBtn.addEventListener("click",async ()=>{
        await loadRemoteSeat();
        showTip("座位已刷新");
    });

    // 确认落座逻辑
    confirmOk.onclick = async ()=>{
        if(!pendingSeat) return;
        const {tableId, seatIndex} = pendingSeat;
        // 清除用户旧座位
        outer: for(let t in seatData.seats){
            const arr = seatData.seats[t];
            for(let i=0;i<arr.length;i++){
                if(arr[i] === userId){
                    arr[i] = null;
                    break outer;
                }
            }
        }
        seatData.seats[tableId][seatIndex] = userId;
        const ok = await saveRemoteSeat();
        if(ok){
            renderAllSeat();
            showTip("落座成功✨");
        }
        confirmModal.classList.add("hidden");
        pendingSeat = null;
    };
    confirmCancel.onclick = ()=>{
        confirmModal.classList.add("hidden");
        pendingSeat = null;
    };
    tipOk.onclick = ()=>tipModal.classList.add("hidden");
}

// 重置入场动画状态
function resetEntrance() {
    const walkGroup = document.getElementById('walkMemberGroup');
    const stageGroup = document.getElementById('stageMemberGroup');
    if (entranceTimer) {
        clearTimeout(entranceTimer);
        entranceTimer = null;
    }
    walkGroup.onanimationend = null;
    walkGroup.classList.remove('hidden', 'is-entering');
    stageGroup.classList.add('hidden');
    stageGroup.classList.remove('arrived');
    void walkGroup.offsetWidth;
}

// 约 4 秒：新人从页面底部沿中间走廊进入舞台
function startWalkAnimation() {
    const walkGroup = document.getElementById('walkMemberGroup');
    const stageGroup = document.getElementById('stageMemberGroup');
    walkGroup.classList.remove('hidden', 'is-entering');
    stageGroup.classList.add('hidden');
    stageGroup.classList.remove('arrived');
    void walkGroup.offsetWidth;

    let finished = false;
    const finishEntrance = () => {
        if (finished) return;
        finished = true;
        if (entranceTimer) clearTimeout(entranceTimer);
        entranceTimer = null;
        walkGroup.onanimationend = null;
        walkGroup.classList.add('hidden');
        walkGroup.classList.remove('is-entering');
        stageGroup.classList.remove('hidden');
        stageGroup.classList.add('arrived');
    };

    walkGroup.onanimationend = event => {
        if (event.target === walkGroup && event.animationName === 'coupleEntrance') {
            finishEntrance();
        }
    };
    walkGroup.classList.add('is-entering');

    // 极少数旧浏览器不触发 animationend，使用兜底定时器。
    entranceTimer = setTimeout(finishEntrance, 4300);
}

function openConfirm(){
    document.getElementById("seatConfirmModal").classList.remove("hidden");
}
function showTip(text){
    document.getElementById("tipText").textContent = text;
    document.getElementById("tipModal").classList.remove("hidden");
}

// 渲染全部座位，占用显示✨
function renderAllSeat(){
    if(!seatData?.seats) return;
    document.querySelectorAll(".seat").forEach(seat=>{
        const tid = seat.dataset.table;
        const sid = Number(seat.dataset.seatIdx);
        const occupier = seatData.seats[tid][sid];
        if(occupier !== null){
            seat.classList.add("occupied");
        }else{
            seat.classList.remove("occupied");
        }
    })
}

// ===== 【重点】找到页面初始化DOMContentLoaded函数内部末尾添加这一行 =====
// initBanquetPage();
