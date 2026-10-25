/**
 * LUMINA E-Commerce - Main Application Logic
 * Modern, robust Vanilla JS handling router, catalog filtering, cart, checkout, and mobile interactions.
 */

// Global State
const state = {
  activeView: 'home',
  cart: [],
  wishlist: [],
  activePromo: null,
  shippingMethod: 'standard', // 'standard' | 'express'
  filters: {
    searchQuery: '',
    categories: ['all'],
    maxPrice: 300,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'featured'
  },
  modalActiveProduct: null,
  modalSelectedColor: null,
  modalQty: 1
};

// ==========================================
// 1. INITIALIZATION & STORAGE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupEventListeners();
  handleRouting();
  renderFeaturedHomeProducts();
  renderCatalogProducts();
  updateCartUI();
  updateWishlistUI();
});

function loadStoredData() {
  try {
    const savedCart = localStorage.getItem('lumina_cart');
    if (savedCart) state.cart = JSON.parse(savedCart);

    const savedWishlist = localStorage.getItem('lumina_wishlist');
    if (savedWishlist) state.wishlist = JSON.parse(savedWishlist);

    const savedPromo = localStorage.getItem('lumina_promo');
    if (savedPromo) state.activePromo = JSON.parse(savedPromo);
  } catch (err) {
    console.warn('Could not load localStorage data', err);
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('lumina_cart', JSON.stringify(state.cart));
  } catch (err) {
    console.error('Storage error', err);
  }
}

function saveWishlistToStorage() {
  try {
    localStorage.setItem('lumina_wishlist', JSON.stringify(state.wishlist));
  } catch (err) {
    console.error('Storage error', err);
  }
}

// ==========================================
// 2. ROUTER & VIEW SWITCHER
// ==========================================
window.addEventListener('hashchange', handleRouting);

function handleRouting() {
  const hash = window.location.hash.replace('#', '') || 'home';
  const validViews = ['home', 'products', 'checkout'];
  const viewId = validViews.includes(hash) ? hash : 'home';

  switchView(viewId);
}

