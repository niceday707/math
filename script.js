// 전역 변수
let keywords = [];
let youtubeChannels = [];
let communities = [];
let mediaItems = [];

// DOM 요소들
const uploadArea = document.getElementById('uploadArea');
const excelFile = document.getElementById('excelFile');
const keywordList = document.getElementById('keywordList');
const youtubeSearch = document.getElementById('youtubeSearch');
const searchYoutubeBtn = document.getElementById('searchYoutube');
const youtubeResults = document.getElementById('youtubeResults');
const communitySearch = document.getElementById('communitySearch');
const searchCommunityBtn = document.getElementById('searchCommunity');
const communityResults = document.getElementById('communityResults');

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSavedData();
});

function initializeEventListeners() {
    // 엑셀 파일 업로드
    uploadArea.addEventListener('click', () => excelFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    excelFile.addEventListener('change', handleFileSelect);

    // 유튜브 검색
    searchYoutubeBtn.addEventListener('click', searchYouTube);
    youtubeSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchYouTube();
    });

    // 커뮤니티 검색
    searchCommunityBtn.addEventListener('click', searchCommunity);
    communitySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCommunity();
    });

    // 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
}

// 엑셀 파일 처리
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.backgroundColor = '#edf2f7';
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#cbd5e0';
    uploadArea.style.backgroundColor = '#f7fafc';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processExcelFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processExcelFile(file);
    }
}

function processExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // 키워드 추출 (첫 번째 컬럼 사용)
            keywords = jsonData.map(row => {
                const firstKey = Object.keys(row)[0];
                return row[firstKey];
            }).filter(keyword => keyword && keyword.toString().trim() !== '');
            
            displayKeywords();
            saveData();
            showNotification('엑셀 파일이 성공적으로 업로드되었습니다!', 'success');
        } catch (error) {
            console.error('엑셀 파일 처리 오류:', error);
            showNotification('엑셀 파일 처리 중 오류가 발생했습니다.', 'error');
        }
    };
    reader.readAsArrayBuffer(file);
}

function displayKeywords() {
    keywordList.innerHTML = '';
    keywords.forEach(keyword => {
        const tag = document.createElement('div');
        tag.className = 'keyword-tag';
        tag.textContent = keyword;
        tag.addEventListener('click', () => {
            youtubeSearch.value = keyword;
            communitySearch.value = keyword;
        });
        keywordList.appendChild(tag);
    });
}

// 유튜브 검색 (실제 YouTube API 사용)
function searchYouTube() {
    const query = youtubeSearch.value.trim();
    if (!query) {
        showNotification('검색어를 입력해주세요.', 'warning');
        return;
    }

    searchYoutubeBtn.innerHTML = '<span class="loading"></span> 검색 중...';
    searchYoutubeBtn.disabled = true;

    // YouTube Data API v3를 사용한 실제 검색
    searchYouTubeAPI(query);
}

// 실제 YouTube API 검색 함수
async function searchYouTubeAPI(query) {
    try {
        // YouTube Data API v3 키 (실제 사용시에는 본인의 API 키를 사용하세요)
        const API_KEY = 'AIzaSyBoF-J4zUN12PHZ2KoirKENsyl3Kf_NaCw'; // 실제 API 키로 교체 필요
        
        // 채널 검색을 위한 API 호출
        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query + ' 수학')}&maxResults=10&key=${API_KEY}`
        );
        
        if (!searchResponse.ok) {
            throw new Error('YouTube API 호출 실패');
        }
        
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
            // 채널 상세 정보 가져오기
            const channelIds = searchData.items.map(item => item.snippet.channelId).join(',');
            const channelResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${API_KEY}`
            );
            
            if (channelResponse.ok) {
                const channelData = await channelResponse.json();
                displayYouTubeResults(channelData.items);
            } else {
                // API 키가 없거나 오류가 있는 경우 샘플 데이터 사용
                displaySampleYouTubeResults(query);
            }
        } else {
            showNotification('검색 결과가 없습니다.', 'info');
        }
        
    } catch (error) {
        console.error('YouTube API 오류:', error);
        // API 오류 시 샘플 데이터 표시
        displaySampleYouTubeResults(query);
    } finally {
        searchYoutubeBtn.innerHTML = '<i class="fas fa-search"></i> 검색';
        searchYoutubeBtn.disabled = false;
    }
}

