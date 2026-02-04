// js/admin.js - COMPLETE FIXED VERSION

// ========== State ==========
let currentSection = 'products';
let editingItem = null;
let deleteCallback = null;

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin page loaded');
    
    // Initialize login form first
    initLoginForm();
    
    // Check authentication
    try {
        const session = await AuthService.getSession();
        console.log('Session:', session);
        
        if (session) {
            showDashboard(session.user.email);
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLogin();
    }
});

// ========== Login Form Initialization ==========
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        console.log('Login form found, attaching event listener');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('emailInput').value.trim();
            const password = document.getElementById('passwordInput').value;
            const errorEl = document.getElementById('loginError');
            const loginBtn = loginForm.querySelector('.login-btn');
            
            // Validate inputs
            if (!email || !password) {
                errorEl.textContent = 'Please enter email and password';
                errorEl.classList.add('show');
                return;
            }
            
            // Show loading state
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
            errorEl.classList.remove('show');
            
            try {
                console.log('Attempting login with:', email);
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                console.log('Login response:', { data, error });
                
                if (error) {
                    throw error;
                }
                
                if (data && data.user) {
                    console.log('Login successful');
                    showDashboard(data.user.email);
                } else {
                    throw new Error('No user data returned');
                }
            } catch (error) {
                console.error('Login error:', error);
                errorEl.textContent = error.message || 'Invalid email or password';
                errorEl.classList.add('show');
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            }
        });
    } else {
        console.error('Login form not found!');
    }
}

// ========== Auth Functions ==========
function showLogin() {
    console.log('Showing login page');
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard(email) {
    console.log('Showing dashboard for:', email);
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    document.getElementById('adminEmail').textContent = email;
    
    // Initialize all event listeners for dashboard
    initDashboardEvents();
    
    // Load initial data
    loadSectionData('products');
}

// ========== Dashboard Event Listeners ==========
function initDashboardEvents() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            try {
                await supabaseClient.auth.signOut();
                showLogin();
            } catch (error) {
                console.error('Logout error:', error);
            }
        };
    }
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if (section) {
                navigateToSection(section);
            }
        };
    });
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = () => {
            document.querySelector('.admin-sidebar').classList.toggle('active');
        };
    }
    
    // Add buttons
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.onclick = () => openProductModal();
    }
    
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.onclick = () => openCategoryModal();
    }
    
    const addDeliveryBtn = document.getElementById('addDeliveryBtn');
    if (addDeliveryBtn) {
        addDeliveryBtn.onclick = () => openDeliveryModal();
    }
    
    const addBannerBtn = document.getElementById('addBannerBtn');
    if (addBannerBtn) {
        addBannerBtn.onclick = () => openBannerModal();
    }
    
    // Modal close buttons
    setupModalCloseButtons();
    
    // Form submissions
    setupFormSubmissions();
    
    // Content tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tab}Panel`).classList.add('active');
        };
    });
    
    // Image preview
    const productImage = document.getElementById('productImage');
    if (productImage) {
        productImage.onchange = handleImagePreview;
    }
}

function setupModalCloseButtons() {
    // Product modal
    const productModalClose = document.getElementById('productModalClose');
    if (productModalClose) productModalClose.onclick = () => closeModal('productModal');
    
    const productCancelBtn = document.getElementById('productCancelBtn');
    if (productCancelBtn) productCancelBtn.onclick = () => closeModal('productModal');
    
    // Category modal
    const categoryModalClose = document.getElementById('categoryModalClose');
    if (categoryModalClose) categoryModalClose.onclick = () => closeModal('categoryModal');
    
    const categoryCancelBtn = document.getElementById('categoryCancelBtn');
    if (categoryCancelBtn) categoryCancelBtn.onclick = () => closeModal('categoryModal');
    
    // Delivery modal
    const deliveryModalClose = document.getElementById('deliveryModalClose');
    if (deliveryModalClose) deliveryModalClose.onclick = () => closeModal('deliveryModal');
    
    const deliveryCancelBtn = document.getElementById('deliveryCancelBtn');
    if (deliveryCancelBtn) deliveryCancelBtn.onclick = () => closeModal('deliveryModal');
    
    // Delete modal
    const deleteModalClose = document.getElementById('deleteModalClose');
    if (deleteModalClose) deleteModalClose.onclick = () => closeModal('deleteModal');
    
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    if (deleteCancelBtn) deleteCancelBtn.onclick = () => closeModal('deleteModal');
    
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    if (deleteConfirmBtn) {
        deleteConfirmBtn.onclick = () => {
            if (deleteCallback) {
                deleteCallback();
                closeModal('deleteModal');
            }
        };
    }
}

