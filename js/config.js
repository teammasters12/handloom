// js/config.js
const CONFIG = {
    // Supabase Configuration
    SUPABASE_URL: 'https://bvdrosltxicojfaxguma.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZHJvc2x0eGljb2pmYXhndW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODY3MjMsImV4cCI6MjA4NTc2MjcyM30.Pcx7tegDZUMNDf6hp3Y4Zp7fkKHkxU679cBVhTIxxDo',
    
    // JSONBIN Configuration
    JSONBIN_BASE_URL: 'https://api.jsonbin.io/v3/b/6983199143b1c97be9645ff3',
    JSONBIN_BIN_ID: '6983199143b1c97be9645ff3',
    JSONBIN_API_KEY: '$2a$10$w/jE4KCGRXsMjzQnbUF3U.MxriBPMgIhkiItih1MUvPHE7b6WPin2',
    
    // WhatsApp Configuration
    WHATSAPP_NUMBER: '94XXXXXXXXX', // Sri Lanka format
    
    // Currency
    CURRENCY: 'LKR',
    CURRENCY_SYMBOL: 'Rs.',
    
    // Default Language
    DEFAULT_LANGUAGE: 'en'
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);