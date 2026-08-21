/**
 * MyCarbons (MarineRadar) - Client-Side JavaScript Logic
 * Live API Connection, Scrape Triggers, Dynamic Filtering, Toast Notifications & Newsletter Modal
 */

// Application State
const appState = {
  allNews: [],
  newsletters: [],
  registeredVessels: [],
  activeCategory: 'all',
  searchQuery: '',
  authToken: null,
  currentUser: null,
  activeVesselFilter: 'all'
};

// DOM Element References
const DOM = {
  // Stat Cards
  statTotalCount: document.getElementById('stat-total-count'),
  statCarbonCount: document.getElementById('stat-carbon-count'),
  statAvgImpact: document.getElementById('stat-avg-impact'),
  statNewsletterCount: document.getElementById('stat-newsletter-count'),
  statCardNewsletter: document.getElementById('stat-card-newsletter'),

  // Controls
  searchInput: document.getElementById('search-input'),
  categoryTabs: document.getElementById('category-tabs'),
  btnRunPipeline: document.getElementById('btn-run-pipeline'),
  btnScrapeRss: document.getElementById('btn-scrape-rss'),
  btnScrapeHtml: document.getElementById('btn-scrape-html'),
  btnScrapeDeep: document.getElementById('btn-scrape-deep'),
  btnGenerateNewsletter: document.getElementById('btn-generate-newsletter'),
  userSelectDropdown: document.getElementById('user-select-dropdown'),
  vesselSelectDropdown: document.getElementById('vessel-select-dropdown'),

  // Content Areas
  newsGridContainer: document.getElementById('news-grid-container'),
  visibleCountBadge: document.getElementById('visible-count-badge'),
  toastContainer: null,

  // Modals
  newsletterModal: document.getElementById('newsletter-modal'),
  newsletterModalContent: document.getElementById('newsletter-modal-content'),
  btnCloseNewsletterModal: document.getElementById('btn-close-newsletter-modal'),
  
  archiveModal: document.getElementById('archive-modal'),
  archiveModalContent: document.getElementById('archive-modal-content'),
  btnCloseArchiveModal: document.getElementById('btn-close-archive-modal'),
  linkOpenArchive: document.getElementById('link-open-archive'),

  newsDetailModal: document.getElementById('news-detail-modal'),
  newsDetailModalContent: document.getElementById('news-detail-modal-content'),
  btnCloseDetailModal: document.getElementById('btn-close-detail-modal'),

  btnOpenLoginModal: document.getElementById('btn-open-login-modal'),
  loginFleetModal: document.getElementById('login-fleet-modal'),
  loginFleetModalContent: document.getElementById('login-fleet-modal-content'),
  btnCloseLoginModal: document.getElementById('btn-close-login-modal')
};

/**
 * DOM Load Initializer
 */
document.addEventListener('DOMContentLoaded', () => {
  initToastContainer();
  initApp();
});

async function initApp() {
  await Promise.all([
    loadNewsData(),
    loadNewslettersData(),
    loadRegisteredVessels()
  ]);

  setupEventListeners();
}

/**
 * Initialize Toast Container
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
 * Fetch Live Articles from REST API (GET /api/news)
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
      showErrorState('Failed to load articles from server.');
    }
  } catch (error) {
    console.error('API News Fetch Error:', error);
    showErrorState('Unable to connect to server. Please ensure the API service is running.');
  }
}

/**
 * Fetch Digests from REST API (GET /api/newsletters)
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
    console.warn('Digest data not yet retrieved:', error);
  }
}

/**
 * Update Hero KPI Panel Metrics
 */