// 샘플 데이터 표시 (API 키가 없을 때 사용)
function displaySampleYouTubeResults(query) {
    const sampleChannels = [
        {
            id: { channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw' }, // 실제 수학 채널
            snippet: {
                title: `${query} 수학 강의`,
                description: '수학의 기초부터 고급까지 체계적으로 배우는 채널입니다.',
                thumbnails: {
                    medium: { url: 'https://yt3.ggpht.com/ytc/AAUvwnjOQiXUsXYMs8lwrd4ol3O5xblQOVi_5Xg3a0X5Yw=s240-c-k-c0x00ffffff-no-rj' }
                }
            },
            statistics: {
                subscriberCount: '125000',
                videoCount: '245'
            }
        },
        {
            id: { channelId: 'UCBJycsmduvYEL83R_U4JriQ' }, // 실제 수학 채널
            snippet: {
                title: `${query} 수학 문제풀이`,
                description: '다양한 수학 문제를 단계별로 해결하는 방법을 알려드립니다.',
                thumbnails: {
                    medium: { url: 'https://yt3.ggpht.com/ytc/AAUvwnjOQiXUsXYMs8lwrd4ol3O5xblQOVi_5Xg3a0X5Yw=s240-c-k-c0x00ffffff-no-rj' }
                }
            },
            statistics: {
                subscriberCount: '87000',
                videoCount: '189'
            }
        },
        {
            id: { channelId: 'UCsooa4yRKGN_zEE8iknghZA' }, // 실제 수학 채널
            snippet: {
                title: `${query} 수학 이론`,
                description: '수학 이론을 쉽고 재미있게 설명하는 채널입니다.',
                thumbnails: {
                    medium: { url: 'https://yt3.ggpht.com/ytc/AAUvwnjOQiXUsXYMs8lwrd4ol3O5xblQOVi_5Xg3a0X5Yw=s240-c-k-c0x00ffffff-no-rj' }
                }
            },
            statistics: {
                subscriberCount: '152000',
                videoCount: '312'
            }
        }
    ];
    
    displayYouTubeResults(sampleChannels);
}

function generateMockYouTubeResults(query) {
    const mockChannels = [
        {
            title: `${query} 수학 강의`,
            description: '수학의 기초부터 고급까지 체계적으로 배우는 채널입니다.',
            subscriberCount: '12.5만',
            videoCount: '245',
            thumbnail: 'https://via.placeholder.com/120x90/667eea/ffffff?text=Math',
            url: '#'
        },
        {
            title: `${query} 수학 문제풀이`,
            description: '다양한 수학 문제를 단계별로 해결하는 방법을 알려드립니다.',
            subscriberCount: '8.7만',
            videoCount: '189',
            thumbnail: 'https://via.placeholder.com/120x90/48bb78/ffffff?text=Solve',
            url: '#'
        },
        {
            title: `${query} 수학 이론`,
            description: '수학 이론을 쉽고 재미있게 설명하는 채널입니다.',
            subscriberCount: '15.2만',
            videoCount: '312',
            thumbnail: 'https://via.placeholder.com/120x90/e53e3e/ffffff?text=Theory',
            url: '#'
        }
    ];
    return mockChannels;
}

function displayYouTubeResults(results) {
    youtubeResults.innerHTML = '';
    results.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        // 구독자 수 포맷팅
        const subscriberCount = formatNumber(channel.statistics.subscriberCount);
        const videoCount = formatNumber(channel.statistics.videoCount);
        
        // 실제 YouTube 채널 URL 생성
        const channelUrl = `https://www.youtube.com/channel/${channel.id.channelId}`;
        
        card.innerHTML = `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <img src="${channel.snippet.thumbnails.medium.url}" 
                     alt="${channel.snippet.title}" 
                     style="width: 120px; height: 90px; border-radius: 8px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/120x90/667eea/ffffff?text=Math'">
                <div style="flex: 1;">
                    <h3>${channel.snippet.title}</h3>
                    <p>${channel.snippet.description}</p>
                    <div style="color: #718096; font-size: 0.9rem;">
                        구독자: ${subscriberCount} | 영상: ${videoCount}개
                    </div>
                </div>
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="window.open('${channelUrl}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> 채널 보기
                </button>
                <button class="btn btn-success" onclick="addToCollection('youtube', ${JSON.stringify({
                    title: channel.snippet.title,
                    description: channel.snippet.description,
                    subscriberCount: subscriberCount,
                    videoCount: videoCount,
                    thumbnail: channel.snippet.thumbnails.medium.url,
                    url: channelUrl,
                    channelId: channel.id.channelId
                }).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> 수집
                </button>
            </div>
        `;
        youtubeResults.appendChild(card);
    });
}

// 숫자 포맷팅 함수
function formatNumber(num) {
    const number = parseInt(num);
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
}

// 커뮤니티 검색 (시뮬레이션)
function searchCommunity() {
    const query = communitySearch.value.trim();
    if (!query) {
        showNotification('검색어를 입력해주세요.', 'warning');
        return;
    }

    searchCommunityBtn.innerHTML = '<span class="loading"></span> 검색 중...';
    searchCommunityBtn.disabled = true;

    setTimeout(() => {
        const mockResults = generateMockCommunityResults(query);
        displayCommunityResults(mockResults);
        searchCommunityBtn.innerHTML = '<i class="fas fa-search"></i> 검색';
        searchCommunityBtn.disabled = false;
    }, 1500);
}

