// DOM要素
const prefectureSelect = document.getElementById('prefecture');
const genreSelect = document.getElementById('genre');
const budgetSelect = document.getElementById('budget');
const searchBtn = document.getElementById('searchBtn');
const freeInput = document.getElementById('freeInput');
const aiSearchBtn = document.getElementById('aiSearchBtn');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const results = document.getElementById('results');

// 現在の検索結果
let currentResults = [];

// イベントリスナーの設定
searchBtn.addEventListener('click', performTraditionalSearch);
aiSearchBtn.addEventListener('click', performAISearch);

// フォーム要素の変更イベントも監視
[prefectureSelect, genreSelect, budgetSelect].forEach(select => {
    select.addEventListener('change', performTraditionalSearch);
});

// 自由入力欄のEnterキーでも検索
freeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performAISearch();
    }
});

// 従来の検索実行関数
function performTraditionalSearch() {
    const prefecture = prefectureSelect.value;
    const genre = genreSelect.value;
    const budget = budgetSelect.value;

    // ローディング表示
    showLoading();

    // 少し遅延させて検索を実行（UX向上）
    setTimeout(() => {
        const filteredSpots = filterDateSpots(prefecture, genre, budget);
        displayResults(filteredSpots);
    }, 500);
}

// AI風自由入力検索実行関数
function performAISearch() {
    const query = freeInput.value.trim();
    
    if (!query) {
        alert('検索ワードを入力してください');
        return;
    }

    // ローディング表示
    showLoading();

    // 少し遅延させて検索を実行（AI風演出）
    setTimeout(() => {
        const filteredSpots = filterByFreeInput(query);
        displayResults(filteredSpots);
    }, 800);
}

// デートスポットのフィルタリング（従来の検索）
function filterDateSpots(prefecture, genre, budget) {
    return dateSpots.filter(spot => {
        const prefectureMatch = !prefecture || spot.prefecture === prefecture;
        const genreMatch = !genre || spot.genre === genre;
        const budgetMatch = !budget || spot.budget === budget;
        
        return prefectureMatch && genreMatch && budgetMatch;
    });
}

// 自由入力検索によるフィルタリング
function filterByFreeInput(query) {
    const lowerQuery = query.toLowerCase();
    const keywords = extractKeywords(lowerQuery);
    
    return dateSpots.filter(spot => {
        let score = 0;
        
        // ジャンルの一致
        if (keywords.some(keyword => spot.genre.toLowerCase().includes(keyword))) {
            score += 3;
        }
        
        // 都道府県の一致
        if (keywords.some(keyword => spot.prefecture.toLowerCase().includes(keyword))) {
            score += 2;
        }
        
        // タグの一致
        if (spot.tags) {
            const tagMatches = keywords.filter(keyword => 
                spot.tags.some(tag => tag.toLowerCase().includes(keyword))
            ).length;
            score += tagMatches * 2;
        }
        
        // 名前の一致
        if (keywords.some(keyword => spot.name.toLowerCase().includes(keyword))) {
            score += 2;
        }
        
        // 説明文の一致
        const descriptionMatches = keywords.filter(keyword => 
            spot.description.toLowerCase().includes(keyword)
        ).length;
        score += descriptionMatches;
        
        // スコアが1以上のスポットを返す
        return score >= 1;
    }).sort((a, b) => {
        // スコアの高い順にソート
        const scoreA = calculateSpotScore(a, keywords);
        const scoreB = calculateSpotScore(b, keywords);
        return scoreB - scoreA;
    });
}

