// js/jsonbin.js

const JSONBinService = {
    binId: CONFIG.JSONBIN_BIN_ID,
    apiKey: CONFIG.JSONBIN_API_KEY,
    baseUrl: CONFIG.JSONBIN_BASE_URL,

    // Get all content
    async getContent() {
        try {
            const response = await fetch(`${this.baseUrl}/b/${this.binId}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch content');
            
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('JSONBin fetch error:', error);
            return this.getDefaultContent();
        }
    },

    // Update content (Admin only)
    async updateContent(content) {
        const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': this.apiKey
            },
            body: JSON.stringify(content)
        });
        
        if (!response.ok) throw new Error('Failed to update content');
        
        const data = await response.json();
        return data.record;
    },

    // Get specific section
    async getSection(section) {
        const content = await this.getContent();
        return content[section] || null;
    },

    // Update specific section
    async updateSection(section, data) {
        const content = await this.getContent();
        content[section] = data;
        return await this.updateContent(content);
    },

    // Get banners
    async getBanners() {
        return await this.getSection('banners');
    },

    // Get promotions
    async getPromotions() {
        return await this.getSection('promotions');
    },

    // Get about content
    async getAboutContent() {
        return await this.getSection('about');
    },

    // Get contact details
    async getContactDetails() {
        return await this.getSection('contact');
    },

    // Get language strings
    async getLanguageStrings() {
        return await this.getSection('languages');
    },

    // Get new arrivals config
    async getNewArrivalsConfig() {
        return await this.getSection('newArrivals');
    },

    // Default content structure
    getDefaultContent() {
        return {
            banners: [
                {
                    id: 1,
                    image: 'assets/images/banner1.jpg',
                    title: {
                        en: 'Premium Quality Textiles',
                        si: 'උසස් තත්ත්වයේ රෙදිපිළි',
                        ta: 'தரமான ஜவுளிகள்'
                    },
                    subtitle: {
                        en: 'Discover our exclusive collection',
                        si: 'අපගේ සුවිශේෂී එකතුව සොයා ගන්න',
                        ta: 'எங்களின் பிரத்யேக தொகுப்பைக் கண்டறியுங்கள்'
                    },
                    link: 'shop.html'
                }
            ],
            promotions: {
                active: true,
                text: {
                    en: '🎉 Free delivery on orders over Rs. 5000!',
                    si: '🎉 රු. 5000 ට වැඩි ඇණවුම් සඳහා නොමිලේ බෙදා හැරීම!',
                    ta: '🎉 ரூ. 5000 க்கு மேல் ஆர்டர்களுக்கு இலவச டெலிவரி!'
                }
            },
            about: {
                title: {
                    en: 'About Danudara Textiles',
                    si: 'දනුදර ටෙක්ස්ටයිල්ස් ගැන',
                    ta: 'தனுதரா ஜவுளிகள் பற்றி'
                },
                content: {
                    en: 'Danudara Textiles is a leading textile company in Sri Lanka...',
                    si: 'දනුදර ටෙක්ස්ටයිල්ස් යනු ශ්‍රී ලංකාවේ ප්‍රමුඛ රෙදිපිළි සමාගමකි...',
                    ta: 'தனுதரா ஜவுளிகள் இலங்கையில் முன்னணி ஜவுளி நிறுவனமாகும்...'
                },
                image: 'assets/images/about.jpg'
            },
            contact: {
                phone: '+94 XX XXX XXXX',
                whatsapp: '94XXXXXXXXX',
                email: 'info@danudaratextiles.lk',
                address: {
                    en: 'Colombo, Sri Lanka',
                    si: 'කොළඹ, ශ්‍රී ලංකාව',
                    ta: 'கொழும்பு, இலங்கை'
                },
                socialMedia: {
                    facebook: '',
                    instagram: '',
                    youtube: ''
                }
            },
            newArrivals: {
                enabled: true,
                limit: 8,
                title: {
                    en: 'New Arrivals',
                    si: 'අලුත් එකතු කිරීම්',
                    ta: 'புதிய வரவுகள்'
                }
            },
            languages: {
                en: {
                    home: 'Home',
                    shop: 'Shop',
                    cart: 'Cart',
                    about: 'About',
                    contact: 'Contact',
                    admin: 'Admin',
                    categories: 'Categories',
                    newArrivals: 'New Arrivals',
                    featuredProducts: 'Featured Products',
                    allProducts: 'All Products',
                    searchPlaceholder: 'Search products...',
                    addToCart: 'Add to Cart',
                    viewDetails: 'View Details',
                    quantity: 'Quantity',
                    subtotal: 'Subtotal',
                    deliveryCharge: 'Delivery Charge',
                    total: 'Total',
                    checkout: 'Checkout via WhatsApp',
                    emptyCart: 'Your cart is empty',
                    continueShopping: 'Continue Shopping',
                    phone: 'Phone Number',
                    district: 'District',
                    city: 'City (Optional)',
                    placeOrder: 'Place Order',
                    orderSummary: 'Order Summary',
                    paymentMethods: 'Payment Methods',
                    bankTransfer: 'Bank Transfer',
                    kokoPay: 'Koko Pay',
                    cardPayment: 'Card Payment',
                    selectDistrict: 'Select District',
                    selectCity: 'Select City',
                    required: 'Required',
                    optional: 'Optional',
                    login: 'Login',
                    logout: 'Logout',
                    email: 'Email',
                    password: 'Password',
                    adminPanel: 'Admin Panel',
                    products: 'Products',
                    addProduct: 'Add Product',
                    editProduct: 'Edit Product',
                    deleteProduct: 'Delete Product',
                    productName: 'Product Name',
                    productPrice: 'Price',
                    productDescription: 'Description',
                    productImage: 'Image',
                    category: 'Category',
                    save: 'Save',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    confirm: 'Confirm',
                    success: 'Success',
                    error: 'Error',
                    loading: 'Loading...',
                    noProducts: 'No products found',
                    filters: 'Filters',
                    sortBy: 'Sort By',
                    priceLoToHi: 'Price: Low to High',
                    priceHiToLo: 'Price: High to Low',
                    newest: 'Newest First',
                    itemAdded: 'Item added to cart',
                    itemRemoved: 'Item removed from cart',
                    cartUpdated: 'Cart updated'
                },
                si: {
                    home: 'මුල් පිටුව',
                    shop: 'සාප්පුව',
                    cart: 'කරත්තය',
                    about: 'අපි ගැන',
                    contact: 'සම්බන්ධ වන්න',
                    admin: 'පරිපාලක',
                    categories: 'වර්ග',
                    newArrivals: 'අලුත් එකතු කිරීම්',
                    featuredProducts: 'විශේෂිත නිෂ්පාදන',
                    allProducts: 'සියලුම නිෂ්පාදන',
                    searchPlaceholder: 'නිෂ්පාදන සොයන්න...',
                    addToCart: 'කරත්තයට එකතු කරන්න',
                    viewDetails: 'විස්තර බලන්න',
                    quantity: 'ප්‍රමාණය',
                    subtotal: 'උප එකතුව',
                    deliveryCharge: 'බෙදාහැරීම් ගාස්තුව',
                    total: 'මුළු එකතුව',
                    checkout: 'WhatsApp හරහා ඇණවුම් කරන්න',
                    emptyCart: 'ඔබේ කරත්තය හිස්ය',
                    continueShopping: 'සාප්පු සවාරිය දිගටම කරගෙන යන්න',
                    phone: 'දුරකථන අංකය',
                    district: 'දිස්ත්‍රික්කය',
                    city: 'නගරය (විකල්ප)',
                    placeOrder: 'ඇණවුම තබන්න',
                    orderSummary: 'ඇණවුම් සාරාංශය',
                    paymentMethods: 'ගෙවීම් ක්‍රම',
                    bankTransfer: 'බැංකු මාරු',
                    kokoPay: 'Koko Pay',
                    cardPayment: 'කාඩ්පත් ගෙවීම',
                    selectDistrict: 'දිස්ත්‍රික්කය තෝරන්න',
                    selectCity: 'නගරය තෝරන්න',
                    required: 'අවශ්‍යයි',
                    optional: 'විකල්ප',
                    login: 'ඇතුල් වන්න',
                    logout: 'පිටවන්න',
                    email: 'විද්‍යුත් තැපෑල',
                    password: 'මුරපදය',
                    itemAdded: 'භාණ්ඩය කරත්තයට එකතු කරන ලදී',
                    itemRemoved: 'භාණ්ඩය කරත්තයෙන් ඉවත් කරන ලදී',
                    cartUpdated: 'කරත්තය යාවත්කාලීන කරන ලදී'
                },
                ta: {
                    home: 'முகப்பு',
                    shop: 'கடை',
                    cart: 'வண்டி',
                    about: 'எங்களை பற்றி',
                    contact: 'தொடர்பு',
                    admin: 'நிர்வாகி',
                    categories: 'வகைகள்',
                    newArrivals: 'புதிய வரவுகள்',
                    featuredProducts: 'சிறப்பு தயாரிப்புகள்',
                    allProducts: 'அனைத்து தயாரிப்புகள்',
                    searchPlaceholder: 'தயாரிப்புகளைத் தேடுங்கள்...',
                    addToCart: 'வண்டியில் சேர்',
                    viewDetails: 'விவரங்களைக் காண்க',
                    quantity: 'அளவு',
                    subtotal: 'துணை மொத்தம்',
                    deliveryCharge: 'டெலிவரி கட்டணம்',
                    total: 'மொத்தம்',
                    checkout: 'WhatsApp மூலம் ஆர்டர்',
                    emptyCart: 'உங்கள் வண்டி காலியாக உள்ளது',
                    continueShopping: 'ஷாப்பிங் தொடரவும்',
                    phone: 'தொலைபேசி எண்',
                    district: 'மாவட்டம்',
                    city: 'நகரம் (விருப்பம்)',
                    placeOrder: 'ஆர்டர் செய்',
                    orderSummary: 'ஆர்டர் சுருக்கம்',
                    paymentMethods: 'கட்டண முறைகள்',
                    bankTransfer: 'வங்கி பரிமாற்றம்',
                    kokoPay: 'Koko Pay',
                    cardPayment: 'அட்டை கட்டணம்',
                    selectDistrict: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்',
                    selectCity: 'நகரத்தைத் தேர்ந்தெடுக்கவும்',
                    required: 'தேவை',
                    optional: 'விருப்பம்',
                    login: 'உள்நுழைய',
                    logout: 'வெளியேறு',
                    email: 'மின்னஞ்சல்',
                    password: 'கடவுச்சொல்',
                    itemAdded: 'பொருள் வண்டியில் சேர்க்கப்பட்டது',
                    itemRemoved: 'பொருள் வண்டியில் இருந்து அகற்றப்பட்டது',
                    cartUpdated: 'வண்டி புதுப்பிக்கப்பட்டது'
                }
            }
        };
    }
};

window.JSONBinService = JSONBinService;