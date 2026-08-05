/**
 * MyCarbons (MarineRadar) - Client-Side JavaScript Logic
 * Canlı API Bağlantısı, Dinamik DOM Kart Oluşturma & İstatistik Hesaplama
 */

// Uygulama İstemci Durumu (State)
const appState = {
  allNews: [],
  newsletters: [],
  activeCategory: 'all',
  searchQuery: ''
};

// DOM Eleman Başvuruları
const DOM = {
  // İstatistik Kartları
  statTotalCount: document.getElementById('stat-total-count'),
  statCarbonCount: document.getElementById('stat-carbon-count'),
  statAvgImpact: document.getElementById('stat-avg-impact'),
  statNewsletterCount: document.getElementById('stat-newsletter-count'),

  // Kontrol Elemanları
  searchInput: document.getElementById('search-input'),
  categoryTabs: document.getElementById('category-tabs'),
  btnScrapeRss: document.getElementById('btn-scrape-rss'),
  btnScrapeHtml: document.getElementById('btn-scrape-html'),
  btnGenerateNewsletter: document.getElementById('btn-generate-newsletter'),

  // İçerik Alanları
  newsGridContainer: document.getElementById('news-grid-container'),
  visibleCountBadge: document.getElementById('visible-count-badge'),
  systemStatusBadge: document.getElementById('system-status-badge')
};

/**
 * Sayfa Yüklendiğinde Başlatıcı
 */
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  await Promise.all([
    loadNewsData(),
    loadNewslettersData()
  ]);

  setupEventListeners();
}

/**
 * REST API'den Canlı Haber Verilerini Çekme (GET /api/news)
 */
async function loadNewsData() {
  try {
    const response = await fetch('/api/news');
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      appState.allNews = result.data;
      updateStats();
      renderNewsGrid();
    } else {
      showErrorState('Haberler yüklenirken sunucu hatası oluştu.');
    }
  } catch (error) {
    console.error('API Haber Verisi Çekme Hatası:', error);
    showErrorState('Sunucuya bağlanılamadı. Lütfen API servisinin çalıştığından emin olun.');
  }
}

/**
 * REST API'den Bülten Verilerini Çekme (GET /api/newsletters)
 */
async function loadNewslettersData() {
  try {
    const response = await fetch('/api/newsletters');
    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      appState.newsletters = result.data;
      if (DOM.statNewsletterCount) {
        DOM.statNewsletterCount.textContent = appState.newsletters.length;
      }
    }
  } catch (error) {
    console.warn('Bülten verisi henüz çekilemedi:', error);
  }
}

/**
 * Hero İstatistik Paneli Metriklerini Güncelleme
 */
function updateStats() {
  const news = appState.allNews;
  
  // 1. Toplam Haber Sayısı
  if (DOM.statTotalCount) {
    DOM.statTotalCount.textContent = news.length;
  }

  // 2. Karbon & Çevre Haberleri Sayısı
  const carbonCount = news.filter(item => 
    item.category === 'Carbon Emissions' || item.category === 'Clean Energy'
  ).length;
  if (DOM.statCarbonCount) {
    DOM.statCarbonCount.textContent = carbonCount;
  }

  // 3. Ortalama Etki Puanı (impactScore)
  if (news.length > 0) {
    const totalImpact = news.reduce((acc, curr) => acc + (curr.impactScore || 6.0), 0);
    const avgImpact = (totalImpact / news.length).toFixed(1);
    if (DOM.statAvgImpact) {
      DOM.statAvgImpact.textContent = avgImpact;
    }
  } else if (DOM.statAvgImpact) {
    DOM.statAvgImpact.textContent = '0.0';
  }
}

/**
 * Haber Kartları Izgarasını (News Grid) Dinamik Render Etme
 */
