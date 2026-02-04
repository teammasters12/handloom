// js/cart.js

const Cart = {
    items: [],
    
    // Initialize cart from localStorage
    init() {
        const savedCart = localStorage.getItem('danudara_cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
        this.updateCartUI();
    },

    // Save cart to localStorage
    save() {
        localStorage.setItem('danudara_cart', JSON.stringify(this.items));
        this.updateCartUI();
    },

    // Add item to cart
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                name_si: product.name_si,
                name_ta: product.name_ta,
                price: product.price,
                original_price: product.original_price,
                image: product.image_url,
                quantity: quantity
            });
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