// キーワード抽出
function extractKeywords(query) {
    // 一般的なデート関連キーワード
    const dateKeywords = [
        '夜景', '夜景が綺麗', '静か', '静かな場所', 'ロマンチック', '浪漫',
        'ドライブ', '運転', '車', '温泉', 'お風呂', 'リラックス',
        '海', '山', '自然', '公園', '散策', 'ウオーキング',
        'グルメ', '美味しい', '食事', 'レストラン', 'カフェ',
        '無料', 'タダ', 'お金かけない', '安い', '有料', '贅沢',
        '富士山', '富士', '城', '神社', '寺', '歴史', '伝統',
        'ショッピング', '買い物', 'おしゃれ', '写真', 'インスタ',
        'アウトドア', 'アクティブ', '運動', 'エンタメ', '楽しい',
        'カップル', '二人', 'デート', '記念日', '特別'
    ];
    
    const keywords = [];
    
    // デート関連キーワードのチェック
    dateKeywords.forEach(keyword => {
        if (query.includes(keyword)) {
            keywords.push(keyword);
        }
    });
    
    // 単語分割で追加キーワード抽出
    const words = query.split(/[\s\u3000]+/).filter(word => word.length > 0);
    keywords.push(...words);
    
    return [...new Set(keywords)]; // 重複を削除
}

// スポットスコア計算
function calculateSpotScore(spot, keywords) {
    let score = 0;
    
    // ジャンルの一致
    if (keywords.some(keyword => spot.genre.toLowerCase().includes(keyword))) {
        score += 3;
    }
    
    // 都道府県の一致
    if (keywords.some(keyword => spot.prefecture.toLowerCase().includes(keyword))) {
        score += 2;
    }
    
    // タグの一致
    if (spot.tags) {
        const tagMatches = keywords.filter(keyword => 
            spot.tags.some(tag => tag.toLowerCase().includes(keyword))
        ).length;
        score += tagMatches * 2;
    }
    
    // 名前の一致
    if (keywords.some(keyword => spot.name.toLowerCase().includes(keyword))) {
        score += 2;
    }
    
    // 説明文の一致
    const descriptionMatches = keywords.filter(keyword => 
        spot.description.toLowerCase().includes(keyword)
    ).length;
    score += descriptionMatches;
    
    return score;
}

// 検索結果の表示
function displayResults(spots) {
    hideLoading();
    currentResults = spots;

    if (spots.length === 0) {
        showNoResults();
        return;
    }

    hideNoResults();
    renderSpots(spots);
}

// スポットカードのレンダリング
function renderSpots(spots) {
    results.innerHTML = '';
    
    spots.forEach(spot => {
        const spotCard = createSpotCard(spot);
        results.appendChild(spotCard);
    });
}