function setupFormSubmissions() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.onsubmit = handleProductSubmit;
    }
    
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.onsubmit = handleCategorySubmit;
    }
    
    const deliveryForm = document.getElementById('deliveryForm');
    if (deliveryForm) {
        deliveryForm.onsubmit = handleDeliverySubmit;
    }
    
    const promotionsForm = document.getElementById('promotionsForm');
    if (promotionsForm) {
        promotionsForm.onsubmit = handlePromotionsSubmit;
    }
    
    const aboutForm = document.getElementById('aboutForm');
    if (aboutForm) {
        aboutForm.onsubmit = handleAboutSubmit;
    }
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.onsubmit = handleContactSubmit;
    }
}

// ========== Navigation ==========
function navigateToSection(section) {
    currentSection = section;
    
    // Update nav active state
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });
    
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    
    // Show selected section
    const sectionEl = document.getElementById(`${section}Section`);
    if (sectionEl) {
        sectionEl.style.display = 'block';
    }
    
    // Update page title
    const titles = {
        products: 'Products',
        categories: 'Categories',
        delivery: 'Delivery Charges',
        payments: 'Payment Methods',
        content: 'Content Management',
        banners: 'Banners'
    };
    document.getElementById('pageTitle').textContent = titles[section] || section;
    
    // Load section data
    loadSectionData(section);
    
    // Close mobile sidebar
    document.querySelector('.admin-sidebar')?.classList.remove('active');
}

async function loadSectionData(section) {
    try {
        switch (section) {
            case 'products':
                await loadProducts();
                await loadCategoriesForSelect();
                break;
            case 'categories':
                await loadCategories();
                break;
            case 'delivery':
                await loadDeliveryCharges();
                break;
            case 'payments':
                await loadPaymentMethods();
                break;
            case 'content':
                await loadContentData();
                break;
            case 'banners':
                await loadBanners();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${section}:`, error);
        showToast('error', `Failed to load ${section}`);
    }
}

// ========== Products ==========
async function loadProducts() {
    try {
        const products = await ProductService.getAll();
        const tbody = document.getElementById('productsTableBody');
        
        if (!tbody) return;
        
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No products found. Add your first product!</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.image_url || 'assets/images/placeholder.jpg'}" 
                         alt="${product.name}" class="product-thumb"
                         onerror="this.src='assets/images/placeholder.jpg'">
                </td>
                <td>${product.name}</td>
                <td>${product.categories?.name || '-'}</td>
                <td>${CONFIG.CURRENCY_SYMBOL} ${product.price?.toLocaleString() || 0}</td>
                <td>
                    <span class="status-badge ${product.is_active ? 'active' : 'inactive'}">
                        ${product.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="confirmDeleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadCategoriesForSelect() {
    try {
        const categories = await CategoryService.getAll();
        const select = document.getElementById('productCategory');
        
        if (select && categories) {
            select.innerHTML = '<option value="">Select Category</option>' +
                categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading categories for select:', error);
    }
}

function openProductModal(product = null) {
    editingItem = product;
    
    document.getElementById('productModalTitle').textContent = 
        product ? 'Edit Product' : 'Add Product';
    
    // Reset form
    const form = document.getElementById('productForm');
    if (form) form.reset();
    
    document.getElementById('productId').value = '';
    
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Click to upload or drag and drop</span>
        `;
    }
    
    if (product) {
        document.getElementById('productId').value = product.id || '';
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productNameSi').value = product.name_si || '';
        document.getElementById('productNameTa').value = product.name_ta || '';
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productOriginalPrice').value = product.original_price || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productDescriptionSi').value = product.description_si || '';
        document.getElementById('productDescriptionTa').value = product.description_ta || '';
        document.getElementById('productActive').checked = product.is_active !== false;
        document.getElementById('productFeatured').checked = product.is_featured || false;
        
        if (product.image_url && imagePreview) {
            imagePreview.innerHTML = `<img src="${product.image_url}" alt="Product">`;
        }
    }
    
    document.getElementById('productModal').classList.add('active');
}