function switchView(viewName) {
  state.activeView = viewName;

  // Toggle sections
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active-view');
  });

  const targetView = document.getElementById(`view${capitalize(viewName)}`);
  if (targetView) {
    targetView.classList.add('active-view');
  }

  // Update navigation links active states
  document.querySelectorAll('.nav-link, .mobile-link, .bottom-nav-item').forEach(link => {
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    } else if (link.dataset.view) {
      link.classList.remove('active');
    }
  });

  // If entering checkout, refresh checkout summary
  if (viewName === 'checkout') {
    renderCheckoutSummary();
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile drawer if open
  closeMobileDrawer();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================
// 3. EVENT LISTENERS
// ==========================================
function setupEventListeners() {
  // Announcement dismiss
  const closeAnnouncementBtn = document.getElementById('closeAnnouncementBtn');
  if (closeAnnouncementBtn) {
    closeAnnouncementBtn.addEventListener('click', () => {
      document.getElementById('announcementBar').style.display = 'none';
    });
  }

  // Copy Promo buttons
  const copyBtns = [document.getElementById('copyPromoBtn'), document.getElementById('copyPromoBtn2')];
  copyBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText('STUDENT20');
        showToast('Promo code STUDENT20 copied to clipboard!', 'success');
        applyCoupon('STUDENT20');
      });
    }
  });

  // Mobile Menu Drawer Toggles
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileDrawerBtn = document.getElementById('closeMobileDrawerBtn');
  const mobileDrawerOverlay = document.getElementById('mobileDrawerOverlay');
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (closeMobileDrawerBtn) closeMobileDrawerBtn.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

  // Mobile Search Bar Toggle
  const mobileSearchToggle = document.getElementById('mobileSearchToggle');
  const mobileBottomSearch = document.getElementById('mobileBottomSearch');
  const mobileSearchBar = document.getElementById('mobileSearchBar');
  const mobileSearchClear = document.getElementById('mobileSearchClear');
  const mobileSearchInput = document.getElementById('mobileSearchInput');

  function toggleMobileSearch() {
    mobileSearchBar.classList.toggle('active');
    if (mobileSearchBar.classList.contains('active')) {
      mobileSearchInput.focus();
    }
  }

  if (mobileSearchToggle) mobileSearchToggle.addEventListener('click', toggleMobileSearch);
  if (mobileBottomSearch) mobileBottomSearch.addEventListener('click', toggleMobileSearch);

  if (mobileSearchClear && mobileSearchInput) {
    mobileSearchClear.addEventListener('click', () => {
      mobileSearchInput.value = '';
      syncSearch('');
    });
    mobileSearchInput.addEventListener('input', (e) => {
      syncSearch(e.target.value);
    });
  }

  // Global Header Search
  const globalSearchInput = document.getElementById('globalSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchResultsDropdown = document.getElementById('searchResultsDropdown');
  const viewAllSearchBtn = document.getElementById('viewAllSearchBtn');

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      searchClearBtn.style.display = q ? 'block' : 'none';
      handleGlobalSearchInput(q);
    });

    globalSearchInput.addEventListener('focus', () => {
      const q = globalSearchInput.value.trim();
      if (q) searchResultsDropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#searchWrapper')) {
        searchResultsDropdown.style.display = 'none';
      }
    });

    searchClearBtn.addEventListener('click', () => {
      globalSearchInput.value = '';
      searchClearBtn.style.display = 'none';
      searchResultsDropdown.style.display = 'none';
      syncSearch('');
    });

    viewAllSearchBtn.addEventListener('click', () => {
      syncSearch(globalSearchInput.value);
      searchResultsDropdown.style.display = 'none';
      window.location.hash = '#products';
    });
  }

  // Cart Drawer Toggles
  const cartTriggerBtn = document.getElementById('cartTriggerBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBackdrop = document.getElementById('cartBackdrop');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  const mobileBottomCart = document.getElementById('mobileBottomCart');

  if (cartTriggerBtn) cartTriggerBtn.addEventListener('click', openCartDrawer);
  if (mobileBottomCart) mobileBottomCart.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCartDrawer);
  if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCartDrawer);

  const cartProceedCheckoutBtn = document.getElementById('cartProceedCheckoutBtn');
  if (cartProceedCheckoutBtn) {
    cartProceedCheckoutBtn.addEventListener('click', () => {
      closeCartDrawer();
      window.location.hash = '#checkout';
    });
  }

  // Wishlist Drawer Toggles
  const wishlistTriggerBtn = document.getElementById('wishlistTriggerBtn');
  const mobileBottomWishlist = document.getElementById('mobileBottomWishlist');
  const closeWishlistBtn = document.getElementById('closeWishlistBtn');
  const wishlistBackdrop = document.getElementById('wishlistBackdrop');

  if (wishlistTriggerBtn) wishlistTriggerBtn.addEventListener('click', openWishlistDrawer);
  if (mobileBottomWishlist) mobileBottomWishlist.addEventListener('click', openWishlistDrawer);
  if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlistDrawer);
  if (wishlistBackdrop) wishlistBackdrop.addEventListener('click', closeWishlistDrawer);

  // Category Filter clicks across pages (Header & Home Category Cards)
  document.querySelectorAll('[data-filter-category]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = elem.dataset.filterCategory;
      setCategoryFilter(cat);
      window.location.hash = '#products';
    });
  });

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.category;
      setCategoryFilter(cat);
      window.location.hash = '#products';
    });
  });

  document.querySelectorAll('.mobile-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      setCategoryFilter(cat);
      closeMobileDrawer();
      window.location.hash = '#products';
    });
  });

  // Hero Shop & Deals Buttons
  const heroShopBtn = document.getElementById('heroShopBtn');
  const heroDealsBtn = document.getElementById('heroDealsBtn');
  if (heroDealsBtn) {
    heroDealsBtn.addEventListener('click', () => {
      state.filters.maxPrice = 150;
      updateFilterControls();
      window.location.hash = '#products';
      renderCatalogProducts();
    });
  }

  // Hero Quick Add Product
  const quickAddHero = document.querySelector('.quick-add-hero');
  if (quickAddHero) {
    quickAddHero.addEventListener('click', () => {
      addToCart('prod-1', 'Space Black', 1);
    });
  }

  // Catalog Filters Listeners
  setupCatalogFilterListeners();

  // Modal Closers
  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const productModalBackdrop = document.getElementById('productModalBackdrop');
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
  if (productModalBackdrop) productModalBackdrop.addEventListener('click', closeProductModal);

  // Promo code in Cart Drawer
  const applyCartPromoBtn = document.getElementById('applyCartPromoBtn');
  const cartPromoInput = document.getElementById('cartPromoInput');
  if (applyCartPromoBtn && cartPromoInput) {
    applyCartPromoBtn.addEventListener('click', () => {
      applyCoupon(cartPromoInput.value.trim());
    });
    cartPromoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon(cartPromoInput.value.trim());
      }
    });
  }

  // Promo code in Checkout Page
  const checkoutApplyPromoBtn = document.getElementById('checkoutApplyPromoBtn');
  const checkoutPromoInput = document.getElementById('checkoutPromoInput');
  if (checkoutApplyPromoBtn && checkoutPromoInput) {
    checkoutApplyPromoBtn.addEventListener('click', () => {
      applyCoupon(checkoutPromoInput.value.trim());
    });
    checkoutPromoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon(checkoutPromoInput.value.trim());
      }
    });
  }

  // Checkout Form Submission & Payment Switching
  setupCheckoutListeners();

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value;
      if (email) {
        showToast('Thank you for subscribing to LUMINA Circle!', 'success');
        newsletterForm.reset();
      }
    });
  }

  // Order Success Modal & Receipt Print
  const printReceiptBtn = document.getElementById('printReceiptBtn');
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// ==========================================
// 4. CATALOG FILTERING & SORTING LOGIC
// ==========================================
function setupCatalogFilterListeners() {
  const filterSearchInput = document.getElementById('filterSearchInput');
  const priceRangeSlider = document.getElementById('priceRangeSlider');
  const priceRangeValue = document.getElementById('priceRangeValue');
  const catalogSortSelect = document.getElementById('catalogSortSelect');
  const inStockToggle = document.getElementById('inStockToggle');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyStateResetBtn = document.getElementById('emptyStateResetBtn');
  const openMobileFilterBtn = document.getElementById('openMobileFilterBtn');
  const catalogSidebar = document.getElementById('catalogSidebar');

  // Search input in catalog sidebar
  if (filterSearchInput) {
    filterSearchInput.addEventListener('input', (e) => {
      state.filters.searchQuery = e.target.value.toLowerCase().trim();
      renderCatalogProducts();
    });
  }

  // Price Range Slider
  if (priceRangeSlider) {
    priceRangeSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      state.filters.maxPrice = val;
      priceRangeValue.textContent = `$${val}`;
      renderCatalogProducts();
    });
  }

  // In-Stock Toggle
  if (inStockToggle) {
    inStockToggle.addEventListener('change', (e) => {
      state.filters.inStockOnly = e.target.checked;
      renderCatalogProducts();
    });
  }

  // Category Checkboxes
  const categoryCheckboxes = document.querySelectorAll('#categoryFilterList input[type="checkbox"]');
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'all') {
        if (e.target.checked) {
          categoryCheckboxes.forEach(c => { if (c.value !== 'all') c.checked = false; });
          state.filters.categories = ['all'];
        }
      } else {
        document.getElementById('catAllCheckbox').checked = false;
        const selected = Array.from(categoryCheckboxes)
          .filter(c => c.checked && c.value !== 'all')
          .map(c => c.value);
        state.filters.categories = selected.length ? selected : ['all'];
        if (!selected.length) {
          document.getElementById('catAllCheckbox').checked = true;
        }
      }
      renderCatalogProducts();
    });
  });

  // Rating Radio
  const ratingRadios = document.querySelectorAll('input[name="minRating"]');
  ratingRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.filters.minRating = parseFloat(e.target.value) || 0;
      renderCatalogProducts();
    });
  });

  // Sort Select
  if (catalogSortSelect) {
    catalogSortSelect.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      renderCatalogProducts();
    });
  }

  // Reset Filters
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters);
  if (emptyStateResetBtn) emptyStateResetBtn.addEventListener('click', resetAllFilters);

  // Mobile Filter Drawer Toggle
  if (openMobileFilterBtn && catalogSidebar) {
    openMobileFilterBtn.addEventListener('click', () => {
      catalogSidebar.classList.toggle('mobile-open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (catalogSidebar.classList.contains('mobile-open') &&
          !catalogSidebar.contains(e.target) &&
          e.target !== openMobileFilterBtn &&
          !openMobileFilterBtn.contains(e.target)) {
        catalogSidebar.classList.remove('mobile-open');
      }
    });
  }
}

