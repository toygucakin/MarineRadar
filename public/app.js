/**
 * MyCarbons (MarineRadar) - Client-Side JavaScript Logic
 * Live API Connection, Scrape Triggers, Dynamic Filtering, Toast Notifications & Newsletter Modal
 */

// Application State
const appState = {
  allNews: [],
  newsletters: [],
  activeCategory: 'all',
  searchQuery: ''
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
  btnScrapeRss: document.getElementById('btn-scrape-rss'),
  btnScrapeHtml: document.getElementById('btn-scrape-html'),
  btnScrapeDeep: document.getElementById('btn-scrape-deep'),
  btnGenerateNewsletter: document.getElementById('btn-generate-newsletter'),

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
  btnCloseDetailModal: document.getElementById('btn-close-detail-modal')
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
    loadNewslettersData()
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

  return `
    <article class="news-card" data-id="${newsId}">
      <div>
        <div class="card-top-bar" style="flex-wrap: wrap; gap: 0.35rem;">
          <span class="category-tag ${categoryClass}">${escapeHTML(news.category || 'General')}</span>
          ${vesselBadgeHTML}
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

  // 2. Category Tabs Listener
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

  // 3. RSS Scrape Button Listener
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

  // 8. Close Modal Listeners
  if (DOM.btnCloseNewsletterModal) {
    DOM.btnCloseNewsletterModal.addEventListener('click', () => closeModal(DOM.newsletterModal));
  }
  if (DOM.btnCloseArchiveModal) {
    DOM.btnCloseArchiveModal.addEventListener('click', () => closeModal(DOM.archiveModal));
  }
  if (DOM.btnCloseDetailModal) {
    DOM.btnCloseDetailModal.addEventListener('click', () => closeModal(DOM.newsDetailModal));
  }

  // Close on Backdrop Click & Escape Key
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target);
    }
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
