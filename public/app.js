/**
 * MyCarbons (MarineRadar) - Client-Side JavaScript Logic
 * Canlı API Bağlantısı, Scrape Tetikleyicileri, Dynamic Filtering, Toast Notifications & Newsletter Modal
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
  statCardNewsletter: document.getElementById('stat-card-newsletter'),

  // Kontrol Elemanları
  searchInput: document.getElementById('search-input'),
  categoryTabs: document.getElementById('category-tabs'),
  btnScrapeRss: document.getElementById('btn-scrape-rss'),
  btnScrapeHtml: document.getElementById('btn-scrape-html'),
  btnGenerateNewsletter: document.getElementById('btn-generate-newsletter'),

  // İçerik Alanları
  newsGridContainer: document.getElementById('news-grid-container'),
  visibleCountBadge: document.getElementById('visible-count-badge'),
  toastContainer: null,

  // Modallar
  newsletterModal: document.getElementById('newsletter-modal'),
  newsletterModalContent: document.getElementById('newsletter-modal-content'),
  btnCloseNewsletterModal: document.getElementById('btn-close-newsletter-modal'),
  
  archiveModal: document.getElementById('archive-modal'),
  archiveModalContent: document.getElementById('archive-modal-content'),
  btnCloseArchiveModal: document.getElementById('btn-close-archive-modal'),
  linkOpenArchive: document.getElementById('link-open-archive')
};

/**
 * Sayfa Yüklendiğinde Başlatıcı
 */
