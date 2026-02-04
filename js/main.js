// js/main.js

// ========== DOM Elements ==========
const menuBtn = document.getElementById('menuBtn');
const closeMenu = document.getElementById('closeMenu');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const toast = document.getElementById('toast');

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', async () => {
    await initLanguage();
    await loadContent();
    initEventListeners();
    initIntersectionObserver();
});

// ========== Load All Content ==========
async function loadContent() {
    showLoading(true);
    
    try {
        await Promise.all([
            loadBanners(),
            loadPromotions(),
            loadCategories(),
            loadNewArrivals(),
            loadFeaturedProducts(),
            loadAllProducts()
        ]);
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('error', 'Failed to load content');
    } finally {
        showLoading(false);
    }
}

// ========== Banner Slider ==========
let currentSlide = 0;
let bannerInterval;

async function loadBanners() {
    const banners = await JSONBinService.getBanners();
    const slider = document.getElementById('bannerSlider');
    const dots = document.getElementById('sliderDots');
    
    if (!banners || banners.length === 0) {
        slider.innerHTML = `
            <div class="banner-slide active">
                <img src="assets/images/default-banner.jpg" alt="Danudara Textiles">
                <div class="banner-content">
                    <h2>${getLocalizedText({ en: 'Welcome to Danudara Textiles', si: 'දනුදර ටෙක්ස්ටයිල්ස් වෙත සාදරයෙන් පිළිගනිමු', ta: 'தனுதரா ஜவுளிகளுக்கு வரவேற்கிறோம்' })}</h2>
                </div>
            </div>
        `;
        return;
    }
    
    slider.innerHTML = banners.map((banner, index) => `
        <div class="banner-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${banner.image}" alt="${getLocalizedText(banner.title)}">
            <div class="banner-content">
                <h2>${getLocalizedText(banner.title)}</h2>
                <p>${getLocalizedText(banner.subtitle)}</p>
            </div>
        </div>
    `).join('');
    
    dots.innerHTML = banners.map((_, index) => `
        <div class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');
    
    // Add dot click handlers
    dots.querySelectorAll('.slider-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            goToSlide(parseInt(dot.dataset.index));
        });
    });
    
    // Start auto-slide
    if (banners.length > 1) {
        startBannerAutoSlide(banners.length);
    }
}

function startBannerAutoSlide(totalSlides) {
    bannerInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        goToSlide(currentSlide);
    }, 5000);
}

function goToSlide(index) {
    currentSlide = index;
    
    document.querySelectorAll('.banner-slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    document.querySelectorAll('.slider-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// ========== Promotions ==========
async function loadPromotions() {
    const promotions = await JSONBinService.getPromotions();
    const section = document.getElementById('promotionsSection');
    
    if (promotions && promotions.active) {
        section.innerHTML = `
            <div class="promo-banner animate-pulse">
                ${getLocalizedText(promotions.text)}
            </div>
        `;
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// ========== Categories ==========
async function loadCategories() {
    const categories = await CategoryService.getAll();
    const container = document.getElementById('categoriesContainer');
    
    const icons = ['fa-tshirt', 'fa-vest', 'fa-socks', 'fa-hat-cowboy', 'fa-mitten'];
    
    container.innerHTML = categories.map((cat, index) => {
        const name = getCurrentLanguage() === 'si' ? (cat.name_si || cat.name) :
                    getCurrentLanguage() === 'ta' ? (cat.name_ta || cat.name) : cat.name;
        return `
            <div class="category-card" data-category-id="${cat.id}">
                <div class="category-icon">
                    <i class="fas ${cat.icon || icons[index % icons.length]}"></i>
                </div>
                <span>${name}</span>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.dataset.categoryId;
            window.location.href = `shop.html?category=${categoryId}`;
        });
    });
}

// ========== Products ==========
async function loadNewArrivals() {
    const config = await JSONBinService.getNewArrivalsConfig();
    const section = document.getElementById('newArrivalsSection');
    
    if (!config || !config.enabled) {
        section.style.display = 'none';
        return;
    }
    
    const products = await ProductService.getNewArrivals(config.limit || 8);
    const grid = document.getElementById('newArrivalsGrid');
    
    grid.innerHTML = products.map(product => createProductCard(product, true)).join('');
    addProductCardListeners(grid);
}

async function loadFeaturedProducts() {
    const products = await ProductService.getFeatured();
    const grid = document.getElementById('featuredGrid');
    
    if (products.length === 0) {
        grid.parentElement.style.display = 'none';
        return;
    }
    
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
    addProductCardListeners(grid);
}

async function loadAllProducts() {
    const products = await ProductService.getAll();
    const grid = document.getElementById('productsGrid');
    
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
    addProductCardListeners(grid);
}

