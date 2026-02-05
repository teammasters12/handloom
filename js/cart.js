// js/cart.js - COMPLETE FIXED VERSION

const Cart = {
    items: [],
    
    // Initialize cart from localStorage
    init() {
        try {
            const savedCart = localStorage.getItem('danudara_cart');
            if (savedCart) {
                this.items = JSON.parse(savedCart);
                // Validate items
                this.items = this.items.filter(item => 
                    item && item.id && item.name && item.price && item.quantity
                );
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
            console.log('Cart saved:', this.items);
        } catch (error) {
            console.error('Error saving cart:', error);
        }
        this.updateCartUI();
    },

    // Add item to cart
    addItem(product, quantity = 1) {
        if (!product || !product.id) {
            console.error('Invalid product:', product);
            return false;
        }
        
        console.log('Adding to cart:', product, 'Quantity:', quantity);
        
        // Find existing item
        const existingIndex = this.items.findIndex(item => item.id === product.id);
        
        if (existingIndex >= 0) {
            // Update quantity
            this.items[existingIndex].quantity += quantity;
            console.log('Updated existing item quantity');
        } else {
            // Add new item
            const newItem = {
                id: product.id,
                name: product.name || 'Unknown Product',
                name_si: product.name_si || null,
                name_ta: product.name_ta || null,
                price: parseFloat(product.price) || 0,
                original_price: product.original_price ? parseFloat(product.original_price) : null,
                image: product.image_url || product.image || 'assets/images/placeholder.jpg',
                quantity: parseInt(quantity) || 1
            };
            this.items.push(newItem);
            console.log('Added new item:', newItem);
        }
        
        this.save();
        
        // Show toast notification
        if (typeof showToast === 'function') {
            showToast('success', 'Item added to cart');
        }
        
        return true;
    },

    // Remove item from cart
    removeItem(productId) {
        console.log('Removing item:', productId);
        
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        
        if (this.items.length < initialLength) {
            this.save();
            if (typeof showToast === 'function') {
                showToast('success', 'Item removed from cart');
            }
            return true;
        }
        return false;
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        console.log('Updating quantity:', productId, 'to', quantity);
        
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex >= 0) {
            const newQuantity = parseInt(quantity);
            
            if (newQuantity <= 0) {
                return this.removeItem(productId);
            } else {
                this.items[itemIndex].quantity = newQuantity;
                this.save();
                return true;
            }
        }
        return false;
    },

    // Increase item quantity
    increaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            return this.updateQuantity(productId, item.quantity + 1);
        }
        return false;
    },

    // Decrease item quantity
    decreaseQuantity(productId) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            return this.updateQuantity(productId, item.quantity - 1);
        }
        return false;
    },

    // Get item by ID
    getItem(productId) {
        return this.items.find(item => item.id === productId) || null;
    },

    // Check if item is in cart
    hasItem(productId) {
        return this.items.some(item => item.id === productId);
    },

    // Get cart subtotal
    getSubtotal() {
        const subtotal = this.items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
        
        console.log('Subtotal calculated:', subtotal);
        return subtotal;
    },

    // Get total items count
    getItemCount() {
        const count = this.items.reduce((total, item) => {
            return total + (parseInt(item.quantity) || 0);
        }, 0);
        
        return count;
    },

    // Get number of unique items
    getUniqueItemCount() {
        return this.items.length;
    },

    // Clear entire cart
    clear() {
        this.items = [];
        this.save();
        console.log('Cart cleared');
        
        if (typeof showToast === 'function') {
            showToast('success', 'Cart cleared');
        }
    },

    // Check if cart is empty
    isEmpty() {
        return this.items.length === 0;
    },

    // Update cart badges/counts in UI
    updateCartUI() {
        const count = this.getItemCount();
        
        // Update all cart count elements on the page
        const selectors = [
            '#cartCount',
            '#cartBadge',
            '.cart-count',
            '.cart-badge'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.textContent = count;
                    
                    // Hide badge if count is 0
                    if (count === 0) {
                        el.style.display = 'none';
                    } else {
                        el.style.display = 'flex';
                    }
                }
            });
        });
        
        console.log('Cart UI updated. Item count:', count);
    },

    // Get cart data for display
    getCartData() {
        return {
            items: this.items,
            itemCount: this.getItemCount(),
            uniqueItems: this.getUniqueItemCount(),
            subtotal: this.getSubtotal(),
            isEmpty: this.isEmpty()
        };
    },

    // Generate WhatsApp order message
    generateWhatsAppMessage(customerInfo, deliveryCharge, paymentMethod = null) {
        const subtotal = this.getSubtotal();
        const total = subtotal + (parseFloat(deliveryCharge) || 0);
        
        let message = `🛒 *New Order - Danudara Textiles*\n\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `📋 *Customer Details*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `📱 Phone: ${customerInfo.phone}\n`;
        message += `📍 District: ${customerInfo.district}\n`;
        
        if (customerInfo.city) {
            message += `🏙️ City: ${customerInfo.city}\n`;
        }
        
        if (paymentMethod) {
            message += `💳 Payment: ${paymentMethod}\n`;
        }
        
        message += `\n━━━━━━━━━━━━━━━━━━\n`;
        message += `📦 *Order Items*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;
        
        this.items.forEach((item, index) => {
            const itemTotal = (parseFloat(item.price) * parseInt(item.quantity));
            message += `*${index + 1}. ${item.name}*\n`;
            message += `   ├ Price: Rs.${parseFloat(item.price).toLocaleString()}\n`;
            message += `   ├ Qty: ${item.quantity}\n`;
            message += `   └ Total: Rs.${itemTotal.toLocaleString()}\n\n`;
        });
        
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `💰 *Order Summary*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `   Subtotal: Rs.${subtotal.toLocaleString()}\n`;
        message += `   Delivery: Rs.${(parseFloat(deliveryCharge) || 0).toLocaleString()}\n`;
        message += `   *TOTAL: Rs.${total.toLocaleString()}*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;
        message += `Thank you for shopping with us! 🙏\n`;
        message += `We will contact you shortly to confirm your order.`;
        
        return encodeURIComponent(message);
    },

    // Open WhatsApp with order
    checkout(customerInfo, deliveryCharge, paymentMethod = null) {
        // Validate cart
        if (this.items.length === 0) {
            console.error('Cart is empty');
            if (typeof showToast === 'function') {
                showToast('error', 'Your cart is empty');
            }
            return false;
        }
        
        // Validate customer info
        if (!customerInfo || !customerInfo.phone || !customerInfo.district) {
            console.error('Invalid customer info:', customerInfo);
            if (typeof showToast === 'function') {
                showToast('error', 'Please fill in all required fields');
            }
            return false;
        }
        
        console.log('Processing checkout:', {
            customerInfo,
            deliveryCharge,
            paymentMethod,
            items: this.items
        });
        
        // Generate message
        const message = this.generateWhatsAppMessage(customerInfo, deliveryCharge, paymentMethod);
        
        // Get WhatsApp number from config
        let whatsappNumber = '94112345678'; // Default
        
        if (typeof CONFIG !== 'undefined' && CONFIG.WHATSAPP_NUMBER) {
            whatsappNumber = CONFIG.WHATSAPP_NUMBER;
        }
        
        // Remove any non-numeric characters except +
        whatsappNumber = whatsappNumber.replace(/[^\d+]/g, '');
        
        // Build WhatsApp URL
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        console.log('Opening WhatsApp:', whatsappUrl);
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Optional: Clear cart after checkout
        // this.clear();
        
        return true;
    },

    // Export cart as JSON
    exportCart() {
        return JSON.stringify({
            items: this.items,
            exportDate: new Date().toISOString(),
            subtotal: this.getSubtotal(),
            itemCount: this.getItemCount()
        }, null, 2);
    },

    // Import cart from JSON
    importCart(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data && Array.isArray(data.items)) {
                this.items = data.items;
                this.save();
                return true;
            }
        } catch (error) {
            console.error('Error importing cart:', error);
        }
        return false;
    }
};

// Auto-initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Cart.init();
        console.log('Cart initialized on DOMContentLoaded');
    });
} else {
    Cart.init();
    console.log('Cart initialized immediately');
}

// Make Cart globally available
window.Cart = Cart;

// Debug: Log cart status
console.log('cart.js loaded. Cart object:', Cart);