function renderNewsGrid() {
  if (!DOM.newsGridContainer) return;

  // Filtreleme mantığı (Kategori & Arama)
  let filteredNews = appState.allNews.filter(item => {
    const matchesCategory = appState.activeCategory === 'all' || item.category === appState.activeCategory;
    const searchLower = appState.searchQuery.toLowerCase();
    const matchesSearch = !appState.searchQuery || 
      item.title.toLowerCase().includes(searchLower) ||
      (item.summary && item.summary.toLowerCase().includes(searchLower)) ||
      (item.author && item.author.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  // Görünür Haber Sayısı Rozeti
  if (DOM.visibleCountBadge) {
    DOM.visibleCountBadge.textContent = `${filteredNews.length} haber gösteriliyor`;
  }

  // Eğer filtre sonucu haber bulunamadıysa
  if (filteredNews.length === 0) {
    DOM.newsGridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: var(--text-main); margin-bottom: 0.5rem;">Aranan Kriterlere Uygun Haber Bulunamadı</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Farklı bir arama kelimesi veya kategori seçmeyi deneyin.</p>
      </div>
    `;
    return;
  }

  // Kartları Dinamik HTML Olarak Oluşturma
  DOM.newsGridContainer.innerHTML = filteredNews.map(news => createNewsCardHTML(news)).join('');
}

/**
 * Tekil Haber Kartı HTML Şablon Oluşturucu
 */
function createNewsCardHTML(news) {
  const score = (news.impactScore || 6.0).toFixed(1);
  const isHighImpact = score >= 8.0;

  // Kategoriye göre CSS sınıfı seçimi
  let categoryClass = '';
  switch (news.category) {
    case 'Carbon Emissions': categoryClass = 'carbon'; break;
    case 'Alternative Fuels': categoryClass = 'fuel'; break;
    case 'Clean Energy': categoryClass = 'clean'; break;
    default: categoryClass = ''; break;
  }

  // Tarih ve Okuma Süresi Formatlama
  const formattedDate = formatDate(news.publishedAt || news.createdAt);
  const readTimeEst = Math.max(1, Math.ceil((news.summary || '').length / 250));
  const sourceName = news.author || 'MarineRadar Scraper';
  const targetUrl = news.link || '#';

  return `
    <article class="news-card" data-id="${news._id}">
      <div>
        <div class="card-top-bar">
          <span class="category-tag ${categoryClass}">${escapeHTML(news.category || 'General')}</span>
          <div class="impact-badge" style="${isHighImpact ? 'background: rgba(16, 185, 129, 0.2); border-color: var(--accent-green); color: var(--accent-green); box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>${score}</span>
          </div>
        </div>

        <h4 class="news-title" title="${escapeHTML(news.title)}">
          ${escapeHTML(news.title)}
        </h4>

        <p class="news-summary">
          ${escapeHTML(news.summary || 'Özet detay bilgisi mevcut değil.')}
        </p>
      </div>

      <div class="card-footer-meta">
        <div class="source-info">
          <span>⚓ ${escapeHTML(sourceName)}</span>
          <span style="opacity: 0.5;">•</span>
          <span>${formattedDate}</span>
        </div>

        <a href="${escapeHTML(targetUrl)}" target="_blank" rel="noopener noreferrer" class="btn-read-more">
          Detay
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>
    </article>
  `;
}

/**
 * Event Listener Bağlantıları
 */
function setupEventListeners() {
  // 1. Arama Girdisi Dinleyicisi
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderNewsGrid();
    });
  }

  // 2. Kategori Sekmeleri Tıklama Dinleyicisi
  if (DOM.categoryTabs) {
    DOM.categoryTabs.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-btn');
      if (!tabBtn) return;

      // Aktif sekme görünümünü değiştirme
      DOM.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      tabBtn.classList.add('active');

      appState.activeCategory = tabBtn.dataset.category || 'all';
      renderNewsGrid();
    });
  }
}

/**
 * Yardımcı Fonksiyonlar (Utilities)
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Bugün';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'Bugün';
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showErrorState(message) {
  if (DOM.newsGridContainer) {
    DOM.newsGridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-lg); border: 1px solid rgba(239, 68, 68, 0.3); color: #EF4444;">
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; margin-bottom: 0.5rem;">⚠️ Bağlantı Hatası</h3>
        <p style="font-size: 0.9rem;">${message}</p>
      </div>
    `;
  }
}