function createProductCard(product, isNew = false) {
    const lang = getCurrentLanguage();
    const name = lang === 'si' ? (product.name_si || product.name) :
                lang === 'ta' ? (product.name_ta || product.name) : product.name;
    
    const hasDiscount = product.original_price && product.original_price > product.price;
    const discountPercent = hasDiscount ? 
        Math.round((1 - product.price / product.original_price) * 100) : 0;
    
    return `
        <div class="product-card reveal" data-product-id="${product.id}">
            <div class="product-image img-hover-zoom">
                <img src="${product.image_url}" alt="${name}" loading="lazy">
                ${isNew ? '<span class="product-badge">NEW</span>' : ''}
                ${hasDiscount ? `<span class="product-badge" style="background: var(--error); color: white;">-${discountPercent}%</span>` : ''}
                <button class="product-wishlist" data-product-id="${product.id}">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${name}</h3>
                <div class="product-price">
                    <span class="price-current">${CONFIG.CURRENCY_SYMBOL} ${product.price.toLocaleString()}</span>
                    ${hasDiscount ? `<span class="price-original">${CONFIG.CURRENCY_SYMBOL} ${product.original_price.toLocaleString()}</span>` : ''}
                </div>
                <button class="add-to-cart-btn ripple" data-product-id="${product.id}">
                    <i class="fas fa-cart-plus"></i>
                    <span data-lang="addToCart">${getTranslation('addToCart')}</span>
                </button>
            </div>
        </div>
    `;
}

function addProductCardListeners(container) {
    // Product card click
    container.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn') && !e.target.closest('.product-wishlist')) {
                openProductModal(card.dataset.productId);
            }
        });
    });
    
    // Add to cart buttons
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = btn.dataset.productId;
            const product = await ProductService.getById(productId);
            Cart.addItem(product);
            
            // Button animation
            btn.classList.add('animate-bounceIn');
            setTimeout(() => btn.classList.remove('animate-bounceIn'), 600);
        });
    });
    
    // Wishlist buttons
    container.querySelectorAll('.product-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
        });
    });
}

// ========== Product Modal ==========
async function openProductModal(productId) {
    const product = await ProductService.getById(productId);
    const lang = getCurrentLanguage();
    
    const name = lang === 'si' ? (product.name_si || product.name) :
                lang === 'ta' ? (product.name_ta || product.name) : product.name;
    const description = lang === 'si' ? (product.description_si || product.description) :
                       lang === 'ta' ? (product.description_ta || product.description) : product.description;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="modal-product-image">
            <img src="${product.image_url}" alt="${name}">
        </div>
        <h2 class="modal-product-name">${name}</h2>
        <div class="modal-product-price">${CONFIG.CURRENCY_SYMBOL} ${product.price.toLocaleString()}</div>
        <p class="modal-product-description">${description || ''}</p>
        <div class="quantity-selector">
            <label data-lang="quantity">${getTranslation('quantity')}</label>
            <div class="quantity-controls">
                <button class="quantity-btn" id="quantityMinus">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="quantity-input" id="quantityInput" value="1" min="1">
                <button class="quantity-btn" id="quantityPlus">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        <button class="modal-add-btn ripple" id="modalAddToCart">
            <i class="fas fa-cart-plus"></i>
            <span data-lang="addToCart">${getTranslation('addToCart')}</span>
        </button>
    `;
    
    // Quantity controls
    const quantityInput = document.getElementById('quantityInput');
    document.getElementById('quantityMinus').addEventListener('click', () => {
        if (quantityInput.value > 1) quantityInput.value--;
    });
    document.getElementById('quantityPlus').addEventListener('click', () => {
        quantityInput.value++;
    });
    
    // Add to cart
    document.getElementById('modalAddToCart').addEventListener('click', () => {
        Cart.addItem(product, parseInt(quantityInput.value));
        closeModal();
    });
    
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========== Search ==========
let searchTimeout;

function handleSearch(query) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(async () => {
        if (query.trim().length < 2) {
            loadAllProducts();
            return;
        }
        
        const products = await ProductService.search(query);
        const grid = document.getElementById('productsGrid');
        
        if (products.length === 0) {
            grid.innerHTML = `
                <div class="no-products" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 1rem;"></i>
                    <p data-lang="noProducts">${getTranslation('noProducts')}</p>
                </div>
            `;
        } else {
            grid.innerHTML = products.map(product => createProductCard(product)).join('');
            addProductCardListeners(grid);
        }
    }, 300);
}

// ========== Event Listeners ==========
function initEventListeners() {
    // Side Menu
    menuBtn?.addEventListener('click', () => {
        sideMenu.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    const closeSideMenu = () => {
        sideMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    closeMenu?.addEventListener('click', closeSideMenu);
    menuOverlay?.addEventListener('click', closeSideMenu);
    
    // Search
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value;
        searchClear.classList.toggle('visible', query.length > 0);
        handleSearch(query);
    });
    
    searchClear?.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.classList.remove('visible');
        loadAllProducts();
    });
    
    // Modal
    modalClose?.addEventListener('click', closeModal);
    productModal?.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });
    
    // Cart button
    document.getElementById('cartBtn')?.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSideMenu();
            closeModal();
        }
    });
    
    // Language change
    document.addEventListener('languageChanged', () => {
        loadContent();
    });
}

// ========== Intersection Observer for Animations ==========
function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all reveal elements
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }, 100);
}

// ========== Toast Notification ==========
function showToast(type, message) {
    toast.className = `toast ${type}`;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== Loading State ==========
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

// Export functions
window.showToast = showToast;
window.showLoading = showLoading;
window.openProductModal = openProductModal;