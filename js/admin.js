// js/admin.js

// ========== State ==========
let currentSection = 'products';
let editingItem = null;
let deleteCallback = null;

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const session = await AuthService.getSession();
    
    if (session) {
        showDashboard(session.user.email);
    } else {
        showLogin();
    }
    
    initEventListeners();
});

// ========== Auth Functions ==========
function showLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard(email) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    document.getElementById('adminEmail').textContent = email;
    
    loadSectionData('products');
}

// ========== Event Listeners ==========
function initEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        
        try {
            await AuthService.login(email, password);
            showDashboard(email);
        } catch (error) {
            const errorEl = document.getElementById('loginError');
            errorEl.textContent = 'Invalid email or password';
            errorEl.classList.add('show');
        }
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await AuthService.logout();
        showLogin();
    });
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            navigateToSection(section);
        });
    });
    
    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
        document.querySelector('.admin-sidebar').classList.toggle('active');
    });
    
    // Add buttons
    document.getElementById('addProductBtn')?.addEventListener('click', () => openProductModal());
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => openCategoryModal());
    document.getElementById('addDeliveryBtn')?.addEventListener('click', () => openDeliveryModal());
    
    // Modal close buttons
    document.getElementById('productModalClose')?.addEventListener('click', () => closeModal('productModal'));
    document.getElementById('productCancelBtn')?.addEventListener('click', () => closeModal('productModal'));
    document.getElementById('categoryModalClose')?.addEventListener('click', () => closeModal('categoryModal'));
    document.getElementById('categoryCancelBtn')?.addEventListener('click', () => closeModal('categoryModal'));
    document.getElementById('deliveryModalClose')?.addEventListener('click', () => closeModal('deliveryModal'));
    document.getElementById('deliveryCancelBtn')?.addEventListener('click', () => closeModal('deliveryModal'));
    document.getElementById('deleteModalClose')?.addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('deleteCancelBtn')?.addEventListener('click', () => closeModal('deleteModal'));
    
    // Form submissions
    document.getElementById('productForm')?.addEventListener('submit', handleProductSubmit);
    document.getElementById('categoryForm')?.addEventListener('submit', handleCategorySubmit);
    document.getElementById('deliveryForm')?.addEventListener('submit', handleDeliverySubmit);
    document.getElementById('promotionsForm')?.addEventListener('submit', handlePromotionsSubmit);
    document.getElementById('aboutForm')?.addEventListener('submit', handleAboutSubmit);
    document.getElementById('contactForm')?.addEventListener('submit', handleContactSubmit);
    
    // Delete confirmation
    document.getElementById('deleteConfirmBtn')?.addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
            closeModal('deleteModal');
        }
    });
    
    // Content tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${tab}Panel`).classList.add('active');
        });
    });
    
    // Image preview
    document.getElementById('productImage')?.addEventListener('change', handleImagePreview);
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
    document.getElementById(`${section}Section`).style.display = 'block';
    
    // Update page title
    const titles = {
        products: 'Products',
        categories: 'Categories',
        delivery: 'Delivery Charges',
        payments: 'Payment Methods',
        content: 'Content Management',
        banners: 'Banners'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    // Load section data
    loadSectionData(section);
    
    // Close mobile sidebar
    document.querySelector('.admin-sidebar').classList.remove('active');
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
    const products = await ProductService.getAll();
    const tbody = document.getElementById('productsTableBody');
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image_url || 'assets/images/placeholder.jpg'}" 
                     alt="${product.name}" class="product-thumb">
            </td>
            <td>${product.name}</td>
            <td>${product.categories?.name || '-'}</td>
            <td>${CONFIG.CURRENCY_SYMBOL} ${product.price.toLocaleString()}</td>
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
}

async function loadCategoriesForSelect() {
    const categories = await CategoryService.getAll();
    const select = document.getElementById('productCategory');
    
    select.innerHTML = '<option value="">Select Category</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function openProductModal(product = null) {
    editingItem = product;
    
    document.getElementById('productModalTitle').textContent = 
        product ? 'Edit Product' : 'Add Product';
    
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload or drag and drop</span>
    `;
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productNameSi').value = product.name_si || '';
        document.getElementById('productNameTa').value = product.name_ta || '';
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOriginalPrice').value = product.original_price || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productDescriptionSi').value = product.description_si || '';
        document.getElementById('productDescriptionTa').value = product.description_ta || '';
        document.getElementById('productActive').checked = product.is_active;
        document.getElementById('productFeatured').checked = product.is_featured;
        
        if (product.image_url) {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${product.image_url}" alt="Product">
            `;
        }
    }
    
    document.getElementById('productModal').classList.add('active');
}