function updateStats() {
  const news = appState.allNews;
  
  // 1. Total News Count
  if (DOM.statTotalCount) {
    DOM.statTotalCount.textContent = news.length;
  }

  // 2. Carbon & Green News Count
  const carbonCount = news.filter(item => 
    item.category === 'Carbon Emissions' || item.category === 'Clean Energy'
  ).length;
  if (DOM.statCarbonCount) {
    DOM.statCarbonCount.textContent = carbonCount;
  }

  // 3. Average Impact Score
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
 * Render Dynamic News Grid Component
 */
function renderNewsGrid() {
  if (!DOM.newsGridContainer) return;

  // Filter Logic (Category & Search)
  let filteredNews = appState.allNews.filter(item => {
    const matchesCategory = appState.activeCategory === 'all' || item.category === appState.activeCategory;
    const searchLower = appState.searchQuery.toLowerCase();
    const matchesSearch = !appState.searchQuery || 
      item.title.toLowerCase().includes(searchLower) ||
      (item.summary && item.summary.toLowerCase().includes(searchLower)) ||
      (item.author && item.author.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  // Visible Count Badge
  if (DOM.visibleCountBadge) {
    DOM.visibleCountBadge.textContent = `${filteredNews.length} articles displayed`;
  }

  // Empty Filter State
  if (filteredNews.length === 0) {
    DOM.newsGridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-card);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: var(--text-heading); margin-bottom: 0.5rem;">No Articles Found Matching Criteria</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Try searching with a different keyword or category.</p>
      </div>
    `;
    return;
  }

  // Render HTML Cards
  DOM.newsGridContainer.innerHTML = filteredNews.map(news => createNewsCardHTML(news)).join('');
}

/**
 * Publisher Editor and Main Feed Resolver Helper
 */
function getSourceFeedInfo(news) {
  const author = news.author || 'MarineRadar Scraper';
  const url = (news.sourceUrl || news.link || '').toLowerCase();

  let mainFeed = 'Maritime Feed';
  if (url.includes('gcaptain.com')) mainFeed = 'gCaptain';
  else if (url.includes('splash247.com')) mainFeed = 'Splash247';
  else if (url.includes('marineinsight.com')) mainFeed = 'Marine Insight';
  else if (url.includes('safety4sea.com')) mainFeed = 'Safety4Sea';

  const authorLower = author.toLowerCase();
  const feedLower = mainFeed.toLowerCase();

  if (authorLower.includes(feedLower)) {
    return `${author} (${mainFeed})`;
  }
  return `${author} • ${mainFeed}`;
}

/**
 * Single News Card HTML Template Generator
 */
function createNewsCardHTML(news) {
  const newsId = news.id || news._id;
  const score = (news.impactScore || 6.0).toFixed(1);
  const isHighImpact = score >= 8.0;

  let categoryClass = '';
  switch (news.category) {
    case 'Carbon Emissions': categoryClass = 'carbon'; break;
    case 'Alternative Fuels': categoryClass = 'fuel'; break;
    case 'Clean Energy': categoryClass = 'clean'; break;
    default: categoryClass = ''; break;
  }

  const formattedDate = formatDate(news.publishedAt || news.createdAt);
  const sourceFeedText = getSourceFeedInfo(news);
  const targetUrl = news.sourceUrl || news.link || '#';

  const vesselCount = (news.matchedVessels && Array.isArray(news.matchedVessels)) ? news.matchedVessels.length : 0;
  const vesselBadgeHTML = vesselCount > 0 ? `
    <span class="category-tag clean" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; background: #CCFBF1; color: #0D9488; border-color: rgba(13, 148, 136, 0.3);">
      ⚓ ${vesselCount} Vessel${vesselCount > 1 ? 's' : ''}
    </span>
  ` : '';

  const regs = news.regulations || [];
  const regBadgesHTML = regs.slice(0, 2).map(r => `
    <span class="category-tag fuel" style="font-size: 0.68rem; padding: 0.15rem 0.45rem; background: #FEF3C7; color: #D97706; border-color: rgba(217, 119, 6, 0.3);">
      📜 ${escapeHTML(r.code)}
    </span>
  `).join('');

  return `
    <article class="news-card" data-id="${newsId}">
      <div>
        <div class="card-top-bar" style="flex-wrap: wrap; gap: 0.35rem;">
          <span class="category-tag ${categoryClass}">${escapeHTML(news.category || 'General')}</span>
          ${vesselBadgeHTML}
          ${regBadgesHTML}
          <div class="impact-badge" style="${isHighImpact ? 'background: #DCFCE7; border-color: rgba(22, 163, 74, 0.4); color: #15803D; box-shadow: 0 2px 8px rgba(22, 163, 74, 0.2);' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>${score}</span>
          </div>
        </div>

        <h4 class="news-title" title="${escapeHTML(news.title)}">
          ${escapeHTML(news.title)}
        </h4>

        <p class="news-summary">
          ${escapeHTML(news.summary || 'No summary description available.')}
        </p>
      </div>

      <div class="card-footer-meta">
        <div class="source-info">
          <span>⚓ ${escapeHTML(sourceFeedText)}</span>
          <span style="opacity: 0.5;">•</span>
          <span>${formattedDate}</span>
        </div>

        <a href="${escapeHTML(targetUrl)}" target="_blank" rel="noopener noreferrer" class="btn-read-more" title="View Article Details">
          Details
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      </div>
    </article>
  `;
}

/**
 * Fetch Registered Fleet Vessels from REST API (GET /api/vessels)
 */
async function loadRegisteredVessels() {
  try {
    const res = await fetch('/api/vessels');
    const result = await res.json();
    if (result.success && Array.isArray(result.data)) {
      appState.registeredVessels = result.data;
      populateVesselDropdown();
    }
  } catch (e) {
    console.warn('Vessels fetch error:', e.message);
  }
}

function populateVesselDropdown() {
  if (!DOM.vesselSelectDropdown) return;
  DOM.vesselSelectDropdown.innerHTML = '<option value="all">⚓ All Fleet Vessels</option>';

  appState.registeredVessels.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id || v._id;
    opt.textContent = `🚢 ${v.vesselName} (${v.imoNumber ? 'IMO ' + v.imoNumber : v.vesselType})`;
    DOM.vesselSelectDropdown.appendChild(opt);
  });
}

async function loginUserAndLoadFleetNews(userKey) {
  if (userKey === 'public') {
    appState.authToken = null;
    appState.currentUser = null;
    hideFleetBanner();
    await loadNewsData();
    showToast('Switched to Public Feed (All News)', 'info');
    return;
  }

  const userEmail = userKey === 'userA' ? 'ahmet.armator@mycarbons.com' : 'burak.operator@mycarbons.com';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password: 'password123' })
    });
    const result = await res.json();

    if (result.success && result.token) {
      appState.authToken = result.token;
      appState.currentUser = result.user;

      // Load personalized news feed for logged in user
      await loadUserFleetNews();
      showFleetBanner(result.user);
      showToast(`Logged in as ${result.user.name} (${result.user.assignedVesselsCount} vessels)`, 'success');
    }
  } catch (err) {
    console.error('Fleet Login Error:', err);
    showToast('Failed to authenticate fleet user', 'error');
  }
}

async function loadUserFleetNews() {
  if (!appState.authToken) return;

  try {
    const res = await fetch('/api/news/my-vessels', {
      headers: { 'Authorization': `Bearer ${appState.authToken}` }
    });
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      appState.allNews = result.data;
      updateStats();
      renderNewsGrid();
    }
  } catch (err) {
    console.error('User Fleet News Error:', err);
  }
}

async function loadVesselSpecificNews(vesselId) {
  if (!vesselId || vesselId === 'all') {
    if (appState.currentUser) {
      await loadUserFleetNews();
    } else {
      await loadNewsData();
    }
    return;
  }

  try {
    const res = await fetch(`/api/news/vessel/${vesselId}`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      appState.allNews = result.data;
      updateStats();
      renderNewsGrid();
      const vesselObj = appState.registeredVessels.find(v => (v.id || v._id) === vesselId);
      const vName = vesselObj ? vesselObj.vesselName : 'Selected Vessel';
      showToast(`Filtered news for ${vName} (${result.data.length} articles)`, 'info');
    }
  } catch (e) {
    console.error('Vessel news filter error:', e);
  }
}

function showFleetBanner(user) {
  let banner = document.getElementById('user-fleet-active-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'user-fleet-active-banner';
    banner.style.cssText = 'margin-bottom: 1.25rem; background: linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%); padding: 0.9rem 1.25rem; border-radius: var(--radius-md); border: 1px solid rgba(13, 148, 136, 0.3); color: var(--text-heading); font-size: 0.92rem; font-weight: 600; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;';
    DOM.newsGridContainer.parentNode.insertBefore(banner, DOM.newsGridContainer);
  }

  const vNames = (user.assignedVessels || []).map(v => v.vesselName).join(', ');
  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.6rem;">
      <span style="font-size: 1.2rem;">🚢</span>
      <div>
        <strong style="color: #0F766E;">Personalized Fleet View Active: ${user.name}</strong>
        <p style="margin: 0; font-size: 0.82rem; color: var(--text-muted); font-weight: 500;">Assigned Vessels (${user.assignedVesselsCount}): ${vNames || 'None'}</p>
      </div>
    </div>
    <span style="font-size: 0.75rem; font-weight: 700; background: #CCFBF1; color: #0D9488; padding: 0.2rem 0.6rem; border-radius: 999px;">JWT Authenticated</span>
  `;
}

function hideFleetBanner() {
  const banner = document.getElementById('user-fleet-active-banner');
  if (banner) banner.remove();
}

/**
 * Event Listener Binding & Handlers
 */
function setupEventListeners() {
  // 1. Live Search Input Listener
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener('input', (e) => {
      appState.searchQuery = e.target.value;
      renderNewsGrid();
    });
  }

  // User Dropdown Switcher Listener
  if (DOM.userSelectDropdown) {
    DOM.userSelectDropdown.addEventListener('change', (e) => {
      const userKey = e.target.value;
      loginUserAndLoadFleetNews(userKey);
    });
  }

  // Vessel Dropdown Filter Listener
  if (DOM.vesselSelectDropdown) {
    DOM.vesselSelectDropdown.addEventListener('change', (e) => {
      const vesselId = e.target.value;
      loadVesselSpecificNews(vesselId);
    });
  }

  // 2. Category Tabs Listener
  if (DOM.categoryTabs) {
    DOM.categoryTabs.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.tab-btn');
      if (!tabBtn) return;

      DOM.categoryTabs.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      tabBtn.classList.add('active');

      const cat = tabBtn.dataset.category || 'all';

      if (cat === 'my-fleet') {
        if (!appState.currentUser) {
          DOM.userSelectDropdown.value = 'userA';
          loginUserAndLoadFleetNews('userA');
        } else {
          loadUserFleetNews();
        }
      } else {
        appState.activeCategory = cat;
        if (!appState.currentUser) {
          loadNewsData();
        } else {
          renderNewsGrid();
        }
      }
    });
  }

  // 3. Run Full Pipeline Button Listener (Aşama 33)
  if (DOM.btnRunPipeline) {
    DOM.btnRunPipeline.addEventListener('click', async () => {
      DOM.btnRunPipeline.disabled = true;
      DOM.btnRunPipeline.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Running Pipeline...';
      showToast('Executing 4-Stage Scraping Pipeline...', 'info');

      try {
        const response = await fetch('/api/news/scrape/pipeline', { method: 'POST' });
        const result = await response.json();

        if (result.success && result.data) {
          const r = result.data;
          showToast(`⚡ Pipeline Finished: +${r.rssAdded + r.htmlAdded} new items, ${r.deepScrapedCount} deep scraped, ${r.matchedVesselsCount} vessels matched, ${r.classifiedRegulationsCount} regulations tagged!`, 'success');
          await loadNewsData();
        } else {
          showToast('Pipeline execution issue: ' + (result.message || 'Unknown error'), 'error');
        }
      } catch (e) {
        console.error('Pipeline Error:', e);
        showToast('Pipeline execution failed', 'error');
      } finally {
        DOM.btnRunPipeline.disabled = false;
        DOM.btnRunPipeline.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Run Full Pipeline
        `;
      }
    });
  }

  // 4. RSS Scrape Button Listener
  if (DOM.btnScrapeRss) {
    DOM.btnScrapeRss.addEventListener('click', async () => {
      await handleScrapeTrigger(DOM.btnScrapeRss, '/api/news/scrape/rss', 'RSS');
    });
  }

  // 4. HTML Scrape Button Listener
  if (DOM.btnScrapeHtml) {
    DOM.btnScrapeHtml.addEventListener('click', async () => {
      await handleScrapeTrigger(DOM.btnScrapeHtml, '/api/news/scrape/html', 'HTML Web');
    });
  }

  // 5. Deep Scrape Button Listener
  if (DOM.btnScrapeDeep) {
    DOM.btnScrapeDeep.addEventListener('click', async () => {
      await handleScrapeTrigger(DOM.btnScrapeDeep, '/api/news/scrape/deep', 'Deep Article Scraper');
    });
  }

  // 6. Generate Newsletter Button Listener
  if (DOM.btnGenerateNewsletter) {
    DOM.btnGenerateNewsletter.addEventListener('click', async () => {
      await handleGenerateNewsletter();
    });
  }

  // 6. News Card Click Listener for Detail Modal
  if (DOM.newsGridContainer) {
    DOM.newsGridContainer.addEventListener('click', (e) => {
      const newsCard = e.target.closest('.news-card');
      if (!newsCard) return;

      const readMoreBtn = e.target.closest('a.btn-read-more');
      if (readMoreBtn) {
        e.preventDefault();
      }

      const newsId = newsCard.dataset.id;
      if (newsId) {
        openNewsDetailModal(newsId);
      }
    });
  }

  // 7. Open Archive Listeners
  if (DOM.statCardNewsletter) {
    DOM.statCardNewsletter.addEventListener('click', () => openArchiveModal());
  }
  if (DOM.linkOpenArchive) {
    DOM.linkOpenArchive.addEventListener('click', (e) => {
      e.preventDefault();
      openArchiveModal();
    });
  }

  // Open Login & Fleet Management Modal
  const openLoginBtn = document.getElementById('btn-open-login-modal');
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLoginFleetModal();
    });
  }

  // 8. Close Modal Listeners
  if (DOM.btnCloseNewsletterModal) {
    DOM.btnCloseNewsletterModal.addEventListener('click', () => {
      DOM.newsletterModal.classList.remove('active');
    });
  }

  if (DOM.btnCloseArchiveModal) {
    DOM.btnCloseArchiveModal.addEventListener('click', () => {
      DOM.archiveModal.classList.remove('active');
    });
  }

  if (DOM.btnCloseDetailModal) {
    DOM.btnCloseDetailModal.addEventListener('click', () => {
      DOM.newsDetailModal.classList.remove('active');
    });
  }

  if (DOM.btnCloseLoginModal) {
    DOM.btnCloseLoginModal.addEventListener('click', () => {
      if (DOM.loginFleetModal) DOM.loginFleetModal.classList.remove('active');
    });
  }

  // Backdrop click to close modals
  window.addEventListener('click', (e) => {
    if (e.target === DOM.newsletterModal) DOM.newsletterModal.classList.remove('active');
    if (e.target === DOM.archiveModal) DOM.archiveModal.classList.remove('active');
    if (e.target === DOM.newsDetailModal) DOM.newsDetailModal.classList.remove('active');
    if (e.target === DOM.loginFleetModal) DOM.loginFleetModal.classList.remove('active');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(DOM.newsletterModal);
      closeModal(DOM.archiveModal);
      closeModal(DOM.newsDetailModal);
    }
  });
}

/**
 * Open News Detail Modal with Dynamic Content
 */
async function openNewsDetailModal(newsId) {
  let news = null;

  try {
    const response = await fetch(`/api/news/${newsId}`);
    const result = await response.json();
    if (result.success && result.data) {
      news = result.data;
    }
  } catch (err) {
    console.error('Fetch news detail error:', err);
  }

  if (!news) {
    news = appState.allNews.find(item => (item.id || item._id) === newsId);
  }

  if (!news) {
    showToast('Article Detail Error', 'Unable to load details for the selected article.', true);
    return;
  }

  renderNewsDetailModalContent(news);
  openModal(DOM.newsDetailModal);
}

function renderNewsDetailModalContent(news) {
  if (!DOM.newsDetailModalContent) return;

  const newsId = news.id || news._id;
  const score = (news.impactScore || 6.0).toFixed(1);
  const formattedDate = formatDate(news.publishedAt || news.createdAt);
  const sourceFeedText = getSourceFeedInfo(news);
  const targetUrl = news.sourceUrl || news.link || '#';
  const isScraped = news.isFullyScraped || (news.fullContent && news.fullContent.length > 50);

  let categoryClass = '';
  switch (news.category) {
    case 'Carbon Emissions': categoryClass = 'carbon'; break;
    case 'Alternative Fuels': categoryClass = 'fuel'; break;
    case 'Clean Energy': categoryClass = 'clean'; break;
    default: categoryClass = ''; break;
  }

  // Format full content into paragraphs if available
  let fullContentHTML = '';
  if (isScraped && news.fullContent) {
    const paragraphs = news.fullContent.split('\n\n');
    fullContentHTML = paragraphs.map(p => `<p style="margin-bottom: 0.85rem; line-height: 1.6; color: var(--text-body);">${escapeHTML(p)}</p>`).join('');
  }

  DOM.newsDetailModalContent.innerHTML = `
    <div class="news-detail-wrap">
      <div class="news-detail-header">
        <div class="news-detail-meta-bar">
          <span class="news-detail-source">📡 Source & Parent Feed: ${escapeHTML(sourceFeedText)}</span>
          <span class="news-detail-date">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${formattedDate}
          </span>
        </div>

        <h2 class="news-detail-title">${escapeHTML(news.title)}</h2>

        <div class="news-detail-badges" style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <span class="category-tag ${categoryClass}">${escapeHTML(news.category || 'General')}</span>
          <div class="impact-badge" style="background: #DCFCE7; border-color: rgba(22, 163, 74, 0.4); color: #15803D;">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>Impact Score: ${score}</span>
          </div>
          ${isScraped ? `
            <span class="category-tag clean" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">
              ✅ Deep Scraped Content
            </span>
          ` : `
            <span class="category-tag fuel" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; background: #FEF3C7; color: #D97706; border-color: rgba(217, 119, 6, 0.3);">
              ⏳ Summary Only
            </span>
          `}
        </div>
      </div>

      <div class="news-detail-body">
        <p style="font-weight: 700; color: var(--text-heading); margin-bottom: 0.5rem;">📄 Executive Summary:</p>
        <p style="background: rgba(16, 185, 129, 0.05); padding: 0.85rem; border-radius: var(--radius-md); border-left: 3px solid var(--brand-green); font-size: 0.92rem; margin-bottom: 1.25rem;">${escapeHTML(news.summary || news.content || 'No summary description available.')}</p>

        ${isScraped && news.fullContent ? `
          <p style="font-weight: 700; color: var(--text-heading); margin-bottom: 0.75rem;">📖 Full Article Text (Deep Web Content):</p>
          <div class="full-content-body" style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-card); max-height: 400px; overflow-y: auto;">
            ${fullContentHTML}
          </div>
        ` : `
          <div style="text-align: center; padding: 1.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-card);">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Full article text has not been scraped yet for this news item.</p>
            <button class="btn-action btn-deep btn-deep-scrape-single" id="btn-deep-scrape-single" data-id="${newsId}" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border: none; padding: 0.5rem 1.25rem; font-size: 0.88rem; cursor: pointer; border-radius: var(--radius-md);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.4rem;"><path d="M12 2v20M17 12H7"></path></svg>
              Scrape Full Article Content Now
            </button>
          </div>
        `}

        ${(news.matchedVessels && news.matchedVessels.length > 0) ? `
          <div style="margin-top: 1.25rem; background: rgba(13, 148, 136, 0.05); padding: 1.1rem; border-radius: var(--radius-md); border: 1px solid rgba(13, 148, 136, 0.2);">
            <h4 style="font-size: 0.92rem; font-weight: 700; color: #0F766E; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
              ⚓ Mentioned Fleet Vessels in Article (${news.matchedVessels.length}):
            </h4>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${news.matchedVessels.map(mv => `
                <div style="background: var(--bg-card); padding: 0.75rem 0.9rem; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <strong style="color: var(--text-heading); font-size: 0.88rem;">🚢 ${escapeHTML(mv.vesselName)} ${mv.imoNumber ? `(IMO ${escapeHTML(mv.imoNumber)})` : ''}</strong>
                    <span style="font-size: 0.7rem; font-weight: 700; background: #CCFBF1; color: #0D9488; padding: 0.1rem 0.45rem; border-radius: 999px;">Match Confidence: ${(mv.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                  ${mv.mentionSnippet ? `<p style="font-size: 0.82rem; color: var(--text-muted); font-style: italic; margin: 0;">"${escapeHTML(mv.mentionSnippet)}"</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${(news.regulations && news.regulations.length > 0) || (news.complianceRisk && news.complianceRisk.riskScore > 0) ? `
          <div style="margin-top: 1.25rem; background: rgba(245, 158, 11, 0.05); padding: 1.1rem; border-radius: var(--radius-md); border: 1px solid rgba(245, 158, 11, 0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
              <h4 style="font-size: 0.92rem; font-weight: 700; color: #B45309; margin: 0; display: flex; align-items: center; gap: 0.4rem;">
                📜 Maritime Regulations & Compliance Analysis (${news.regulations ? news.regulations.length : 0}):
              </h4>
              ${news.complianceRisk ? `
                <span style="font-size: 0.73rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 999px; ${news.complianceRisk.riskLevel === 'Critical' || news.complianceRisk.riskLevel === 'High' ? 'background: #FEE2E2; color: #DC2626; border: 1px solid rgba(220, 38, 38, 0.3);' : 'background: #FEF3C7; color: #D97706; border: 1px solid rgba(217, 119, 6, 0.3);'}">
                  Risk Score: ${news.complianceRisk.riskScore}/10 (${news.complianceRisk.riskLevel})
                </span>
              ` : ''}
            </div>
            ${news.complianceRisk && news.complianceRisk.summary ? `
              <p style="font-size: 0.85rem; color: var(--text-heading); font-weight: 500; margin-bottom: 0.75rem; background: var(--bg-card); padding: 0.65rem; border-radius: var(--radius-md); border-left: 3px solid #D97706;">
                ${escapeHTML(news.complianceRisk.summary)}
              </p>
            ` : ''}
            <div style="display: flex; flex-direction: column; gap: 0.55rem;">
              ${(news.regulations || []).map(r => `
                <div style="background: var(--bg-card); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.2rem;">
                    <strong style="color: #B45309; font-size: 0.85rem;">📋 ${escapeHTML(r.name)}</strong>
                    <span style="font-size: 0.68rem; font-weight: 700; background: #FEE2E2; color: #991B1B; padding: 0.1rem 0.4rem; border-radius: 4px;">Impact: ${escapeHTML(r.impactLevel)}</span>
                  </div>
                  ${r.mentionSnippet ? `<p style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin: 0;">"${escapeHTML(r.mentionSnippet)}"</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="news-detail-footer" style="margin-top: 1.25rem; display: flex; justify-content: flex-end; align-items: center;">
        ${targetUrl && targetUrl !== '#' ? `
          <a href="${escapeHTML(targetUrl)}" target="_blank" rel="noopener noreferrer" class="btn-visit-source">
            Read Original Article (Open Source)
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        ` : ''}
      </div>
    </div>
  `;

  // Bind listener to all single article deep scrape buttons
  const singleScrapeBtns = DOM.newsDetailModalContent.querySelectorAll('.btn-deep-scrape-single');
  singleScrapeBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const newsIdToScrape = btn.dataset.id;
      singleScrapeBtns.forEach(b => {
        b.disabled = true;
        b.textContent = 'Scraping Full Text...';
      });

      try {
        const response = await fetch(`/api/news/${newsIdToScrape}/scrape-deep`, { method: 'POST' });
        const result = await response.json();

        if (result.success && result.data) {
          showToast('Deep Scraping Success', 'Full article text successfully extracted and saved.', false);
          // Refresh global state and modal view
          await loadNewsData();
          renderNewsDetailModalContent(result.data);
        } else {
          showToast('Deep Scraping Error', result.message || 'Could not extract article text.', true);
          singleScrapeBtns.forEach(b => {
            b.disabled = false;
            b.textContent = 'Scrape Full Article Content Now';
          });
        }
      } catch (err) {
        console.error('Single deep scrape error:', err);
        showToast('Connection Error', 'Failed to connect to deep scraper service.', true);
        singleScrapeBtns.forEach(b => {
          b.disabled = false;
          b.textContent = 'Scrape Full Article Content Now';
        });
      }
    });
  });
}

/**
 * Scrape API Trigger Handler & Loading State
 */
async function handleScrapeTrigger(button, endpointUrl, serviceName) {
  const originalHTML = button.innerHTML;
  
  button.disabled = true;
  button.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    Scraping...
  `;

  try {
    const previousCount = appState.allNews.length;

    const response = await fetch(endpointUrl, { method: 'POST' });
    const result = await response.json();

    if (result.success) {
      const scrapedDeepCount = (result.data && typeof result.data.scrapedCount === 'number') ? result.data.scrapedCount : 0;
      const directAdded = (result.data && typeof result.data.addedCount === 'number') ? result.data.addedCount : (result.addedCount || 0);

      // Refresh news from server database
      await loadNewsData();

      let toastMsg = '';
      if (scrapedDeepCount > 0) {
        toastMsg = `${scrapedDeepCount} article${scrapedDeepCount > 1 ? 's' : ''} deep scraped with full text content!`;
      } else {
        const newCount = appState.allNews.length;
        const netNewCount = Math.max(directAdded, newCount - previousCount);

        toastMsg = netNewCount > 0 
          ? `${netNewCount} new article${netNewCount > 1 ? 's' : ''} added to feed.` 
          : 'All articles are up to date, no new items found.';
      }

      showToast(
        `${serviceName} Scraping Completed`,
        toastMsg,
        false
      );
    } else {
      showToast('Scraping Error', result.message || 'Data scraping failed.', true);
    }
  } catch (error) {
    console.error(`${serviceName} Scraping Error:`, error);
    showToast('Connection Error', `Unable to reach ${serviceName} service.`, true);
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
}

/**
 * Generate Smart Newsletter Handler (POST /api/newsletters/generate)
 */
async function handleGenerateNewsletter() {
  const btn = DOM.btnGenerateNewsletter;
  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
    Compiling...
  `;

  try {
    const response = await fetch('/api/newsletters/generate', { method: 'POST' });
    const result = await response.json();

    if (result.success && result.data) {
      const newsletter = result.data;
      
      await loadNewslettersData();
      renderNewsletterModalContent(newsletter);
      openModal(DOM.newsletterModal);

      showToast(
        'Digest Successfully Compiled',
        `Issue #${newsletter.issueNumber || 1} special digest has been compiled!`,
        false
      );
    } else {
      showToast('Digest Error', result.message || 'Unable to compile digest.', true);
    }
  } catch (error) {
    console.error('Generate Digest Error:', error);
    showToast('Connection Error', 'Unable to reach digest server service.', true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

function openLoginFleetModal() {
  renderLoginFleetModalContent();
  const modal = document.getElementById('login-fleet-modal');
  if (modal) {
    modal.classList.add('active');
  }
}
window.openLoginFleetModal = openLoginFleetModal;

/**
 * Render User Login & Fleet Management Modal Content
 */
function renderLoginFleetModalContent() {
  if (!DOM.loginFleetModalContent) return;

  const currentUser = appState.currentUser;
  const isUserLoggedIn = !!currentUser;
  const assignedVessels = isUserLoggedIn ? (currentUser.assignedVessels || []) : [];
  const assignedVesselIds = assignedVessels.map(v => (v._id || v.id || v).toString());

  // Available registered vessels to add
  const availableVessels = appState.registeredVessels.filter(v => {
    const vId = (v._id || v.id).toString();
    return !assignedVesselIds.includes(vId);
  });

  if (!isUserLoggedIn) {
    // Show Email & Password Login Form
    DOM.loginFleetModalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: var(--bg-card); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; font-weight: 700; color: var(--text-heading); display: flex; align-items: center; gap: 0.5rem;">
            🔑 Sign In to Your Fleet Account
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Enter your account email and password to access your personalized fleet news feed and manage assigned vessels.
          </p>

          <form id="form-user-login" style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-heading); margin-bottom: 0.3rem;">
                Email Address:
              </label>
              <input type="email" id="input-login-email" required placeholder="e.g. ahmet.armator@mycarbons.com" value="ahmet.armator@mycarbons.com" style="width: 100%; background: var(--bg-main); color: var(--text-heading); border: 1px solid var(--border-card); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.9rem;">
            </div>

            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: var(--text-heading); margin-bottom: 0.3rem;">
                Password:
              </label>
              <input type="password" id="input-login-password" required placeholder="Enter password" value="password123" style="width: 100%; background: var(--bg-main); color: var(--text-heading); border: 1px solid var(--border-card); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.9rem;">
            </div>

            <div id="login-error-msg" style="display: none; color: #DC2626; font-size: 0.82rem; font-weight: 600; background: #FEE2E2; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);"></div>

            <button type="submit" id="btn-submit-login" class="btn-action" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; border: none; padding: 0.7rem; font-size: 0.92rem; font-weight: 700; cursor: pointer; justify-content: center; margin-top: 0.25rem;">
              🔑 Login to Fleet Portal
            </button>
          </form>

          <!-- Quick Fill Presets for Testing -->
          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px dashed var(--border-card);">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">⚡ Quick Preset Fill (Demo Accounts):</span>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" id="btn-quick-user-a" style="background: #CCFBF1; color: #0D9488; border: 1px solid rgba(13, 148, 136, 0.3); padding: 0.3rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                🚢 User A (5 Vessels)
              </button>
              <button type="button" id="btn-quick-user-b" style="background: #FEF3C7; color: #D97706; border: 1px solid rgba(217, 119, 6, 0.3); padding: 0.3rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                🚢 User B (3 Vessels)
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Shortcut -->
        <div style="display: flex; justify-content: flex-end;">
          <button id="modal-btn-view-all" class="btn-action" style="background: var(--bg-main); color: var(--text-heading); border: 1px solid var(--border-card);">
            🌐 Continue as Guest (Public Feed)
          </button>
        </div>
      </div>
    `;

    // Bind form submit listener
    const form = document.getElementById('form-user-login');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('input-login-email').value.trim();
        const password = document.getElementById('input-login-password').value.trim();
        const errorDiv = document.getElementById('login-error-msg');
        const submitBtn = document.getElementById('btn-submit-login');

        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Logging in...';
        errorDiv.style.display = 'none';

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const result = await res.json();

          if (result.success && result.token) {
            appState.authToken = result.token;
            appState.currentUser = result.user;
            showToast(`Logged in as ${result.user.name}`, 'success');
            await loadUserFleetNews();
            showFleetBanner(result.user);
            renderLoginFleetModalContent();
          } else {
            errorDiv.textContent = result.message || 'Login failed. Please check your credentials.';
            errorDiv.style.display = 'block';
          }
        } catch (err) {
          console.error('Login error:', err);
          errorDiv.textContent = 'Connection error. Please try again.';
          errorDiv.style.display = 'block';
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '🔑 Login to Fleet Portal';
        }
      });
    }

    // Quick fill listeners
    const btnQuickA = document.getElementById('btn-quick-user-a');
    if (btnQuickA) {
      btnQuickA.addEventListener('click', () => {
        document.getElementById('input-login-email').value = 'ahmet.armator@mycarbons.com';
        document.getElementById('input-login-password').value = 'password123';
      });
    }

    const btnQuickB = document.getElementById('btn-quick-user-b');
    if (btnQuickB) {
      btnQuickB.addEventListener('click', () => {
        document.getElementById('input-login-email').value = 'burak.operator@mycarbons.com';
        document.getElementById('input-login-password').value = 'password123';
      });
    }

    const btnViewAll = document.getElementById('modal-btn-view-all');
    if (btnViewAll) {
      btnViewAll.addEventListener('click', async () => {
        appState.activeCategory = 'all';
        await loadNewsData();
        const modal = document.getElementById('login-fleet-modal');
        if (modal) modal.classList.remove('active');
      });
    }

  } else {
    // Show Logged In Profile & Fleet Management Panel
    DOM.loginFleetModalContent.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Logged In User Profile Card -->
        <div style="background: var(--bg-card); padding: 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #CCFBF1; color: #0D9488; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
              ${escapeHTML(currentUser.name ? currentUser.name.charAt(0) : 'U')}
            </div>
            <div>
              <h4 style="margin: 0; font-size: 0.98rem; font-weight: 700; color: var(--text-heading);">
                ${escapeHTML(currentUser.name)}
              </h4>
              <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">
                ${escapeHTML(currentUser.email)} • Role: ${escapeHTML(currentUser.role || 'Armatör')}
              </p>
            </div>
          </div>

          <button id="modal-btn-logout" class="btn-action" style="background: #FEE2E2; color: #DC2626; border: 1px solid rgba(220, 38, 38, 0.3); padding: 0.45rem 0.85rem; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
            Logout 🚪
          </button>
        </div>

        <!-- Fleet Management Panel -->
        <div style="background: rgba(13, 148, 136, 0.05); padding: 1.1rem; border-radius: var(--radius-md); border: 1px solid rgba(13, 148, 136, 0.25);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #0F766E; display: flex; align-items: center; gap: 0.4rem;">
              ⚓ Your Assigned Fleet (${assignedVessels.length} Vessels):
            </h4>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">Manage your vessels below</span>
          </div>

          <!-- Vessels List -->
          <div style="display: flex; flex-direction: column; gap: 0.55rem; max-height: 220px; overflow-y: auto; margin-bottom: 1rem; padding-right: 0.2rem;">
            ${assignedVessels.length > 0 ? assignedVessels.map(v => `
              <div style="background: var(--bg-card); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-card); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                <div>
                  <strong style="color: var(--text-heading); font-size: 0.88rem;">🚢 ${escapeHTML(v.vesselName)}</strong>
                  <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">${v.imoNumber ? 'IMO ' + escapeHTML(v.imoNumber) : escapeHTML(v.vesselType)}</span>
                </div>
                <button class="btn-remove-vessel" data-vessel-id="${v._id || v.id}" style="background: #FEE2E2; color: #DC2626; border: 1px solid rgba(220, 38, 38, 0.3); padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 700; cursor: pointer;">
                  Remove ❌
                </button>
              </div>
            `).join('') : '<p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No vessels currently assigned to your fleet.</p>'}
          </div>

          <!-- Add Vessel Form -->
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; background: var(--bg-card); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-heading);">Add Vessel to Fleet:</span>
            <select id="modal-add-vessel-select" style="flex: 1; background: var(--bg-main); color: var(--text-heading); border: 1px solid var(--border-card); padding: 0.45rem 0.65rem; border-radius: var(--radius-sm); font-size: 0.85rem; cursor: pointer;">
              ${availableVessels.length > 0 ? availableVessels.map(av => `
                <option value="${av.id || av._id}">🚢 ${escapeHTML(av.vesselName)} (${av.imoNumber ? 'IMO ' + escapeHTML(av.imoNumber) : escapeHTML(av.vesselType)})</option>
              `).join('') : '<option value="">All registered vessels already in your fleet</option>'}
            </select>
            <button id="modal-btn-add-vessel" class="btn-action" style="background: #0D9488; color: white; border: none; padding: 0.45rem 0.85rem; font-size: 0.82rem;" ${availableVessels.length === 0 ? 'disabled' : ''}>
              Add Vessel ➕
            </button>
          </div>
        </div>

        <!-- News Shortcuts -->
        <div style="background: var(--bg-card); padding: 1.1rem; border-radius: var(--radius-md); border: 1px solid var(--border-card);">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.92rem; font-weight: 700; color: var(--text-heading);">
            📰 News Feed Navigation Shortcuts:
          </h4>
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button id="modal-btn-view-my-fleet" class="btn-action" style="background: #CCFBF1; color: #0D9488; border: 1px solid rgba(13, 148, 136, 0.4); font-weight: 700;">
              ⚓ View My Fleet Personal Feed (${assignedVessels.length} Vessels)
            </button>
            <button id="modal-btn-view-all" class="btn-action" style="background: var(--bg-main); color: var(--text-heading); border: 1px solid var(--border-card);">
              🌐 View All News (Public Feed)
            </button>
          </div>
        </div>
      </div>
    `;

    // Logout listener
    const btnLogout = document.getElementById('modal-btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        appState.authToken = null;
        appState.currentUser = null;
        hideFleetBanner();
        showToast('Logged out of fleet account', 'info');
        await loadNewsData();
        renderLoginFleetModalContent();
      });
    }

    // Add vessel listener
    const btnAddVessel = document.getElementById('modal-btn-add-vessel');
    if (btnAddVessel) {
      btnAddVessel.addEventListener('click', async () => {
        const vesselId = document.getElementById('modal-add-vessel-select').value;
        if (!vesselId || !currentUser) return;

        try {
          const res = await fetch(`/api/users/${currentUser.id || currentUser._id}/vessels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vesselId })
          });
          const result = await res.json();
          if (result.success) {
            appState.currentUser = result.data;
            showToast('Vessel added to your fleet!', 'success');
            await loadUserFleetNews();
            renderLoginFleetModalContent();
          }
        } catch (e) {
          console.error('Add vessel error:', e);
        }
      });
    }

    // Remove vessel listeners
    const removeBtns = DOM.loginFleetModalContent.querySelectorAll('.btn-remove-vessel');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const vId = btn.dataset.vesselId;
        if (!vId || !currentUser) return;

        try {
          const res = await fetch(`/api/users/${currentUser.id || currentUser._id}/vessels/${vId}`, {
            method: 'DELETE'
          });
          const result = await res.json();
          if (result.success) {
            appState.currentUser = result.data;
            showToast('Vessel removed from your fleet.', 'info');
            await loadUserFleetNews();
            renderLoginFleetModalContent();
          }
        } catch (e) {
          console.error('Remove vessel error:', e);
        }
      });
    });

    const btnViewMyFleet = document.getElementById('modal-btn-view-my-fleet');
    if (btnViewMyFleet) {
      btnViewMyFleet.addEventListener('click', async () => {
        await loadUserFleetNews();
        const modal = document.getElementById('login-fleet-modal');
        if (modal) modal.classList.remove('active');
      });
    }

    const btnViewAll = document.getElementById('modal-btn-view-all');
    if (btnViewAll) {
      btnViewAll.addEventListener('click', async () => {
        appState.activeCategory = 'all';
        await loadNewsData();
        const modal = document.getElementById('login-fleet-modal');
        if (modal) modal.classList.remove('active');
      });
    }
  }
}

/**
 * Newsletter Cover Modal Content Generator
 */
function renderNewsletterModalContent(newsletter) {
  if (!DOM.newsletterModalContent) return;

  const dateStr = formatDate(newsletter.createdAt || newsletter.generatedAt);
  const newsList = Array.isArray(newsletter.featuredNews) ? newsletter.featuredNews : (Array.isArray(newsletter.news) ? newsletter.news : []);
  const issueNum = newsletter.issueNumber || 1;

  DOM.newsletterModalContent.innerHTML = `
    <div class="magazine-cover-card">
      <div class="magazine-badge-row">
        <span class="magazine-issue-pill">🌱 MYCARBONS DIGEST • ISSUE #${issueNum}</span>
        <span class="magazine-date">Published: ${dateStr}</span>
      </div>

      <h3 class="magazine-title">${escapeHTML(newsletter.title || 'Maritime Decarbonization Special Digest')}</h3>
      <p class="magazine-summary">${escapeHTML(newsletter.summary || 'Compiled from top-impact maritime articles compliant with IMO-DCS & EU-MRV.')}</p>
    </div>

    <h4 class="newsletter-section-heading">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-green)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      Featured Highlighted Articles (${newsList.length})
    </h4>

    <div class="newsletter-news-list">
      ${newsList.length === 0 ? '<p style="color: var(--text-muted);">No articles available in this digest.</p>' : newsList.map(item => {
        const itemUrl = item.sourceUrl || item.link;
        return `
        <div class="newsletter-item-row">
          <div class="newsletter-item-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="category-tag carbon" style="font-size: 0.68rem;">${escapeHTML(item.category || 'Decarbonization')}</span>
              <span style="font-size: 0.78rem; font-weight: 700; color: var(--brand-green);">Impact: ${(item.impactScore || 6.0).toFixed(1)}</span>
            </div>
            <h5>${escapeHTML(item.title)}</h5>
            <p>${escapeHTML(item.summary || 'No detail description available.')}</p>
          </div>
          ${itemUrl ? `
            <a href="${escapeHTML(itemUrl)}" target="_blank" rel="noopener noreferrer" class="btn-read-more" style="white-space: nowrap;">
              Read ➔
            </a>
          ` : ''}
        </div>
      `;
      }).join('')}
    </div>
  `;
}

/**
 * Open Digest Archive Modal (GET /api/newsletters)
 */
async function openArchiveModal() {
  await loadNewslettersData();
  
  if (!DOM.archiveModalContent) return;

  const archives = appState.newsletters;

  if (archives.length === 0) {
    DOM.archiveModalContent.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
        <h4>No Compiled Digests Found</h4>
        <p style="font-size: 0.9rem;">Click "Generate Digest" to create your first special digest.</p>
      </div>
    `;
  } else {
    DOM.archiveModalContent.innerHTML = `
      <div class="archive-list">
        ${archives.map((item, index) => {
          const newsItems = Array.isArray(item.featuredNews) ? item.featuredNews : (Array.isArray(item.news) ? item.news : []);
          return `
            <div class="archive-card">
              <div class="archive-card-header">
                <div>
                  <span class="magazine-issue-pill" style="font-size: 0.7rem; padding: 0.2rem 0.6rem;">Issue #${item.issueNumber || (archives.length - index)}</span>
                  <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.5rem;">${formatDate(item.createdAt || item.generatedAt)}</span>
                </div>
                <span style="font-size: 0.82rem; font-weight: 700; color: var(--brand-green);">${newsItems.length} Articles Selected</span>
              </div>
              <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.15rem; color: var(--text-heading); margin-bottom: 0.4rem;">${escapeHTML(item.title)}</h4>
              <p style="font-size: 0.88rem; color: var(--text-body); line-height: 1.5; margin-bottom: 0.85rem;">${escapeHTML(item.summary || '')}</p>
              
              <details style="margin-top: 0.5rem;">
                <summary style="font-size: 0.82rem; font-weight: 700; color: var(--brand-green); cursor: pointer;">Show Selected Articles (${newsItems.length})</summary>
                <div style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; padding-left: 0.5rem; border-left: 2px solid var(--border-glow);">
                  ${newsItems.map(news => `
                    <div style="font-size: 0.85rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <strong style="color: var(--text-heading);">${escapeHTML(typeof news === 'object' ? news.title : 'Article Details')}</strong>
                      ${(typeof news === 'object' && (news.sourceUrl || news.link)) ? `
                        <a href="${escapeHTML(news.sourceUrl || news.link)}" target="_blank" rel="noopener noreferrer" style="color: var(--brand-green); font-size: 0.8rem; font-weight: 700; text-decoration: none;">Read ➔</a>
                      ` : ''}
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
 * Modal Open / Close Helper Functions
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
 * Floating Toast Notification System
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

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 4500);
}

/**
 * Utility Helpers
 */
function formatDate(dateStr) {
  if (!dateStr) return 'Today';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return 'Today';
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
        <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; margin-bottom: 0.5rem;">⚠️ Connection Error</h3>
        <p style="font-size: 0.9rem;">${message}</p>
      </div>
    `;
  }
}