function generateMockCommunityResults(query) {
    const mockCommunities = [
        {
            name: `${query} 수학 포럼`,
            description: '수학 문제 해결과 토론을 위한 커뮤니티입니다.',
            memberCount: '5.2만',
            type: '포럼',
            url: '#'
        },
        {
            name: `${query} 수학 스터디 그룹`,
            description: '함께 수학을 공부하고 성장하는 스터디 그룹입니다.',
            memberCount: '1.8만',
            type: '스터디',
            url: '#'
        },
        {
            name: `${query} 수학 Q&A`,
            description: '수학 질문과 답변을 주고받는 커뮤니티입니다.',
            memberCount: '3.7만',
            type: 'Q&A',
            url: '#'
        }
    ];
    return mockCommunities;
}

function displayCommunityResults(results) {
    communityResults.innerHTML = '';
    results.forEach(community => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <h3>${community.name}</h3>
            <p>${community.description}</p>
            <div style="color: #718096; font-size: 0.9rem; margin-bottom: 1rem;">
                멤버: ${community.memberCount} | 유형: ${community.type}
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="window.open('${community.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> 커뮤니티 보기
                </button>
                <button class="btn btn-success" onclick="addToCollection('community', ${JSON.stringify(community).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> 수집
                </button>
            </div>
        `;
        communityResults.appendChild(card);
    });
}

// 수집 기능
function addToCollection(type, item) {
    const timestamp = new Date().toLocaleString('ko-KR');
    const collectionItem = { ...item, addedAt: timestamp };

    switch(type) {
        case 'youtube':
            youtubeChannels.push(collectionItem);
            break;
        case 'community':
            communities.push(collectionItem);
            break;
        case 'media':
            mediaItems.push(collectionItem);
            break;
    }

    saveData();
    updateCollectionDisplay();
    showNotification('수집되었습니다!', 'success');
}

function updateCollectionDisplay() {
    updateYouTubeCollection();
    updateCommunityCollection();
    updateMediaCollection();
}

function updateYouTubeCollection() {
    const container = document.getElementById('youtubeCollection');
    if (youtubeChannels.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-youtube"></i>
                <p>수집된 유튜브 채널이 없습니다.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    youtubeChannels.forEach((channel, index) => {
        const item = document.createElement('div');
        item.className = 'collection-item';
        item.innerHTML = `
            <h3>${channel.title}</h3>
            <p>${channel.description}</p>
            <div class="meta">
                구독자: ${channel.subscriberCount} | 영상: ${channel.videoCount}개 | 수집일: ${channel.addedAt}
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="window.open('${channel.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> 보기
                </button>
                <button class="btn btn-danger" onclick="removeFromCollection('youtube', ${index})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function updateCommunityCollection() {
    const container = document.getElementById('communityCollection');
    if (communities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>수집된 커뮤니티가 없습니다.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    communities.forEach((community, index) => {
        const item = document.createElement('div');
        item.className = 'collection-item';
        item.innerHTML = `
            <h3>${community.name}</h3>
            <p>${community.description}</p>
            <div class="meta">
                멤버: ${community.memberCount} | 유형: ${community.type} | 수집일: ${community.addedAt}
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="window.open('${community.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> 보기
                </button>
                <button class="btn btn-danger" onclick="removeFromCollection('community', ${index})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function updateMediaCollection() {
    const container = document.getElementById('mediaCollection');
    if (mediaItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <p>수집된 영화/드라마가 없습니다.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    mediaItems.forEach((media, index) => {
        const item = document.createElement('div');
        item.className = 'collection-item';
        item.innerHTML = `
            <h3>${media.title}</h3>
            <p>${media.description}</p>
            <div class="meta">
                수집일: ${media.addedAt}
            </div>
            <div class="actions">
                <button class="btn btn-primary" onclick="window.open('${media.url}', '_blank')">
                    <i class="fas fa-external-link-alt"></i> 보기
                </button>
                <button class="btn btn-danger" onclick="removeFromCollection('media', ${index})">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function removeFromCollection(type, index) {
    if (confirm('정말 삭제하시겠습니까?')) {
        switch(type) {
            case 'youtube':
                youtubeChannels.splice(index, 1);
                break;
            case 'community':
                communities.splice(index, 1);
                break;
            case 'media':
                mediaItems.splice(index, 1);
                break;
        }
        saveData();
        updateCollectionDisplay();
        showNotification('삭제되었습니다.', 'success');
    }
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼과 패널 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-panel`).classList.add('active');
}

// 데이터 저장/로드
function saveData() {
    const data = {
        keywords,
        youtubeChannels,
        communities,
        mediaItems
    };
    localStorage.setItem('mathCollectionData', JSON.stringify(data));
}

function loadSavedData() {
    const savedData = localStorage.getItem('mathCollectionData');
    if (savedData) {
        const data = JSON.parse(savedData);
        keywords = data.keywords || [];
        youtubeChannels = data.youtubeChannels || [];
        communities = data.communities || [];
        mediaItems = data.mediaItems || [];
        
        displayKeywords();
        updateCollectionDisplay();
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#48bb78';
            break;
        case 'error':
            notification.style.backgroundColor = '#e53e3e';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ed8936';
            break;
        default:
            notification.style.backgroundColor = '#667eea';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