async function editProduct(id) {
    const product = await ProductService.getById(id);
    openProductModal(product);
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const imageFile = document.getElementById('productImage').files[0];
    
    const productData = {
        name: document.getElementById('productName').value,
        name_si: document.getElementById('productNameSi').value || null,
        name_ta: document.getElementById('productNameTa').value || null,
        category_id: document.getElementById('productCategory').value || null,
        price: parseFloat(document.getElementById('productPrice').value),
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
            // Update
            savedProduct = await ProductService.update(productId, productData);
        } else {
            // Create
            savedProduct = await ProductService.create(productData);
        }
        
        // Upload image if selected
        if (imageFile) {
            const imageUrl = await StorageService.uploadProductImage(imageFile, savedProduct.id);
            await ProductService.update(savedProduct.id, { image_url: imageUrl });
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
            showToast('error', 'Failed to delete product');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Categories ==========
async function loadCategories() {
    const categories = await CategoryService.getAll();
    const tbody = document.getElementById('categoriesTableBody');
    
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
}

function openCategoryModal(category = null) {
    editingItem = category;
    
    document.getElementById('categoryModalTitle').textContent = 
        category ? 'Edit Category' : 'Add Category';
    
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    
    if (category) {
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryNameSi').value = category.name_si || '';
        document.getElementById('categoryNameTa').value = category.name_ta || '';
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categorySortOrder').value = category.sort_order || 0;
        document.getElementById('categoryActive').checked = category.is_active;
    }
    
    document.getElementById('categoryModal').classList.add('active');
}

async function editCategory(id) {
    const categories = await CategoryService.getAll();
    const category = categories.find(c => c.id === id);
    openCategoryModal(category);
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
            showToast('error', 'Failed to delete category');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Delivery Charges ==========
async function loadDeliveryCharges() {
    const charges = await DeliveryService.getAll();
    const tbody = document.getElementById('deliveryTableBody');
    
    tbody.innerHTML = charges.map(charge => `
        <tr>
            <td>${charge.district}</td>
            <td>${charge.city || 'All Cities (Default)'}</td>
            <td>${CONFIG.CURRENCY_SYMBOL} ${charge.charge.toLocaleString()}</td>
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
}

function openDeliveryModal(charge = null) {
    editingItem = charge;
    
    document.getElementById('deliveryModalTitle').textContent = 
        charge ? 'Edit Delivery Charge' : 'Add Delivery Charge';
    
    document.getElementById('deliveryForm').reset();
    document.getElementById('deliveryId').value = '';
    
    if (charge) {
        document.getElementById('deliveryId').value = charge.id;
        document.getElementById('deliveryDistrict').value = charge.district;
        document.getElementById('deliveryCity').value = charge.city || '';
        document.getElementById('deliveryCharge').value = charge.charge;
    }
    
    document.getElementById('deliveryModal').classList.add('active');
}

async function editDeliveryCharge(id) {
    const charges = await DeliveryService.getAll();
    const charge = charges.find(c => c.id === id);
    openDeliveryModal(charge);
}

async function handleDeliverySubmit(e) {
    e.preventDefault();
    
    const chargeId = document.getElementById('deliveryId').value;
    
    const chargeData = {
        district: document.getElementById('deliveryDistrict').value,
        city: document.getElementById('deliveryCity').value || null,
        charge: parseFloat(document.getElementById('deliveryCharge').value)
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
            showToast('error', 'Failed to delete delivery charge');
        }
    };
    document.getElementById('deleteModal').classList.add('active');
}

// ========== Payment Methods ==========
async function loadPaymentMethods() {
    const methods = await PaymentService.getAll();
    const container = document.getElementById('paymentCards');
    
    container.innerHTML = methods.map(method => `
        <div class="payment-card" data-id="${method.id}">
            <div class="payment-card-header">
                <h3>${method.name}</h3>
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
}

async function togglePaymentMethod(id, isActive) {
    try {
        await PaymentService.update(id, { is_active: isActive });
        showToast('success', 'Payment method updated');
    } catch (error) {
        showToast('error', 'Failed to update payment method');
    }
}

async function updatePaymentDescription(id, description) {
    try {
        await PaymentService.update(id, { description });
    } catch (error) {
        showToast('error', 'Failed to update');
    }
}

async function updatePaymentDetails(id, details) {
    try {
        await PaymentService.update(id, { details });
    } catch (error) {
        showToast('error', 'Failed to update');
    }
}

// ========== Content Management ==========
async function loadContentData() {
    const content = await JSONBinService.getContent();
    
    // Promotions
    if (content.promotions) {
        document.getElementById('promoActive').checked = content.promotions.active;
        document.getElementById('promoTextEn').value = content.promotions.text?.en || '';
        document.getElementById('promoTextSi').value = content.promotions.text?.si || '';
        document.getElementById('promoTextTa').value = content.promotions.text?.ta || '';
    }
    
    // About
    if (content.about) {
        document.getElementById('aboutTitleEn').value = content.about.title?.en || '';
        document.getElementById('aboutTitleSi').value = content.about.title?.si || '';
        document.getElementById('aboutTitleTa').value = content.about.title?.ta || '';
        document.getElementById('aboutContentEn').value = content.about.content?.en || '';
        document.getElementById('aboutContentSi').value = content.about.content?.si || '';
        document.getElementById('aboutContentTa').value = content.about.content?.ta || '';
    }
    
    // Contact
    if (content.contact) {
        document.getElementById('contactPhone').value = content.contact.phone || '';
        document.getElementById('contactWhatsapp').value = content.contact.whatsapp || '';
        document.getElementById('contactEmail').value = content.contact.email || '';
        document.getElementById('contactAddressEn').value = content.contact.address?.en || '';
        document.getElementById('contactFacebook').value = content.contact.socialMedia?.facebook || '';
        document.getElementById('contactInstagram').value = content.contact.socialMedia?.instagram || '';
    }
}

async function handlePromotionsSubmit(e) {
    e.preventDefault();
    
    try {
        await JSONBinService.updateSection('promotions', {
            active: document.getElementById('promoActive').checked,
            text: {
                en: document.getElementById('promoTextEn').value,
                si: document.getElementById('promoTextSi').value,
                ta: document.getElementById('promoTextTa').value
            }
        });
        showToast('success', 'Promotions updated successfully');
    } catch (error) {
        showToast('error', 'Failed to update promotions');
    }
}

async function handleAboutSubmit(e) {
    e.preventDefault();
    
    try {
        await JSONBinService.updateSection('about', {
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
        });
        showToast('success', 'About page updated successfully');
    } catch (error) {
        showToast('error', 'Failed to update about page');
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    try {
        await JSONBinService.updateSection('contact', {
            phone: document.getElementById('contactPhone').value,
            whatsapp: document.getElementById('contactWhatsapp').value,
            email: document.getElementById('contactEmail').value,
            address: {
                en: document.getElementById('contactAddressEn').value
            },
            socialMedia: {
                facebook: document.getElementById('contactFacebook').value,
                instagram: document.getElementById('contactInstagram').value
            }
        });
        showToast('success', 'Contact info updated successfully');
    } catch (error) {
        showToast('error', 'Failed to update contact info');
    }
}

// ========== Banners ==========
async function loadBanners() {
    const banners = await JSONBinService.getBanners();
    const grid = document.getElementById('bannersGrid');
    
    if (!banners || banners.length === 0) {
        grid.innerHTML = '<p>No banners found. Add your first banner!</p>';
        return;
    }
    
    grid.innerHTML = banners.map((banner, index) => `
        <div class="banner-card">
            <div class="banner-card-image">
                <img src="${banner.image}" alt="${banner.title?.en || 'Banner'}">
            </div>
            <div class="banner-card-content">
                <h4>${banner.title?.en || 'Untitled'}</h4>
                <p>${banner.subtitle?.en || ''}</p>
                <div class="banner-card-actions">
                    <button class="action-btn edit" onclick="editBanner(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteBanner(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ========== Utility Functions ==========
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    editingItem = null;
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${event.target.result}" alt="Preview">
            `;
        };
        reader.readAsDataURL(file);
    }
}

function showToast(type, message) {
    const toast = document.getElementById('toast');
    toast.className = `toast ${type}`;
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Make functions globally accessible
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
window.deleteBanner = deleteBanner;