function setCategoryFilter(category) {
  state.filters.categories = [category];
  const categoryCheckboxes = document.querySelectorAll('#categoryFilterList input[type="checkbox"]');
  categoryCheckboxes.forEach(cb => {
    cb.checked = (cb.value === category);
  });
  renderCatalogProducts();
}

function resetAllFilters() {
  state.filters = {
    searchQuery: '',
    categories: ['all'],
    maxPrice: 300,
    minRating: 0,
    inStockOnly: false,
    sortBy: 'featured'
  };
  updateFilterControls();
  renderCatalogProducts();
  showToast('Filters reset to default.', 'info');
}

function updateFilterControls() {
  const filterSearchInput = document.getElementById('filterSearchInput');
  const priceRangeSlider = document.getElementById('priceRangeSlider');
  const priceRangeValue = document.getElementById('priceRangeValue');
  const inStockToggle = document.getElementById('inStockToggle');
  const catalogSortSelect = document.getElementById('catalogSortSelect');

  if (filterSearchInput) filterSearchInput.value = state.filters.searchQuery;
  if (priceRangeSlider) priceRangeSlider.value = state.filters.maxPrice;
  if (priceRangeValue) priceRangeValue.textContent = `$${state.filters.maxPrice}`;
  if (inStockToggle) inStockToggle.checked = state.filters.inStockOnly;
  if (catalogSortSelect) catalogSortSelect.value = state.filters.sortBy;

  const categoryCheckboxes = document.querySelectorAll('#categoryFilterList input[type="checkbox"]');
  categoryCheckboxes.forEach(cb => {
    if (state.filters.categories.includes('all')) {
      cb.checked = (cb.value === 'all');
    } else {
      cb.checked = state.filters.categories.includes(cb.value);
    }
  });

  const ratingRadios = document.querySelectorAll('input[name="minRating"]');
  ratingRadios.forEach(radio => {
    radio.checked = (parseFloat(radio.value) === state.filters.minRating);
  });
}

function getFilteredProducts() {
  return PRODUCTS_DATA.filter(prod => {
    // 1. Search Query filter (matches name, description, category, brand)
    if (state.filters.searchQuery) {
      const q = state.filters.searchQuery.toLowerCase();
      const match = prod.name.toLowerCase().includes(q) ||
                    prod.category.toLowerCase().includes(q) ||
                    prod.brand.toLowerCase().includes(q) ||
                    prod.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Category filter
    if (!state.filters.categories.includes('all')) {
      if (!state.filters.categories.includes(prod.category)) return false;
    }

    // 3. Max Price filter
    if (prod.price > state.filters.maxPrice) return false;

    // 4. Rating filter
    if (prod.rating < state.filters.minRating) return false;

    // 5. In-Stock filter
    if (state.filters.inStockOnly && !prod.inStock) return false;

    return true;
  }).sort((a, b) => {
    // Sort logic
    switch (state.filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });
}

// Synchronize global search bar with catalog search
function syncSearch(query) {
  state.filters.searchQuery = query.toLowerCase().trim();
  const filterSearchInput = document.getElementById('filterSearchInput');
  if (filterSearchInput) filterSearchInput.value = query;
  renderCatalogProducts();
}

// Live Autocomplete in Header
function handleGlobalSearchInput(query) {
  const searchResultsDropdown = document.getElementById('searchResultsDropdown');
  const searchQuickList = document.getElementById('searchQuickList');
  const searchQuickCount = document.getElementById('searchQuickCount');

  if (!query) {
    searchResultsDropdown.style.display = 'none';
    return;
  }

  const q = query.toLowerCase();
  const matches = PRODUCTS_DATA.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q)
  );

  searchQuickCount.textContent = `${matches.length} found`;

  if (matches.length === 0) {
    searchQuickList.innerHTML = `
      <div style="padding: 1.25rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
        No products found matching "<strong>${escapeHtml(query)}</strong>"
      </div>
    `;
  } else {
    searchQuickList.innerHTML = matches.slice(0, 4).map(item => `
      <div class="search-drop-item" onclick="openProductQuickView('${item.id}')">
        <img class="search-drop-img" src="${item.image}" alt="${escapeHtml(item.name)}" loading="lazy">
        <div class="search-drop-info">
          <div class="search-drop-name">${escapeHtml(item.name)}</div>
          <div class="search-drop-cat">${escapeHtml(item.category)} &bull; ${escapeHtml(item.brand)}</div>
        </div>
        <div class="search-drop-price">$${item.price.toFixed(2)}</div>
      </div>
    `).join('');
  }

  searchResultsDropdown.style.display = 'block';
}