// スポットカードの作成
function createSpotCard(spot) {
    const card = document.createElement('div');
    card.className = 'spot-card';
    
    // データ正確性チェック - 座標の有効性を確認
    const isValidData = spot.name && spot.prefecture && spot.genre;
    const hasValidCoordinates = spot.lat && spot.lng && 
                               spot.lat !== 0 && spot.lng !== 0 &&
                               spot.lat >= 24 && spot.lat <= 46 &&
                               spot.lng >= 122 && spot.lng <= 146;
    const needsVerification = !isValidData || !hasValidCoordinates;
    
    // タグのHTML生成
    const tagsHtml = spot.tags ? 
        `<div class="spot-tags">
            ${spot.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>` : '';
    
    // 情報確認中ラベル
    const verificationLabel = needsVerification ? 
        `<div class="verification-badge">⚠️ 情報確認中</div>` : '';
    
    // Generate image HTML - use Leaflet.js map if lat/lng available
    let imageHtml = '';
    if (spot.lat && spot.lng) {
        // Use Leaflet.js for interactive map with marker
        const mapId = `map-${spot.id}`;
        imageHtml = `<div id="${mapId}" class="leaflet-map"></div>`;
    } else {
        // Use auto-generated Unsplash URL or existing imageUrl
        const imageUrl = spot.imageUrl || generateUnsplashUrl(spot.name, spot.genre);
        imageHtml = `<img src="${imageUrl}" alt="${spot.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span class=\\'spot-image-placeholder\\'>${getSpotEmoji('${spot.genre}')}</span>'">`;
    }
    
    // Generate navigation URL
    const navigationUrl = spot.lat && spot.lng 
        ? `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(spot.name)}`;
    
    card.innerHTML = `
        <div class="spot-image">
            ${imageHtml}
        </div>
        <div class="spot-content">
            ${verificationLabel}
            <h3 class="spot-name">${spot.name}</h3>
            <div class="spot-info">
                <div class="spot-detail">
                    <span class="icon">📍</span>
                    <span>${spot.prefecture}</span>
                </div>
                <div class="spot-detail">
                    <span class="icon">🏷️</span>
                    <span>${spot.genre}</span>
                </div>
            </div>
            <p class="spot-description">${spot.description}</p>
            ${tagsHtml}
            <button class="map-button" onclick="event.stopPropagation(); openGoogleMaps('${spot.name}')">
                🗺️ ここへ行く（地図を開く）
            </button>
            <button class="instagram-button" onclick="event.stopPropagation(); openInstagram('${spot.name}')">
                📸 インスタで写真を見る
            </button>
        </div>
    `;
    
    // Make entire card clickable for navigation
    card.addEventListener('click', () => {
        window.open(navigationUrl, '_blank');
    });
    
    // Initialize Leaflet map if lat/lng available
    if (spot.lat && spot.lng) {
        const mapId = `map-${spot.id}`;
        
        // Wait for card to be added to DOM, then initialize map
        setTimeout(() => {
            const mapContainer = document.getElementById(mapId);
            
            if (mapContainer) {
                // Clear any existing content
                mapContainer.innerHTML = '';
                
                // Force CSS to be applied
                mapContainer.style.height = '200px';
                mapContainer.style.display = 'block';
                mapContainer.style.minHeight = '200px';
                mapContainer.style.width = '100%';
                
                // Show loading placeholder
                mapContainer.innerHTML = '<div class="map-loading">地図を生成中...</div>';
                
                // Wait additional time to ensure DOM is fully ready
                setTimeout(() => {
                    try {
                        if (typeof L !== 'undefined') {
                            // Clear loading placeholder
                            mapContainer.innerHTML = '';
                            
                            // Initialize map with forced options
                            const map = L.map(mapId, {
                                center: [spot.lat, spot.lng],
                                zoom: 16,
                                zoomControl: false,
                                attributionControl: false
                            });
                            
                            // Add tile layer
                            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                            });
                            
                            // Handle tile loading errors
                            tileLayer.on('tileerror', () => {
                                mapContainer.innerHTML = `
                                    <div class="map-error">
                                        <p>地図の読み込みに失敗しました</p>
                                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}" target="_blank" class="map-fallback-link">
                                            Google Mapsで開く
                                        </a>
                                    </div>
                                `;
                            });
                            
                            tileLayer.addTo(map);
                            
                            // Add red marker
                            const marker = L.marker([spot.lat, spot.lng], {
                                icon: L.divIcon({
                                    className: 'custom-marker',
                                    html: '<div style="background-color: #EF4444; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                                    iconSize: [30, 30],
                                    iconAnchor: [15, 30]
                                })
                            }).addTo(map);
                            
                            // Add popup
                            marker.bindPopup(`<b>${spot.name}</b><br>${spot.prefecture}`);
                            
                            // Force invalidateSize after map is initialized (multiple calls to ensure it works)
                            setTimeout(() => {
                                map.invalidateSize();
                            }, 200);
                            setTimeout(() => {
                                map.invalidateSize();
                            }, 500);
                            setTimeout(() => {
                                map.invalidateSize();
                            }, 1000);
                        }
                    } catch (error) {
                        mapContainer.innerHTML = `
                            <div class="map-error">
                                <p>地図の読み込みに失敗しました</p>
                                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}" target="_blank" class="map-fallback-link">
                                    Google Mapsで開く
                                </a>
                            </div>
                        `;
                    }
                }, 500);
            }
        }, 100);
    }
    
    return card;
}

