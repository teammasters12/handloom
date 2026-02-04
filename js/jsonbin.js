// js/jsonbin.js - FIXED VERSION

const JSONBinService = {
    binId: CONFIG.JSONBIN_BIN_ID,
    apiKey: CONFIG.JSONBIN_API_KEY,
    baseUrl: CONFIG.JSONBIN_BASE_URL,
    cachedContent: null,

    // Get all content
    async getContent() {
        try {
            const response = await fetch(`${this.baseUrl}/b/${this.binId}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Meta': 'false'
                }
            });
            
            if (!response.ok) {
                console.error('JSONBIN fetch failed:', response.status, response.statusText);
                throw new Error('Failed to fetch content');
            }
            
            const data = await response.json();
            this.cachedContent = data;
            return data;
        } catch (error) {
            console.error('JSONBin fetch error:', error);
            // Return cached or default content
            return this.cachedContent || this.getDefaultContent();
        }
    },

    // Update entire content
    async updateContent(content) {
        try {
            console.log('Updating JSONBIN content:', content);
            
            const response = await fetch(`${this.baseUrl}/b/${this.binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Versioning': 'false'
                },
                body: JSON.stringify(content)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('JSONBIN update failed:', response.status, errorText);
                throw new Error(`Failed to update content: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('JSONBIN update success:', data);
            this.cachedContent = content;
            return content;
        } catch (error) {
            console.error('JSONBin update error:', error);
            throw error;
        }
    },

    // Get specific section
    async getSection(section) {
        const content = await this.getContent();
        return content?.[section] || null;
    },

    // Update specific section - FIXED
    async updateSection(section, data) {
        try {
            // Get current content first
            const content = await this.getContent();
            
            // Update the section
            content[section] = data;
            
            // Save entire content
            return await this.updateContent(content);
        } catch (error) {
            console.error(`Error updating section ${section}:`, error);
            throw error;
        }
    },

    // Get banners
    async getBanners() {
        const content = await this.getContent();
        return content?.banners || [];
    },

    // Get promotions
    async getPromotions() {
        const content = await this.getContent();
        return content?.promotions || null;
    },

    // Get about content
    async getAboutContent() {
        const content = await this.getContent();
        return content?.about || null;
    },

    // Get contact details
    async getContactDetails() {
        const content = await this.getContent();
        return content?.contact || null;
    },

    // Get language strings
    async getLanguageStrings() {
        const content = await this.getContent();
        return content?.languages || {};
    },

    // Get new arrivals config
    async getNewArrivalsConfig() {
        const content = await this.getContent();
        return content?.newArrivals || { enabled: true, limit: 8 };
    },

    // Default content structure
    getDefaultContent() {
        return {
            banners: [],
            promotions: {
                active: false,
                text: { en: '', si: '', ta: '' }
            },
            about: {
                title: { en: 'About Us', si: '', ta: '' },
                content: { en: '', si: '', ta: '' },
                image: ''
            },
            contact: {
                phone: '',
                whatsapp: '',
                email: '',
                address: { en: '', si: '', ta: '' },
                socialMedia: { facebook: '', instagram: '', youtube: '' }
            },
            newArrivals: {
                enabled: true,
                limit: 8,
                title: { en: 'New Arrivals', si: 'අලුත් එකතු කිරීම්', ta: 'புதிய வரவுகள்' }
            },
            languages: {
                en: {},
                si: {},
                ta: {}
            }
        };
    }
};

window.JSONBinService = JSONBinService;