document.addEventListener('DOMContentLoaded', () => {
  initToastContainer();
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
 * Toast Bildirim Konteynırını İlklendirme
 */
function initToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  DOM.toastContainer = container;
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-card);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: var(--text-heading); margin-bottom: 0.5rem;">Aranan Kriterlere Uygun Haber Bulunamadı</h3>
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
  const sourceName = news.author || 'MarineRadar Scraper';
  const targetUrl = news.link || '#';

  return `
    <article class="news-card" data-id="${news._id}">
      <div>
        <div class="card-top-bar">
          <span class="category-tag ${categoryClass}">${escapeHTML(news.category || 'General')}</span>
          <div class="impact-badge" style="${isHighImpact ? 'background: #DCFCE7; border-color: rgba(22, 163, 74, 0.4); color: #15803D; box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);' : ''}">
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
 * Event Listener Bağlantıları & Tetikleyiciler
 */
function setupEventListeners() {
  // 1. Arama Girdisi Dinleyicisi (Live Search)
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

      DOM.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      tabBtn.classList.add('active');

      appState.activeCategory = tabBtn.dataset.category || 'all';
      renderNewsGrid();
    });
  }

  // 3. RSS Şimdi Kazı Butonu Dinleyicisi (POST /api/news/scrape/rss)
  if (DOM.btnScrapeRss) {
    DOM.btnScrapeRss.addEventListener('click', async () => {
      await handleScrapeTrigger(DOM.btnScrapeRss, '/api/news/scrape/rss', 'RSS');
    });
  }

  // 4. HTML Web Kazı Butonu Dinleyicisi (POST /api/news/scrape/html)
  if (DOM.btnScrapeHtml) {
    DOM.btnScrapeHtml.addEventListener('click', async () => {
      await handleScrapeTrigger(DOM.btnScrapeHtml, '/api/news/scrape/html', 'HTML Web');
    });
  }

  // 5. Bülten Derle Butonu Dinleyicisi (POST /api/newsletters/generate)
  if (DOM.btnGenerateNewsletter) {
    DOM.btnGenerateNewsletter.addEventListener('click', async () => {
      await handleGenerateNewsletter();
    });
  }

  // 6. Arşiv Açma Dinleyicileri
  if (DOM.statCardNewsletter) {
    DOM.statCardNewsletter.addEventListener('click', () => openArchiveModal());
  }
  if (DOM.linkOpenArchive) {
    DOM.linkOpenArchive.addEventListener('click', (e) => {
      e.preventDefault();
      openArchiveModal();
    });
  }

  // 7. Modal Kapatma Dinleyicileri
  if (DOM.btnCloseNewsletterModal) {
    DOM.btnCloseNewsletterModal.addEventListener('click', () => closeModal(DOM.newsletterModal));
  }
  if (DOM.btnCloseArchiveModal) {
    DOM.btnCloseArchiveModal.addEventListener('click', () => closeModal(DOM.archiveModal));
  }

  // Modal Dışına Tıklayınca ve ESC Tuşu ile Kapatma
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(DOM.newsletterModal);
      closeModal(DOM.archiveModal);
    }
  });
}

/**
 * Kazıma API Tetikleyici Mantığı ve Buton Yüklenme Yönetimi
 */
async function handleScrapeTrigger(button, endpointUrl, serviceName) {
  const originalHTML = button.innerHTML;
  
  // Yüklenme durumu
  button.disabled = true;
  button.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    Kazınıyor...
  `;

  try {
    const response = await fetch(endpointUrl, { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      const added = (result.data && typeof result.data.addedCount === 'number') ? result.data.addedCount : (result.addedCount || 0);
      const toastMsg = added > 0 
        ? `${added} yeni haber veritabanına eklendi.` 
        : 'Tüm haberler güncel, yeni haber bulunamadı.';

      showToast(
        `${serviceName} Kazıma Tamamlandı`,
        toastMsg,
        false
      );

      // Verileri yeniden çek ve arayüzü güncelle
      await loadNewsData();
    } else {
      showToast('Kazıma Hatası', result.message || 'Veri çekme başarısız oldu.', true);
    }
  } catch (error) {
    console.error(`${serviceName} Kazıma Hatası:`, error);
    showToast('Bağlantı Hatası', `${serviceName} servisine erişilemedi.`, true);
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
}

/**
 * Akıllı Bülten Oluşturma Mantığı (POST /api/newsletters/generate)
 */
async function handleGenerateNewsletter() {
  const btn = DOM.btnGenerateNewsletter;
  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    Derleniyor...
  `;

  try {
    const response = await fetch('/api/newsletters/generate', { method: 'POST' });
    const result = await response.json();

    if (result.success && result.data) {
      const newsletter = result.data;
      
      // Bülten listenizi ve sayacı güncelle
      await loadNewslettersData();

      // Bülten dergi kapağı modalını derle ve aç
      renderNewsletterModalContent(newsletter);
      openModal(DOM.newsletterModal);

      showToast(
        'Bülten Başarıyla Derlendi',
        `Sayı #${newsletter.issueNumber || 1} özel bülteni başarıyla oluşturuldu!`,
        false
      );
    } else {
      showToast('Bülten Hatası', result.message || 'Bülten derlenemedi.', true);
    }
  } catch (error) {
    console.error('Bülten Üretme Hatası:', error);
    showToast('Bağlantı Hatası', 'Bülten sunucu servisine erişilemedi.', true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

/**
 * Bülten Dergi Kapağı Modal İçerik Oluşturucu
 */
function renderNewsletterModalContent(newsletter) {
  if (!DOM.newsletterModalContent) return;

  const dateStr = formatDate(newsletter.createdAt);
  const newsList = Array.isArray(newsletter.news) ? newsletter.news : [];
  const issueNum = newsletter.issueNumber || 1;

  DOM.newsletterModalContent.innerHTML = `
    <div class="magazine-cover-card">
      <div class="magazine-badge-row">
        <span class="magazine-issue-pill">🌱 MYCARBONS DIGEST • SAYI #${issueNum}</span>
        <span class="magazine-date">Yayın Tarihi: ${dateStr}</span>
      </div>

      <h3 class="magazine-title">${escapeHTML(newsletter.title || 'Denizcilik Karbonsuzlaştırma Bülteni')}</h3>
      <p class="magazine-summary">${escapeHTML(newsletter.summary || 'IMO-DCS & EU-MRV uyumlu yüksek etkili denizcilik haberlerinden derlenmiştir.')}</p>
    </div>

    <h4 class="newsletter-section-heading">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      Bültende Öne Çıkan Seçilmiş Haberler (${newsList.length})
    </h4>

    <div class="newsletter-news-list">
      ${newsList.length === 0 ? '<p style="color: var(--text-muted);">Bu bültende gösterilecek haber bulunamadı.</p>' : newsList.map(item => `
        <div class="newsletter-item-row">
          <div class="newsletter-item-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="category-tag carbon" style="font-size: 0.68rem;">${escapeHTML(item.category || 'Decarbonization')}</span>
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-green);">Etki: ${(item.impactScore || 6.0).toFixed(1)}</span>
            </div>
            <h5>${escapeHTML(item.title)}</h5>
            <p>${escapeHTML(item.summary || 'Detay açıklaması bulunmamaktadır.')}</p>
          </div>
          ${item.link ? `
            <a href="${escapeHTML(item.link)}" target="_blank" class="btn-read-more" style="white-space: nowrap;">
              Oku ➔
            </a>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Bülten Arşivi Modalı Açma ve Listeleme (GET /api/newsletters)
 */
async function openArchiveModal() {
  await loadNewslettersData();
  
  if (!DOM.archiveModalContent) return;

  const archives = appState.newsletters;

  if (archives.length === 0) {
    DOM.archiveModalContent.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
        <h4>Henüz Derlenmiş Bülten Bulunmuyor</h4>
        <p style="font-size: 0.9rem;">"Bülten Derle" butonuna basarak ilk özel bülteninizi üretebilirsiniz.</p>
      </div>
    `;
  } else {
    DOM.archiveModalContent.innerHTML = `
      <div class="archive-list">
        ${archives.map((item, index) => {
          const newsItems = Array.isArray(item.news) ? item.news : [];
          return `
            <div class="archive-card">
              <div class="archive-card-header">
                <div>
                  <span class="magazine-issue-pill" style="font-size: 0.7rem; padding: 0.2rem 0.6rem;">Sayı #${item.issueNumber || (archives.length - index)}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">${formatDate(item.createdAt)}</span>
                </div>
                <span style="font-size: 0.82rem; font-weight: 700; color: var(--brand-green);">${newsItems.length} Haber Seçildi</span>
              </div>
              <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; color: var(--text-heading); margin-bottom: 0.4rem;">${escapeHTML(item.title)}</h4>
              <p style="font-size: 0.88rem; color: var(--text-body); line-height: 1.5; margin-bottom: 0.85rem;">${escapeHTML(item.summary || '')}</p>
              
              <details style="margin-top: 0.5rem;">
                <summary style="font-size: 0.82rem; font-weight: 700; color: var(--brand-green); cursor: pointer;">Seçilen Haberleri Göster (${newsItems.length})</summary>
                <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; padding-left: 0.5rem; border-left: 2px solid var(--border-glow);">
                  ${newsItems.map(news => `
                    <div style="font-size: 0.85rem;">
                      <strong style="color: var(--text-heading);">${escapeHTML(typeof news === 'object' ? news.title : 'Haber Detayı')}</strong>
                    </div>
                  `).join('')}
                </div>
              </details>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  openModal(DOM.archiveModal);
}

/**
 * Modal Açma / Kapatma Yardımcı Fonksiyonları
 */
function openModal(modalElement) {
  if (!modalElement) return;
  modalElement.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalElement) {
  if (!modalElement) return;
  modalElement.classList.remove('active');
  document.body.style.overflow = 'auto';
}

/**
 * Yüzen Toast Bildirim Sistemi Göstericisi
 */
function showToast(title, message, isError = false) {
  if (!DOM.toastContainer) initToastContainer();

  const toast = document.createElement('div');
  toast.className = `toast-notification ${isError ? 'error' : ''}`;
  
  toast.innerHTML = `
    <div class="toast-icon">
      ${isError 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      }
    </div>
    <div class="toast-body">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
  `;

  DOM.toastContainer.appendChild(toast);

  // 4.5 Saniye Sonra Otomatik Kapanma
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 4500);
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
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; background: #FEE2E2; border-radius: var(--radius-lg); border: 1px solid #FCA5A5; color: #991B1B;">
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; margin-bottom: 0.5rem;">⚠️ Bağlantı Hatası</h3>
        <p style="font-size: 0.9rem;">${message}</p>
      </div>
    `;
  }
}