// スポット名からUnsplash画像URLを生成
function generateUnsplashUrl(spotName, genre) {
    const keywords = `${spotName} ${genre}`;
    const encodedKeywords = encodeURIComponent(keywords);
    // Unsplash Source APIを使用してキーワードから画像を取得
    return `https://source.unsplash.com/800x600/?${encodedKeywords}`;
}

// ジャンルに応じた絵文字を取得
function getSpotEmoji(genre) {
    const emojiMap = {
        'レストラン': '🍽️',
        'カフェ': '☕',
        'エンターテイメント': '🎢',
        'アウトドア': '🌳',
        'ショッピング': '🛍️',
        '観光': '🏛️',
        'ドライブ': '🚗',
        'default': '📍'
    };
    return emojiMap[genre] || emojiMap['default'];
}

// Google Maps ナビゲーション開始
function openGoogleMaps(spotName) {
    const searchQuery = encodeURIComponent(spotName);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    window.open(googleMapsUrl, '_blank');
}

// Instagram 統合
function openInstagram(spotName) {
    const tag = encodeURIComponent(spotName);
    const instagramUrl = `https://www.instagram.com/explore/tags/${tag}/`;
    window.open(instagramUrl, '_blank');
}

// ローディング表示
function showLoading() {
    loading.classList.remove('hidden');
    noResults.classList.add('hidden');
    results.innerHTML = '';
}

// ローディング非表示
function hideLoading() {
    loading.classList.add('hidden');
}

// 結果なし表示
function showNoResults() {
    noResults.classList.remove('hidden');
    results.innerHTML = '';
}

// 結果なし非表示
function hideNoResults() {
    noResults.classList.add('hidden');
}

// 初期表示時に全スポットを表示
function initializeApp() {
    // 初期状態では全スポットを表示
    displayResults(dateSpots);
    
    // 自由入力欄にプレースホルダーサンプルを表示
    updatePlaceholderExamples();
}

// プレースホルダーの例を更新
function updatePlaceholderExamples() {
    const examples = [
        '夜景が綺麗な静かな場所',
        '富士山が見えるドライブコース',
        '無料で楽しめるカフェ',
        'ロマンチックな温泉',
        '海辺の散策コース',
        '歴史的な観光地'
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    freeInput.placeholder = `例：${randomExample}`;
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', initializeApp);

// Force map redraw on window load
window.addEventListener('load', () => {
    setTimeout(() => {
        const iframes = document.querySelectorAll('.spot-image iframe');
        iframes.forEach(iframe => {
            iframe.style.width = '100%';
            iframe.style.height = '100%';
        });
    }, 500);
});

// キーボードショートカット対応
document.addEventListener('keydown', (e) => {
    // Enterキーで検索
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (document.activeElement === freeInput) {
            performAISearch();
        } else {
            performTraditionalSearch();
        }
    }
    
    // Escapeキーで検索条件をリセット
    if (e.key === 'Escape') {
        resetSearch();
    }
});

// 検索条件のリセット
function resetSearch() {
    prefectureSelect.value = '';
    genreSelect.value = '';
    budgetSelect.value = '';
    displayResults(dateSpots);
}

// スムーズスクロール機能
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// 検索ボタンのホバーエフェクト強化
searchBtn.addEventListener('mouseenter', () => {
    searchBtn.style.transform = 'translateY(-2px) scale(1.02)';
});

searchBtn.addEventListener('mouseleave', () => {
    searchBtn.style.transform = '';
});

// フォーム要素のフォーカスエフェクト
[prefectureSelect, genreSelect, budgetSelect].forEach(select => {
    select.addEventListener('focus', () => {
        select.parentElement.style.transform = 'scale(1.02)';
        select.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    select.addEventListener('blur', () => {
        select.parentElement.style.transform = '';
    });
});

// レスポンシブ対応の動的調整
function adjustForMobile() {
    if (window.innerWidth <= 768) {
        // モバイル用の調整
        results.style.gridTemplateColumns = '1fr';
    } else {
        // デスクトップ用の調整
        results.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    }
}

// ウィンドウリサイズ時の調整
window.addEventListener('resize', adjustForMobile);

// 初期化時にモバイル対応を適用
adjustForMobile();

// ページ読み込み完了から0.5秒後にすべての地図コンポーネントにinvalidateSizeを実行
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('.leaflet-map').forEach(mapContainer => {
            if (mapContainer._leaflet_id) {
                const map = L.Map._find(mapContainer);
                if (map) {
                    map.invalidateSize();
                }
            }
        });
    }, 500);
});