async function editProduct(id) {
    try {
        const product = await ProductService.getById(id);
        openProductModal(product);
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('error', 'Failed to load product');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const imageFile = document.getElementById('productImage')?.files[0];
    
    const productData = {
        name: document.getElementById('productName').value,
        name_si: document.getElementById('productNameSi').value || null,
        name_ta: document.getElementById('productNameTa').value || null,
        category_id: document.getElementById('productCategory').value || null,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        original_price: parseFloat(document.getElementById('productOriginalPrice').value) || null,
        description: document.getElementById('productDescription').value || null,
        description_si: document.getElementById('productDescriptionSi').value || null,
        description_ta: document.getElementById('productDescriptionTa').value || null,
        is_active: document.getElementById('productActive').checked,
        is_featured: document.getElementById('productFeatured').checked
    };
    
    try {
        let savedProduct;
        
        if (productId) {
            savedProduct = await ProductService.update(productId, productData);
        } else {
            savedProduct = await ProductService.create(productData);
        }
        
        // Upload image if selected
        if (imageFile && savedProduct) {
            try {
                const imageUrl = await StorageService.uploadProductImage(imageFile, savedProduct.id);
                await ProductService.update(savedProduct.id, { image_url: imageUrl });
            } catch (imgError) {
                console.error('Image upload error:', imgError);
                showToast('error', 'Product saved but image upload failed');
            }
        }
        
        closeModal('productModal');
        await loadProducts();
        showToast('success', `Product ${productId ? 'updated' : 'created'} successfully`);
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('error', 'Failed to save product');
    }
}

function confirmDeleteProduct(id) {
    deleteCallback = async () => {
        try {
            await ProductService.delete(id);
            await loadProducts();
            showToast('success', 'Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('error', 'Failed to delete product');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Categories ==========
async function loadCategories() {
    try {
        const categories = await CategoryService.getAll();
        const tbody = document.getElementById('categoriesTableBody');
        
        if (!tbody) return;
        
        if (!categories || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No categories found. Add your first category!</td></tr>';
            return;
        }
        
        tbody.innerHTML = categories.map(cat => `
            <tr>
                <td>
                    <div class="category-icon">
                        <i class="fas ${cat.icon || 'fa-tag'}"></i>
                    </div>
                </td>
                <td>${cat.name}</td>
                <td>${cat.name_si || '-'}</td>
                <td>${cat.name_ta || '-'}</td>
                <td>
                    <span class="status-badge ${cat.is_active ? 'active' : 'inactive'}">
                        ${cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editCategory('${cat.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="confirmDeleteCategory('${cat.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function openCategoryModal(category = null) {
    editingItem = category;
    
    document.getElementById('categoryModalTitle').textContent = 
        category ? 'Edit Category' : 'Add Category';
    
    const form = document.getElementById('categoryForm');
    if (form) form.reset();
    
    document.getElementById('categoryId').value = '';
    
    if (category) {
        document.getElementById('categoryId').value = category.id || '';
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryNameSi').value = category.name_si || '';
        document.getElementById('categoryNameTa').value = category.name_ta || '';
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categorySortOrder').value = category.sort_order || 0;
        document.getElementById('categoryActive').checked = category.is_active !== false;
    }
    
    document.getElementById('categoryModal').classList.add('active');
}

async function editCategory(id) {
    try {
        const categories = await CategoryService.getAll();
        const category = categories.find(c => c.id === id);
        if (category) {
            openCategoryModal(category);
        }
    } catch (error) {
        console.error('Error loading category:', error);
        showToast('error', 'Failed to load category');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        name_si: document.getElementById('categoryNameSi').value || null,
        name_ta: document.getElementById('categoryNameTa').value || null,
        icon: document.getElementById('categoryIcon').value || null,
        sort_order: parseInt(document.getElementById('categorySortOrder').value) || 0,
        is_active: document.getElementById('categoryActive').checked
    };
    
    try {
        if (categoryId) {
            await CategoryService.update(categoryId, categoryData);
        } else {
            await CategoryService.create(categoryData);
        }
        
        closeModal('categoryModal');
        await loadCategories();
        showToast('success', `Category ${categoryId ? 'updated' : 'created'} successfully`);
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('error', 'Failed to save category');
    }
}

function confirmDeleteCategory(id) {
    deleteCallback = async () => {
        try {
            await CategoryService.delete(id);
            await loadCategories();
            showToast('success', 'Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('error', 'Failed to delete category');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Delivery Charges ==========
async function loadDeliveryCharges() {
    try {
        const charges = await DeliveryService.getAll();
        const tbody = document.getElementById('deliveryTableBody');
        
        if (!tbody) return;
        
        if (!charges || charges.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No delivery charges found. Add your first delivery charge!</td></tr>';
            return;
        }
        
        tbody.innerHTML = charges.map(charge => `
            <tr>
                <td>${charge.district}</td>
                <td>${charge.city || 'All Cities (Default)'}</td>
                <td>${CONFIG.CURRENCY_SYMBOL} ${charge.charge?.toLocaleString() || 0}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editDeliveryCharge('${charge.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="confirmDeleteDeliveryCharge('${charge.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading delivery charges:', error);
    }
}

function openDeliveryModal(charge = null) {
    editingItem = charge;
    
    document.getElementById('deliveryModalTitle').textContent = 
        charge ? 'Edit Delivery Charge' : 'Add Delivery Charge';
    
    const form = document.getElementById('deliveryForm');
    if (form) form.reset();
    
    document.getElementById('deliveryId').value = '';
    
    if (charge) {
        document.getElementById('deliveryId').value = charge.id || '';
        document.getElementById('deliveryDistrict').value = charge.district || '';
        document.getElementById('deliveryCity').value = charge.city || '';
        document.getElementById('deliveryCharge').value = charge.charge || '';
    }
    
    document.getElementById('deliveryModal').classList.add('active');
}

async function editDeliveryCharge(id) {
    try {
        const charges = await DeliveryService.getAll();
        const charge = charges.find(c => c.id === id);
        if (charge) {
            openDeliveryModal(charge);
        }
    } catch (error) {
        console.error('Error loading delivery charge:', error);
        showToast('error', 'Failed to load delivery charge');
    }
}

async function handleDeliverySubmit(e) {
    e.preventDefault();
    
    const chargeId = document.getElementById('deliveryId').value;
    
    const chargeData = {
        district: document.getElementById('deliveryDistrict').value,
        city: document.getElementById('deliveryCity').value || null,
        charge: parseFloat(document.getElementById('deliveryCharge').value) || 0
    };
    
    try {
        if (chargeId) {
            await DeliveryService.update(chargeId, chargeData);
        } else {
            await DeliveryService.create(chargeData);
        }
        
        closeModal('deliveryModal');
        await loadDeliveryCharges();
        showToast('success', `Delivery charge ${chargeId ? 'updated' : 'created'} successfully`);
    } catch (error) {
        console.error('Error saving delivery charge:', error);
        showToast('error', 'Failed to save delivery charge');
    }
}

function confirmDeleteDeliveryCharge(id) {
    deleteCallback = async () => {
        try {
            await DeliveryService.delete(id);
            await loadDeliveryCharges();
            showToast('success', 'Delivery charge deleted successfully');
        } catch (error) {
            console.error('Error deleting delivery charge:', error);
            showToast('error', 'Failed to delete delivery charge');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Payment Methods ==========
async function loadPaymentMethods() {
    try {
        const methods = await PaymentService.getAll();
        const container = document.getElementById('paymentCards');
        
        if (!container) return;
        
        if (!methods || methods.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--gray-600);">No payment methods found.</p>';
            return;
        }
        
        const icons = {
            'bank_transfer': 'fa-building-columns',
            'koko_pay': 'fa-credit-card',
            'card_payment': 'fa-credit-card'
        };
        
        container.innerHTML = methods.map(method => `
            <div class="payment-card" data-id="${method.id}">
                <div class="payment-card-header">
                    <h3><i class="fas ${icons[method.type] || 'fa-money-bill'}" style="margin-right: 8px; color: var(--primary-blue);"></i>${method.name}</h3>
                    <label class="toggle-switch">
                        <input type="checkbox" ${method.is_active ? 'checked' : ''} 
                               onchange="togglePaymentMethod('${method.id}', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea rows="2" onchange="updatePaymentDescription('${method.id}', this.value)">${method.description || ''}</textarea>
                </div>
                ${method.type === 'bank_transfer' ? `
                    <div class="form-group">
                        <label>Bank Details</label>
                        <textarea rows="3" onchange="updatePaymentDetails('${method.id}', this.value)">${method.details || ''}</textarea>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading payment methods:', error);
    }
}

async function togglePaymentMethod(id, isActive) {
    try {
        await PaymentService.update(id, { is_active: isActive });
        showToast('success', 'Payment method updated');
    } catch (error) {
        console.error('Error updating payment method:', error);
        showToast('error', 'Failed to update payment method');
    }
}

async function updatePaymentDescription(id, description) {
    try {
        await PaymentService.update(id, { description });
    } catch (error) {
        console.error('Error updating payment description:', error);
    }
}

async function updatePaymentDetails(id, details) {
    try {
        await PaymentService.update(id, { details });
    } catch (error) {
        console.error('Error updating payment details:', error);
    }
}

// ========== Content Management ==========
async function loadContentData() {
    try {
        const content = await JSONBinService.getContent();
        
        if (!content) return;
        
        // Promotions
        if (content.promotions) {
            const promoActive = document.getElementById('promoActive');
            const promoTextEn = document.getElementById('promoTextEn');
            const promoTextSi = document.getElementById('promoTextSi');
            const promoTextTa = document.getElementById('promoTextTa');
            
            if (promoActive) promoActive.checked = content.promotions.active || false;
            if (promoTextEn) promoTextEn.value = content.promotions.text?.en || '';
            if (promoTextSi) promoTextSi.value = content.promotions.text?.si || '';
            if (promoTextTa) promoTextTa.value = content.promotions.text?.ta || '';
        }
        
        // About
        if (content.about) {
            const aboutTitleEn = document.getElementById('aboutTitleEn');
            const aboutTitleSi = document.getElementById('aboutTitleSi');
            const aboutTitleTa = document.getElementById('aboutTitleTa');
            const aboutContentEn = document.getElementById('aboutContentEn');
            const aboutContentSi = document.getElementById('aboutContentSi');
            const aboutContentTa = document.getElementById('aboutContentTa');
            
            if (aboutTitleEn) aboutTitleEn.value = content.about.title?.en || '';
            if (aboutTitleSi) aboutTitleSi.value = content.about.title?.si || '';
            if (aboutTitleTa) aboutTitleTa.value = content.about.title?.ta || '';
            if (aboutContentEn) aboutContentEn.value = content.about.content?.en || '';
            if (aboutContentSi) aboutContentSi.value = content.about.content?.si || '';
            if (aboutContentTa) aboutContentTa.value = content.about.content?.ta || '';
        }
        
        // Contact
        if (content.contact) {
            const contactPhone = document.getElementById('contactPhone');
            const contactWhatsapp = document.getElementById('contactWhatsapp');
            const contactEmail = document.getElementById('contactEmail');
            const contactAddressEn = document.getElementById('contactAddressEn');
            const contactFacebook = document.getElementById('contactFacebook');
            const contactInstagram = document.getElementById('contactInstagram');
            
            if (contactPhone) contactPhone.value = content.contact.phone || '';
            if (contactWhatsapp) contactWhatsapp.value = content.contact.whatsapp || '';
            if (contactEmail) contactEmail.value = content.contact.email || '';
            if (contactAddressEn) contactAddressEn.value = content.contact.address?.en || '';
            if (contactFacebook) contactFacebook.value = content.contact.socialMedia?.facebook || '';
            if (contactInstagram) contactInstagram.value = content.contact.socialMedia?.instagram || '';
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showToast('error', 'Failed to load content');
    }
}

async function handlePromotionsSubmit(e) {
    e.preventDefault();
    
    try {
        const content = await JSONBinService.getContent();
        
        content.promotions = {
            active: document.getElementById('promoActive').checked,
            text: {
                en: document.getElementById('promoTextEn').value,
                si: document.getElementById('promoTextSi').value,
                ta: document.getElementById('promoTextTa').value
            }
        };
        
        await JSONBinService.updateContent(content);
        showToast('success', 'Promotions updated successfully');
    } catch (error) {
        console.error('Error updating promotions:', error);
        showToast('error', 'Failed to update promotions');
    }
}

async function handleAboutSubmit(e) {
    e.preventDefault();
    
    try {
        const content = await JSONBinService.getContent();
        
        content.about = {
            ...content.about,
            title: {
                en: document.getElementById('aboutTitleEn').value,
                si: document.getElementById('aboutTitleSi').value,
                ta: document.getElementById('aboutTitleTa').value
            },
            content: {
                en: document.getElementById('aboutContentEn').value,
                si: document.getElementById('aboutContentSi').value,
                ta: document.getElementById('aboutContentTa').value
            }
        };
        
        await JSONBinService.updateContent(content);
        showToast('success', 'About page updated successfully');
    } catch (error) {
        console.error('Error updating about:', error);
        showToast('error', 'Failed to update about page');
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    try {
        const content = await JSONBinService.getContent();
        
        content.contact = {
            ...content.contact,
            phone: document.getElementById('contactPhone').value,
            whatsapp: document.getElementById('contactWhatsapp').value,
            email: document.getElementById('contactEmail').value,
            address: {
                ...content.contact?.address,
                en: document.getElementById('contactAddressEn').value
            },
            socialMedia: {
                ...content.contact?.socialMedia,
                facebook: document.getElementById('contactFacebook').value,
                instagram: document.getElementById('contactInstagram').value
            }
        };
        
        await JSONBinService.updateContent(content);
        showToast('success', 'Contact info updated successfully');
    } catch (error) {
        console.error('Error updating contact:', error);
        showToast('error', 'Failed to update contact info');
    }
}

// ========== Banners ==========
async function loadBanners() {
    try {
        const banners = await JSONBinService.getBanners() || [];
        const grid = document.getElementById('bannersGrid');
        
        if (!grid) return;
        
        if (banners.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--gray-600);">
                    <i class="fas fa-image" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 1rem; display: block;"></i>
                    <p>No banners found. Add your first banner!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = banners.map((banner, index) => `
            <div class="banner-card">
                <div class="banner-card-image">
                    <img src="${banner.image}" alt="${banner.title?.en || 'Banner'}" onerror="this.src='assets/images/placeholder.jpg'">
                </div>
                <div class="banner-card-content">
                    <h4>${banner.title?.en || 'Untitled'}</h4>
                    <p>${banner.subtitle?.en || ''}</p>
                    <div class="banner-card-actions">
                        <button class="action-btn edit" onclick="editBanner(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="confirmDeleteBanner(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading banners:', error);
    }
}

function initBannerModal() {
    if (document.getElementById('bannerModal')) return;
    
    const modalHTML = `
        <div class="admin-modal" id="bannerModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="bannerModalTitle">Add Banner</h2>
                    <button class="modal-close" onclick="closeModal('bannerModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="bannerForm">
                    <input type="hidden" id="bannerIndex" value="-1">
                    <div class="form-group">
                        <label>Banner Image URL *</label>
                        <input type="url" id="bannerImage" required placeholder="https://example.com/image.jpg">
                    </div>
                    <div class="form-group">
                        <label>Title (English) *</label>
                        <input type="text" id="bannerTitleEn" required>
                    </div>
                    <div class="form-group">
                        <label>Title (Sinhala)</label>
                        <input type="text" id="bannerTitleSi">
                    </div>
                    <div class="form-group">
                        <label>Title (Tamil)</label>
                        <input type="text" id="bannerTitleTa">
                    </div>
                    <div class="form-group">
                        <label>Subtitle (English)</label>
                        <input type="text" id="bannerSubtitleEn">
                    </div>
                    <div class="form-group">
                        <label>Subtitle (Sinhala)</label>
                        <input type="text" id="bannerSubtitleSi">
                    </div>
                    <div class="form-group">
                        <label>Subtitle (Tamil)</label>
                        <input type="text" id="bannerSubtitleTa">
                    </div>
                    <div class="form-group">
                        <label>Link URL</label>
                        <input type="text" id="bannerLink" placeholder="shop.html">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="cancel-btn" onclick="closeModal('bannerModal')">Cancel</button>
                        <button type="submit" class="save-btn">
                            <i class="fas fa-save"></i>
                            Save Banner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('bannerForm').addEventListener('submit', handleBannerSubmit);
}

function openBannerModal(banner = null, index = -1) {
    initBannerModal();
    
    document.getElementById('bannerModalTitle').textContent = banner ? 'Edit Banner' : 'Add Banner';
    document.getElementById('bannerIndex').value = index;
    
    const form = document.getElementById('bannerForm');
    
    if (banner) {
        document.getElementById('bannerImage').value = banner.image || '';
        document.getElementById('bannerTitleEn').value = banner.title?.en || '';
        document.getElementById('bannerTitleSi').value = banner.title?.si || '';
        document.getElementById('bannerTitleTa').value = banner.title?.ta || '';
        document.getElementById('bannerSubtitleEn').value = banner.subtitle?.en || '';
        document.getElementById('bannerSubtitleSi').value = banner.subtitle?.si || '';
        document.getElementById('bannerSubtitleTa').value = banner.subtitle?.ta || '';
        document.getElementById('bannerLink').value = banner.link || '';
    } else {
        form.reset();
        document.getElementById('bannerIndex').value = -1;
    }
    
    document.getElementById('bannerModal').classList.add('active');
}

async function handleBannerSubmit(e) {
    e.preventDefault();
    
    const index = parseInt(document.getElementById('bannerIndex').value);
    const bannerData = {
        id: index >= 0 ? index + 1 : Date.now(),
        image: document.getElementById('bannerImage').value,
        title: {
            en: document.getElementById('bannerTitleEn').value,
            si: document.getElementById('bannerTitleSi').value || '',
            ta: document.getElementById('bannerTitleTa').value || ''
        },
        subtitle: {
            en: document.getElementById('bannerSubtitleEn').value || '',
            si: document.getElementById('bannerSubtitleSi').value || '',
            ta: document.getElementById('bannerSubtitleTa').value || ''
        },
        link: document.getElementById('bannerLink').value || 'shop.html'
    };
    
    try {
        const content = await JSONBinService.getContent();
        let banners = content.banners || [];
        
        if (index >= 0 && index < banners.length) {
            banners[index] = bannerData;
        } else {
            banners.push(bannerData);
        }
        
        content.banners = banners;
        await JSONBinService.updateContent(content);
        
        closeModal('bannerModal');
        await loadBanners();
        showToast('success', `Banner ${index >= 0 ? 'updated' : 'added'} successfully`);
    } catch (error) {
        console.error('Error saving banner:', error);
        showToast('error', 'Failed to save banner');
    }
}

async function editBanner(index) {
    try {
        const banners = await JSONBinService.getBanners() || [];
        if (banners[index]) {
            openBannerModal(banners[index], index);
        }
    } catch (error) {
        console.error('Error loading banner:', error);
        showToast('error', 'Failed to load banner');
    }
}

function confirmDeleteBanner(index) {
    deleteCallback = async () => {
        try {
            const content = await JSONBinService.getContent();
            let banners = content.banners || [];
            banners.splice(index, 1);
            content.banners = banners;
            await JSONBinService.updateContent(content);
            await loadBanners();
            showToast('success', 'Banner deleted successfully');
        } catch (error) {
            console.error('Error deleting banner:', error);
            showToast('error', 'Failed to delete banner');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Utility Functions ==========
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    editingItem = null;
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file && preview) {
        const reader = new FileReader();
        reader.onload = (event) => {
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

function showToast(type, message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.className = `toast ${type}`;
        const msgEl = toast.querySelector('.toast-message');
        if (msgEl) msgEl.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// ========== Make Functions Globally Accessible ==========
window.editProduct = editProduct;
window.confirmDeleteProduct = confirmDeleteProduct;
window.editCategory = editCategory;
window.confirmDeleteCategory = confirmDeleteCategory;
window.editDeliveryCharge = editDeliveryCharge;
window.confirmDeleteDeliveryCharge = confirmDeleteDeliveryCharge;
window.togglePaymentMethod = togglePaymentMethod;
window.updatePaymentDescription = updatePaymentDescription;
window.updatePaymentDetails = updatePaymentDetails;
window.editBanner = editBanner;
window.confirmDeleteBanner = confirmDeleteBanner;
window.openBannerModal = openBannerModal;
window.closeModal = closeModal;
window.showToast = showToast;