// ==========================================
// 5. RENDERING PRODUCT CARDS & VIEWS
// ==========================================
function renderFeaturedHomeProducts() {
  const grid = document.getElementById('homeFeaturedGrid');
  if (!grid) return;

  const featured = PRODUCTS_DATA.filter(p => p.isFeatured).slice(0, 4);
  grid.innerHTML = featured.map(prod => createProductCardHTML(prod)).join('');
}

function renderCatalogProducts() {
  const grid = document.getElementById('catalogProductGrid');
  const emptyState = document.getElementById('catalogEmptyState');
  const subtitle = document.getElementById('catalogResultsSubtitle');
  const activeChips = document.getElementById('activeFilterChips');
  const filterActiveCountMobile = document.getElementById('filterActiveCountMobile');

  if (!grid) return;

  const items = getFilteredProducts();

  // Update subtitle counter
  if (subtitle) {
    subtitle.textContent = `Showing ${items.length} of ${PRODUCTS_DATA.length} products`;
  }

  // Active filter count for mobile button
  let activeFilterCount = 0;
  if (!state.filters.categories.includes('all')) activeFilterCount += state.filters.categories.length;
  if (state.filters.maxPrice < 300) activeFilterCount++;
  if (state.filters.minRating > 0) activeFilterCount++;
  if (state.filters.inStockOnly) activeFilterCount++;
  if (state.filters.searchQuery) activeFilterCount++;
  if (filterActiveCountMobile) filterActiveCountMobile.textContent = activeFilterCount;

  // Render Filter Chips
  if (activeChips) {
    let chipsHtml = '';
    if (state.filters.searchQuery) {
      chipsHtml += `<span class="filter-chip">"${escapeHtml(state.filters.searchQuery)}" <button class="chip-remove-btn" onclick="clearSearchFilter()">&times;</button></span>`;
    }
    if (!state.filters.categories.includes('all')) {
      state.filters.categories.forEach(cat => {
        chipsHtml += `<span class="filter-chip">${cat} <button class="chip-remove-btn" onclick="removeCategoryFilter('${cat}')">&times;</button></span>`;
      });
    }
    if (state.filters.maxPrice < 300) {
      chipsHtml += `<span class="filter-chip">Under $${state.filters.maxPrice} <button class="chip-remove-btn" onclick="resetPriceFilter()">&times;</button></span>`;
    }
    if (state.filters.minRating > 0) {
      chipsHtml += `<span class="filter-chip">${state.filters.minRating}★+ <button class="chip-remove-btn" onclick="resetRatingFilter()">&times;</button></span>`;
    }
    if (state.filters.inStockOnly) {
      chipsHtml += `<span class="filter-chip">In-Stock Only <button class="chip-remove-btn" onclick="resetInStockFilter()">&times;</button></span>`;
    }
    activeChips.innerHTML = chipsHtml;
  }

  // Render Products or Empty State
  if (items.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    grid.innerHTML = items.map(prod => createProductCardHTML(prod)).join('');
  }
}