// ============================================
// 日本地図から探す機能
// ============================================

// 地域ごとの県データ
const regionData = {
    hokkaido: {
        name: '北海道',
        prefectures: ['北海道']
    },
    tohoku: {
        name: '東北',
        prefectures: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県']
    },
    kanto: {
        name: '関東',
        prefectures: ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '栃木県', '群馬県']
    },
    chubu: {
        name: '中部',
        prefectures: ['愛知県', '岐阜県', '三重県', '静岡県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県']
    },
    kinki: {
        name: '近畿',
        prefectures: ['大阪府', '京都府', '兵庫県', '奈良県', '和歌山県', '滋賀県']
    },
    chugoku: {
        name: '中国',
        prefectures: ['広島県', '岡山県', '鳥取県', '島根県', '山口県']
    },
    shikoku: {
        name: '四国',
        prefectures: ['香川県', '徳島県', '愛媛県', '高知県']
    },
    kyushu: {
        name: '九州',
        prefectures: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
    }
};

// DOM要素
const japanMap = document.getElementById('japanMap');
const regionButtonsMobile = document.getElementById('regionButtonsMobile');
const prefectureSelection = document.getElementById('prefectureSelection');
const prefectureSelectionTitle = document.getElementById('prefectureSelectionTitle');
const prefectureButtons = document.getElementById('prefectureButtons');
const backBtn = document.getElementById('backBtn');

// 地域クリックイベント
function handleRegionClick(regionId) {
    const region = regionData[regionId];
    if (!region) return;

    // 県一覧を表示
    showPrefectureSelection(region);

    // 地域ボタンのアクティブ状態を更新
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.region === regionId) {
            btn.classList.add('active');
        }
    });
}

// 県クリックイベント（直接県をクリックした場合）
function handlePrefectureClickFromMap(prefecture) {
    // 都道府県セレクトボックスを更新
    prefectureSelect.value = prefecture;

    // スポットをフィルタリングして表示
    performTraditionalSearch();

    // 検索結果までスクロール
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// 県一覧を表示
function showPrefectureSelection(region) {
    prefectureSelectionTitle.textContent = `${region.name} - 県を選択`;
    prefectureButtons.innerHTML = '';

    region.prefectures.forEach(prefecture => {
        const btn = document.createElement('button');
        btn.className = 'prefecture-btn';
        btn.textContent = prefecture;
        btn.onclick = () => handlePrefectureClick(prefecture);
        prefectureButtons.appendChild(btn);
    });

    prefectureSelection.style.display = 'block';
}

// 県クリックイベント
function handlePrefectureClick(prefecture) {
    // 県選択ボタンのアクティブ状態を更新
    document.querySelectorAll('.prefecture-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === prefecture) {
            btn.classList.add('active');
        }
    });

    // 都道府県セレクトボックスを更新
    prefectureSelect.value = prefecture;

    // スポットをフィルタリングして表示
    performTraditionalSearch();

    // 検索結果までスクロール
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// 地図に戻るボタン
backBtn.addEventListener('click', () => {
    prefectureSelection.style.display = 'none';
    regionButtons.style.display = 'grid';

    // アクティブ状態をリセット
    document.querySelectorAll('.region-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.prefecture-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 都道府県セレクトボックスをリセット
    prefectureSelect.value = '';
});

// 地域ボタンのクリックイベント
document.querySelectorAll('.region-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        handleRegionClick(btn.dataset.region);
    });
});
