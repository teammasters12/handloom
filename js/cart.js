// js/cart.js - FIXED VERSION

const Cart = {
    items: [],
    
    // Initialize cart from localStorage
    init() {
        try {
            const savedCart = localStorage.getItem('danudara_cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
            } else {
                this.items = [];
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
        }
        this.updateCartUI();
        return this;
    },

    // Save cart to localStorage
    save() {
        try {
            localStorage.setItem('danudara_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
        this.updateCartUI();
    },

    // Add item to cart
    addItem(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            return;
        }
        
        const existingIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
            this.items[existingIndex].quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                name_si: product.name_si || null,
                name_ta: product.name_ta || null,
                price: parseFloat(product.price),
                original_price: product.original_price ? parseFloat(product.original_price) : null,
                image: product.image_url || product.image || 'assets/images/placeholder.jpg',
                quantity: quantity
            });
        }
        
        this.save();
        
        if (typeof showToast === 'function') {
            showToast('success', 'Item added to cart');
        }
    },

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        
        if (typeof showToast === 'function') {
            showToast('success', 'Item removed from cart');
        }
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex >= 0) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.items[itemIndex].quantity = quantity;
                this.save();
            }
        }
    },

    // Get cart subtotal
    getSubtotal() {
        return this.items.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
    },

    // Get total items count
    getItemCount() {
        return this.items.reduce((count, item) => count + parseInt(item.quantity), 0);
    },

    // Clear cart
    clear() {
        this.items = [];
        this.save();
    },

    // Update cart badges/counts in UI
    updateCartUI() {
        const count = this.getItemCount();
        
        // Update all cart count elements
        const cartCountElements = document.querySelectorAll('#cartCount, #cartBadge, .cart-count, .cart-badge');
        cartCountElements.forEach(el => {
            if (el) el.textContent = count;
        });
    },

    // Generate WhatsApp order message
// Generate WhatsApp order message - UPDATED WITH PAYMENT METHOD
generateWhatsAppMessage(customerInfo, deliveryCharge, paymentMethod = null) {
    const subtotal = this.getSubtotal();
    const total = subtotal + deliveryCharge;
    
    let message = `🛒 *New Order - Danudara Textiles*\n\n`;
    message += `📱 *Phone:* ${customerInfo.phone}\n`;
    message += `📍 *District:* ${customerInfo.district}\n`;
    if (customerInfo.city) {
        message += `🏙️ *City:* ${customerInfo.city}\n`;
    }
    if (paymentMethod) {
        message += `💳 *Payment:* ${paymentMethod}\n`;
    }
    message += `\n━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 *Order Items:*\n\n`;
    
    this.items.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Qty: ${item.quantity} × Rs.${parseFloat(item.price).toLocaleString()}\n`;
        message += `   = Rs.${(item.quantity * item.price).toLocaleString()}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 *Subtotal:* Rs.${subtotal.toLocaleString()}\n`;
    message += `🚚 *Delivery:* Rs.${deliveryCharge.toLocaleString()}\n`;
    message += `💰 *Total:* Rs.${total.toLocaleString()}\n`;
    message += `━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Thank you for shopping with Danudara Textiles! 🙏`;
    
    return encodeURIComponent(message);
},

// Open WhatsApp with order - UPDATED
checkout(customerInfo, deliveryCharge, paymentMethod = null) {
    if (this.items.length === 0) {
        if (typeof showToast === 'function') {
            showToast('error', 'Your cart is empty');
        }
        return;
    }
    
    const message = this.generateWhatsAppMessage(customerInfo, deliveryCharge, paymentMethod);
    const whatsappNumber = (typeof CONFIG !== 'undefined' && CONFIG.WHATSAPP_NUMBER) 
        ? CONFIG.WHATSAPP_NUMBER 
        : '94112345678';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
}

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Cart.init());
} else {
    Cart.init();
}

// Make Cart globally available
window.Cart = Cart;            });
        }
        
        this.save();
        showToast('success', getTranslation('itemAdded'));
    },

    // Remove item from cart
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        showToast('success', getTranslation('itemRemoved'));
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.save();
                showToast('success', getTranslation('cartUpdated'));
            }
        }
    },

    // Get cart total
    getSubtotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    // Get total items count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    // Clear cart
    clear() {
        this.items = [];
        this.save();
    },

    // Update cart badges/counts in UI
    updateCartUI() {
        const count = this.getItemCount();
        const cartCount = document.getElementById('cartCount');
        const cartBadge = document.getElementById('cartBadge');
        
        if (cartCount) cartCount.textContent = count;
        if (cartBadge) cartBadge.textContent = count;
    },

    // Generate WhatsApp order message
    generateWhatsAppMessage(customerInfo, deliveryCharge) {
        const lang = getCurrentLanguage();
        const subtotal = this.getSubtotal();
        const total = subtotal + deliveryCharge;
        
        let message = `🛒 *New Order - Danudara Textiles*\n\n`;
        message += `📱 Phone: ${customerInfo.phone}\n`;
        message += `📍 District: ${customerInfo.district}\n`;
        if (customerInfo.city) {
            message += `🏙️ City: ${customerInfo.city}\n`;
        }
        message += `\n━━━━━━━━━━━━━━━━━━\n`;
        message += `*Order Items:*\n\n`;
        
        this.items.forEach((item, index) => {
            const itemName = lang === 'si' ? (item.name_si || item.name) : 
                            lang === 'ta' ? (item.name_ta || item.name) : item.name;
            message += `${index + 1}. ${itemName}\n`;
            message += `   Qty: ${item.quantity} × Rs.${item.price.toLocaleString()}\n`;
            message += `   = Rs.${(item.quantity * item.price).toLocaleString()}\n\n`;
        });
        
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `Subtotal: Rs.${subtotal.toLocaleString()}\n`;
        message += `Delivery: Rs.${deliveryCharge.toLocaleString()}\n`;
        message += `*Total: Rs.${total.toLocaleString()}*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;
        message += `Thank you for shopping with Danudara Textiles! 🙏`;
        
        return encodeURIComponent(message);
    },

    // Open WhatsApp with order
    checkout(customerInfo, deliveryCharge) {
        const message = this.generateWhatsAppMessage(customerInfo, deliveryCharge);
        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});

window.Cart = Cart;