function createProductCardHTML(prod) {
  const isWishlisted = state.wishlist.includes(prod.id);
  const discountPercent = prod.originalPrice
    ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)
    : 0;

  return `
    <div class="product-card" data-product-id="${prod.id}">
      <div class="product-card-top">
        <div class="card-badges">
          ${prod.isNew ? '<span class="badge badge-new">New</span>' : ''}
          ${discountPercent > 0 ? `<span class="badge badge-sale">-${discountPercent}%</span>` : ''}
          ${!prod.inStock ? '<span class="badge badge-out">Sold Out</span>' : ''}
        </div>

        <div class="card-overlay-actions">
          <button 
            class="icon-action-btn ${isWishlisted ? 'active-wishlist' : ''}" 
            onclick="toggleWishlist('${prod.id}', event)" 
            title="Add to Wishlist"
            aria-label="Wishlist"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button 
            class="icon-action-btn" 
            onclick="openProductQuickView('${prod.id}')" 
            title="Quick View Details"
            aria-label="Quick View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        <img 
          src="${prod.image}" 
          alt="${escapeHtml(prod.name)}" 
          class="product-thumb" 
          loading="lazy"
          onclick="openProductQuickView('${prod.id}')"
        >
      </div>

      <div class="product-card-body">
        <div class="product-brand-cat">
          <span>${escapeHtml(prod.brand)}</span>
          <span>${escapeHtml(prod.category)}</span>
        </div>

        <h3 class="product-title" onclick="openProductQuickView('${prod.id}')">
          ${escapeHtml(prod.name)}
        </h3>

        <div class="product-rating">
          <span class="star-gold">★</span>
          <strong>${prod.rating.toFixed(1)}</strong>
          <span class="rating-num">(${prod.reviewCount})</span>
        </div>

        <div class="product-card-footer">
          <div class="price-group">
            <span class="current-price">$${prod.price.toFixed(2)}</span>
            ${prod.originalPrice ? `<span class="original-price">$${prod.originalPrice.toFixed(2)}</span>` : ''}
          </div>

          <button 
            class="btn-add-cart" 
            onclick="addToCart('${prod.id}', '${prod.colors[0]}', 1)"
            ${!prod.inStock ? 'disabled' : ''}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            ${prod.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Filter Chip Removal Helpers
window.clearSearchFilter = () => {
  syncSearch('');
  const s1 = document.getElementById('globalSearchInput');
  const s2 = document.getElementById('mobileSearchInput');
  if (s1) s1.value = '';
  if (s2) s2.value = '';
};

window.removeCategoryFilter = (cat) => {
  state.filters.categories = state.filters.categories.filter(c => c !== cat);
  if (!state.filters.categories.length) state.filters.categories = ['all'];
  updateFilterControls();
  renderCatalogProducts();
};

window.resetPriceFilter = () => {
  state.filters.maxPrice = 300;
  updateFilterControls();
  renderCatalogProducts();
};

window.resetRatingFilter = () => {
  state.filters.minRating = 0;
  updateFilterControls();
  renderCatalogProducts();
};

window.resetInStockFilter = () => {
  state.filters.inStockOnly = false;
  updateFilterControls();
  renderCatalogProducts();
};

// ==========================================
// 6. PRODUCT DETAILS QUICK-VIEW MODAL
// ==========================================
window.openProductQuickView = (productId) => {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  state.modalActiveProduct = product;
  state.modalSelectedColor = product.colors[0];
  state.modalQty = 1;

  const modal = document.getElementById('productModal');
  const backdrop = document.getElementById('productModalBackdrop');
  const content = document.getElementById('modalProductContent');

  content.innerHTML = `
    <!-- Left Column: Gallery -->
    <div class="modal-gallery-wrap">
      <div class="modal-main-image">
        <img id="modalMainImg" src="${product.image}" alt="${escapeHtml(product.name)}">
      </div>
      <div class="modal-thumbs-row">
        ${product.gallery.map((img, idx) => `
          <div class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="switchModalImage('${img}', this)">
            <img src="${img}" alt="${escapeHtml(product.name)} ${idx + 1}">
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Right Column: Meta & Actions -->
    <div class="modal-info-col">
      <div class="modal-brand">${escapeHtml(product.brand)} &bull; ${escapeHtml(product.category)}</div>
      <h2 class="modal-title">${escapeHtml(product.name)}</h2>
      
      <div class="product-rating">
        <span class="star-gold">★★★★★</span>
        <strong>${product.rating.toFixed(1)}</strong>
        <span class="rating-num">(${product.reviewCount} customer reviews)</span>
        &bull;
        <span style="color: ${product.inStock ? 'var(--accent-success)' : 'var(--accent-danger)'}; font-weight: 700;">
          ${product.inStock ? '● In Stock' : '● Sold Out'}
        </span>
      </div>

      <div class="modal-prices">
        <span class="modal-current-price">$${product.price.toFixed(2)}</span>
        ${product.originalPrice ? `<span class="modal-orig-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
      </div>

      <p class="modal-desc">${escapeHtml(product.description)}</p>

      <!-- Color Variant Selector -->
      <div class="modal-variant-section">
        <span class="variant-label">Color / Finish: <strong>${escapeHtml(state.modalSelectedColor)}</strong></span>
        <div class="variant-pills">
          ${product.colors.map((color, idx) => `
            <button 
              type="button" 
              class="variant-pill ${idx === 0 ? 'active' : ''}" 
              onclick="selectModalColor('${color}', this)"
            >
              ${escapeHtml(color)}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Feature Bullet Points -->
      <ul class="modal-features-list">
        ${product.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>

      <!-- Quantity & Add to Cart Action -->
      <div class="modal-action-row">
        <div class="qty-control">
          <button class="qty-btn" onclick="changeModalQty(-1)">&minus;</button>
          <span class="qty-num" id="modalQtyDisplay">1</span>
          <button class="qty-btn" onclick="changeModalQty(1)">&plus;</button>
        </div>

        <button 
          class="btn btn-primary btn-block btn-lg" 
          onclick="addModalProductToCart()"
          ${!product.inStock ? 'disabled' : ''}
        >
          ${product.inStock ? `Add to Cart &bull; $${product.price.toFixed(2)}` : 'Out of Stock'}
        </button>

        <button 
          class="btn btn-secondary btn-lg" 
          onclick="buyNowModalProduct()"
          ${!product.inStock ? 'disabled' : ''}
          title="Proceed directly to checkout"
        >
          Buy Now
        </button>
      </div>

    </div>
  `;

  modal.classList.add('active');
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.switchModalImage = (imgSrc, thumbElem) => {
  document.getElementById('modalMainImg').src = imgSrc;
  document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
  thumbElem.classList.add('active');
};

window.selectModalColor = (color, pillElem) => {
  state.modalSelectedColor = color;
  document.querySelector('.variant-label strong').textContent = color;
  document.querySelectorAll('.variant-pills .variant-pill').forEach(p => p.classList.remove('active'));
  pillElem.classList.add('active');
};

window.changeModalQty = (delta) => {
  let next = state.modalQty + delta;
  if (next < 1) next = 1;
  if (next > 10) next = 10;
  state.modalQty = next;
  document.getElementById('modalQtyDisplay').textContent = next;
};

window.addModalProductToCart = () => {
  if (!state.modalActiveProduct || !state.modalActiveProduct.inStock) return;
  addToCart(state.modalActiveProduct.id, state.modalSelectedColor, state.modalQty);
  closeProductModal();
};

window.buyNowModalProduct = () => {
  if (!state.modalActiveProduct || !state.modalActiveProduct.inStock) return;
  addToCart(state.modalActiveProduct.id, state.modalSelectedColor, state.modalQty);
  closeProductModal();
  window.location.hash = '#checkout';
};

function closeProductModal() {
  const modal = document.getElementById('productModal');
  const backdrop = document.getElementById('productModalBackdrop');
  if (modal) modal.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================
// 7. CART SYSTEM & DRAWER MANAGEMENT
// ==========================================
window.addToCart = (productId, color = null, quantity = 1) => {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  const selectedColor = color || product.colors[0];
  const cartKey = `${product.id}_${selectedColor}`;

  const existingIndex = state.cart.findIndex(item => item.key === cartKey);
  if (existingIndex > -1) {
    state.cart[existingIndex].qty += quantity;
  } else {
    state.cart.push({
      key: cartKey,
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      color: selectedColor,
      qty: quantity
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');

  // Badge bump animation
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
  }
};

window.updateCartQty = (key, delta) => {
  const index = state.cart.findIndex(i => i.key === key);
  if (index === -1) return;

  state.cart[index].qty += delta;
  if (state.cart[index].qty <= 0) {
    state.cart.splice(index, 1);
  }

  saveCartToStorage();
  updateCartUI();
  if (state.activeView === 'checkout') renderCheckoutSummary();
};

window.removeFromCart = (key) => {
  state.cart = state.cart.filter(i => i.key !== key);
  saveCartToStorage();
  updateCartUI();
  if (state.activeView === 'checkout') renderCheckoutSummary();
  showToast('Item removed from cart', 'info');
};

function calculateCartTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;

  if (state.activePromo) {
    discount = subtotal * (state.activePromo.discount || 0);
  }

  const freeShippingThreshold = 100;
  const isFreeStandard = subtotal >= freeShippingThreshold || (state.activePromo && state.activePromo.freeShipping);
  
  let shipping = 0;
  if (state.shippingMethod === 'express') {
    shipping = 14.99;
  } else {
    shipping = isFreeStandard ? 0 : 5.99;
  }

  // Estimated Tax: 8%
  const tax = (subtotal - discount) > 0 ? (subtotal - discount) * 0.08 : 0;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    isFreeStandard,
    freeShippingThreshold
  };
}

function updateCartUI() {
  const totals = calculateCartTotals();
  const totalItemCount = state.cart.reduce((sum, i) => sum + i.qty, 0);

  // Update header badges
  const cartBadge = document.getElementById('cartBadge');
  const bottomCartBadge = document.getElementById('bottomCartBadge');
  const headerCartTotal = document.getElementById('headerCartTotal');
  const drawerItemCount = document.getElementById('drawerItemCount');

  if (cartBadge) cartBadge.textContent = totalItemCount;
  if (bottomCartBadge) bottomCartBadge.textContent = totalItemCount;
  if (headerCartTotal) headerCartTotal.textContent = `$${totals.subtotal.toFixed(2)}`;
  if (drawerItemCount) drawerItemCount.textContent = `${totalItemCount} items`;

  // Free Shipping Meter update ($100 threshold)
  const meterText = document.getElementById('meterText');
  const meterFill = document.getElementById('meterFill');
  if (meterText && meterFill) {
    if (totals.subtotal >= totals.freeShippingThreshold || (state.activePromo && state.activePromo.freeShipping)) {
      meterText.innerHTML = `🎉 <strong>Congratulations!</strong> You qualify for <strong>FREE Express Shipping</strong>!`;
      meterFill.style.width = '100%';
    } else {
      const remaining = (totals.freeShippingThreshold - totals.subtotal).toFixed(2);
      const percent = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100));
      meterText.innerHTML = `Add <strong>$${remaining}</strong> more to unlock <strong>FREE Shipping</strong>!`;
      meterFill.style.width = `${percent}%`;
    }
  }

  // Render items in Drawer
  const container = document.getElementById('cartItemsContainer');
  const cartFooter = document.getElementById('cartFooter');

  if (container) {
    if (state.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-message">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <h3>Your shopping bag is empty</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.35rem;">Explore our curated store to find something you love.</p>
        </div>
      `;
      if (cartFooter) cartFooter.style.display = 'none';
    } else {
      if (cartFooter) cartFooter.style.display = 'block';
      container.innerHTML = state.cart.map(item => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image}" alt="${escapeHtml(item.name)}">
          <div class="cart-item-details">
            <div class="cart-item-top">
              <div>
                <h4 class="cart-item-title">${escapeHtml(item.name)}</h4>
                <div class="cart-item-color">Color: ${escapeHtml(item.color)}</div>
              </div>
              <button class="cart-item-remove-btn" onclick="removeFromCart('${item.key}')" title="Remove">&times;</button>
            </div>
            <div class="cart-item-bottom">
              <div class="qty-control">
                <button class="qty-btn" onclick="updateCartQty('${item.key}', -1)">&minus;</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="updateCartQty('${item.key}', 1)">&plus;</button>
              </div>
              <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Drawer Footer Pricing
  const cartDrawerSubtotal = document.getElementById('cartDrawerSubtotal');
  const cartDrawerDiscountLine = document.getElementById('cartDrawerDiscountLine');
  const cartDrawerDiscount = document.getElementById('cartDrawerDiscount');
  const cartDrawerFinalTotal = document.getElementById('cartDrawerFinalTotal');
  const cartCheckoutPrice = document.getElementById('cartCheckoutPrice');

  if (cartDrawerSubtotal) cartDrawerSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
  if (cartDrawerDiscountLine && cartDrawerDiscount) {
    if (totals.discount > 0) {
      cartDrawerDiscountLine.style.display = 'flex';
      cartDrawerDiscount.textContent = `-$${totals.discount.toFixed(2)} (${state.activePromo.label})`;
    } else {
      cartDrawerDiscountLine.style.display = 'none';
    }
  }
  if (cartDrawerFinalTotal) cartDrawerFinalTotal.textContent = `$${(totals.subtotal - totals.discount).toFixed(2)}`;
  if (cartCheckoutPrice) cartCheckoutPrice.textContent = `$${(totals.subtotal - totals.discount).toFixed(2)}`;
}

function openCartDrawer() {
  document.getElementById('cartDrawer').classList.add('active');
  document.getElementById('cartBackdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('active');
  document.getElementById('cartBackdrop').classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================
// 8. PROMO CODE ENGINE
// ==========================================
function applyCoupon(code) {
  if (!code) return;
  const upper = code.toUpperCase();
  const cartFeedback = document.getElementById('cartPromoFeedback');
  const checkoutFeedback = document.getElementById('checkoutPromoFeedback');

  if (PROMO_CODES[upper]) {
    state.activePromo = { ...PROMO_CODES[upper], code: upper };
    try {
      localStorage.setItem('lumina_promo', JSON.stringify(state.activePromo));
    } catch (e) {}

    const successMsg = `Promo code "${upper}" applied! (${state.activePromo.label})`;
    if (cartFeedback) {
      cartFeedback.className = 'promo-feedback success';
      cartFeedback.textContent = successMsg;
    }
    if (checkoutFeedback) {
      checkoutFeedback.className = 'promo-feedback success';
      checkoutFeedback.textContent = successMsg;
    }

    showToast(`Code ${upper} successfully applied!`, 'success');
    updateCartUI();
    if (state.activeView === 'checkout') renderCheckoutSummary();
  } else {
    const errorMsg = `Invalid coupon code. Try "STUDENT20" for 20% off.`;
    if (cartFeedback) {
      cartFeedback.className = 'promo-feedback error';
      cartFeedback.textContent = errorMsg;
    }
    if (checkoutFeedback) {
      checkoutFeedback.className = 'promo-feedback error';
      checkoutFeedback.textContent = errorMsg;
    }
    showToast('Invalid promo code', 'info');
  }
}

// ==========================================
// 9. CHECKOUT & BUY VIEW LOGIC
// ==========================================
function setupCheckoutListeners() {
  // Payment Method Tabs
  const payTabs = document.querySelectorAll('.pay-tab');
  payTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      payTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const payType = tab.dataset.pay;
      document.getElementById('panelCard').style.display = payType === 'card' ? 'block' : 'none';
      document.getElementById('panelUpi').style.display = payType === 'upi' ? 'block' : 'none';
      document.getElementById('panelCod').style.display = payType === 'cod' ? 'block' : 'none';
    });
  });

  // Shipping Method Radio
  const shippingRadios = document.querySelectorAll('input[name="shippingMethod"]');
  shippingRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.shippingMethod = e.target.value;
      document.querySelectorAll('.shipping-method-option').forEach(opt => opt.classList.remove('selected'));
      e.target.closest('.shipping-method-option').classList.add('selected');
      renderCheckoutSummary();
    });
  });

  // Card Number auto format
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let matches = v.match(/\d{4,16}/g);
      let match = (matches && matches[0]) || '';
      let parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        e.target.value = parts.join(' ');
      } else {
        e.target.value = v;
      }
    });
  }

  // Card Expiry auto format
  const cardExpiry = document.getElementById('cardExpiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length >= 2) {
        e.target.value = v.substring(0, 2) + '/' + v.substring(2, 4);
      } else {
        e.target.value = v;
      }
    });
  }

  // Express Buttons (Apple Pay, Google Pay, PayPal)
  ['expressAppleBtn', 'expressGoogleBtn', 'expressPaypalBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          showToast('Please add items to your cart first!', 'info');
          return;
        }
        completeOrder('Express Digital Wallet');
      });
    }
  });

  // Form Submit
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (state.cart.length === 0) {
        showToast('Your cart is empty. Please add items before checking out.', 'info');
        window.location.hash = '#products';
        return;
      }

      // Basic form validation
      const email = document.getElementById('checkoutEmail').value.trim();
      const phone = document.getElementById('checkoutPhone').value.trim();
      const street = document.getElementById('streetAddress').value.trim();
      const firstName = document.getElementById('firstName').value.trim();

      if (!email || !email.includes('@')) {
        document.getElementById('emailError').style.display = 'block';
        document.getElementById('checkoutEmail').focus();
        return;
      } else {
        document.getElementById('emailError').style.display = 'none';
      }

      if (!phone) {
        document.getElementById('phoneError').style.display = 'block';
        document.getElementById('checkoutPhone').focus();
        return;
      } else {
        document.getElementById('phoneError').style.display = 'none';
      }

      if (!firstName || !street) {
        showToast('Please fill in required shipping address fields.', 'info');
        return;
      }

      // Simulate placing order
      const placeBtn = document.getElementById('placeOrderBtn');
      placeBtn.disabled = true;
      placeBtn.innerHTML = 'Processing Secure Order...';

      setTimeout(() => {
        placeBtn.disabled = false;
        completeOrder(email);
      }, 900);
    });
  }
}

function renderCheckoutSummary() {
  const totals = calculateCartTotals();
  const list = document.getElementById('checkoutItemsList');
  const subtotalElem = document.getElementById('checkoutSubtotal');
  const discountRow = document.getElementById('checkoutDiscountRow');
  const discountTag = document.getElementById('checkoutDiscountTag');
  const discountAmount = document.getElementById('checkoutDiscountAmount');
  const shippingElem = document.getElementById('checkoutShippingAmount');
  const taxElem = document.getElementById('checkoutTaxAmount');
  const totalElem = document.getElementById('checkoutTotalAmount');
  const btnTotal = document.getElementById('btnOrderTotal');
  const shippingStandardPrice = document.getElementById('shippingStandardPrice');

  if (shippingStandardPrice) {
    shippingStandardPrice.textContent = totals.isFreeStandard ? 'FREE' : '$5.99';
  }

  if (list) {
    if (state.cart.length === 0) {
      list.innerHTML = `
        <div style="padding: 1.5rem 0; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          No items in cart. <a href="#products" style="color: var(--accent-primary); text-decoration: underline;">Shop now</a>
        </div>
      `;
    } else {
      list.innerHTML = state.cart.map(item => `
        <div class="checkout-item-row">
          <img class="checkout-item-img" src="${item.image}" alt="${escapeHtml(item.name)}">
          <div class="checkout-item-info">
            <div class="checkout-item-title">${escapeHtml(item.name)}</div>
            <div class="checkout-item-meta">${escapeHtml(item.color)} &bull; Qty: ${item.qty}</div>
          </div>
          <div class="checkout-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
      `).join('');
    }
  }

  if (subtotalElem) subtotalElem.textContent = `$${totals.subtotal.toFixed(2)}`;

  if (discountRow) {
    if (totals.discount > 0) {
      discountRow.style.display = 'flex';
      discountTag.textContent = state.activePromo.code;
      discountAmount.textContent = `-$${totals.discount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (shippingElem) {
    shippingElem.textContent = totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`;
  }

  if (taxElem) taxElem.textContent = `$${totals.tax.toFixed(2)}`;
  if (totalElem) totalElem.textContent = `$${totals.total.toFixed(2)}`;
  if (btnTotal) btnTotal.textContent = `$${totals.total.toFixed(2)}`;
}

function completeOrder(customerEmail) {
  const totals = calculateCartTotals();
  const orderId = '#LUM-' + Math.floor(100000 + Math.random() * 900000);

  // Delivery date estimate (4 business days from now)
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + 4);
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const deliveryStr = delivery.toLocaleDateString('en-US', options);

  // Update success modal
  const successCustomerEmail = document.getElementById('successCustomerEmail');
  const successOrderId = document.getElementById('successOrderId');
  const successDeliveryDate = document.getElementById('successDeliveryDate');
  const successOrderTotal = document.getElementById('successOrderTotal');

  if (successCustomerEmail) successCustomerEmail.textContent = customerEmail;
  if (successOrderId) successOrderId.textContent = orderId;
  if (successDeliveryDate) successDeliveryDate.textContent = deliveryStr;
  if (successOrderTotal) successOrderTotal.textContent = `$${totals.total.toFixed(2)}`;

  // Show Modal
  document.getElementById('orderSuccessModal').classList.add('active');
  document.getElementById('orderSuccessBackdrop').classList.add('active');

  // Clear Cart
  state.cart = [];
  saveCartToStorage();
  updateCartUI();

  // Reset checkout form button
  const placeBtn = document.getElementById('placeOrderBtn');
  if (placeBtn) placeBtn.innerHTML = 'Confirm & Place Order (<span id="btnOrderTotal">$0.00</span>)';

  // Handle continuing shopping
  const continueBtn = document.getElementById('continueShoppingAfterSuccess');
  if (continueBtn) {
    continueBtn.onclick = () => {
      document.getElementById('orderSuccessModal').classList.remove('active');
      document.getElementById('orderSuccessBackdrop').classList.remove('active');
      window.location.hash = '#products';
    };
  }
}

// ==========================================
// 10. WISHLIST MANAGEMENT
// ==========================================
window.toggleWishlist = (productId, event) => {
  if (event) event.stopPropagation();

  const idx = state.wishlist.indexOf(productId);
  const product = PRODUCTS_DATA.find(p => p.id === productId);

  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    showToast(`Removed "${product ? product.name : 'Item'}" from wishlist`, 'info');
  } else {
    state.wishlist.push(productId);
    showToast(`Saved "${product ? product.name : 'Item'}" to wishlist!`, 'success');
  }

  saveWishlistToStorage();
  updateWishlistUI();
  renderCatalogProducts();
};

function updateWishlistUI() {
  const count = state.wishlist.length;
  const badge = document.getElementById('wishlistBadge');
  const drawerCount = document.getElementById('wishlistDrawerCount');
  const bottomBadge = document.getElementById('bottomWishlistBadge');

  if (badge) badge.textContent = count;
  if (bottomBadge) bottomBadge.textContent = count;
  if (drawerCount) drawerCount.textContent = `${count} items`;

  // Render wishlist drawer items
  const container = document.getElementById('wishlistItemsContainer');
  if (container) {
    if (count === 0) {
      container.innerHTML = `
        <div class="wishlist-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <p style="margin-top: 0.75rem;">Your wishlist is currently empty.</p>
        </div>
      `;
    } else {
      const items = PRODUCTS_DATA.filter(p => state.wishlist.includes(p.id));
      container.innerHTML = items.map(item => `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image}" alt="${escapeHtml(item.name)}">
          <div class="cart-item-details">
            <div class="cart-item-top">
              <div>
                <h4 class="cart-item-title">${escapeHtml(item.name)}</h4>
                <div class="cart-item-color">$${item.price.toFixed(2)}</div>
              </div>
              <button class="cart-item-remove-btn" onclick="toggleWishlist('${item.id}')" title="Remove">&times;</button>
            </div>
            <div class="cart-item-bottom">
              <button class="btn btn-primary btn-sm" onclick="addToCart('${item.id}'); toggleWishlist('${item.id}');">
                Move to Cart
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

function openWishlistDrawer() {
  document.getElementById('wishlistDrawer').classList.add('active');
  document.getElementById('wishlistBackdrop').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  document.getElementById('wishlistDrawer').classList.remove('active');
  document.getElementById('wishlistBackdrop').classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================
// 11. MOBILE DRAWER NAVIGATION
// ==========================================
function openMobileDrawer() {
  document.getElementById('mobileDrawer').classList.add('active');
  document.getElementById('mobileDrawerOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('mobileDrawerOverlay');
  if (drawer) drawer.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ==========================================
// 12. TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="toast-close">&times;</button>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// Utility: Prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
