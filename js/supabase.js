// js/supabase.js

// Initialize Supabase Client
const supabaseClient = supabase.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
);

// ========== Products ==========
const ProductService = {
    // Get all products
    async getAll() {
        const { data, error } = await supabaseClient
            .from('products')
            .select(`
                *,
                categories (
                    id,
                    name,
                    name_si,
                    name_ta
                )
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // Get product by ID
    async getById(id) {
        const { data, error } = await supabaseClient
            .from('products')
            .select(`
                *,
                categories (
                    id,
                    name,
                    name_si,
                    name_ta
                )
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    // Get products by category
    async getByCategory(categoryId) {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('category_id', categoryId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    // Get featured products
    async getFeatured() {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_featured', true)
            .eq('is_active', true)
            .limit(8);
        
        if (error) throw error;
        return data;
    },

    // Get new arrivals
    async getNewArrivals(limit = 8) {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    },

    // Search products
    async search(query) {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('is_active', true)
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .order('name');
        
        if (error) throw error;
        return data;
    },

    // Admin: Create product
    async create(product) {
        const { data, error } = await supabaseClient
            .from('products')
            .insert([product])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Admin: Update product
    async update(id, updates) {
        const { data, error } = await supabaseClient
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Admin: Delete product
    async delete(id) {
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};

// ========== Categories ==========
const CategoryService = {
    async getAll() {
        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        
        if (error) throw error;
        return data;
    },

    async create(category) {
        const { data, error } = await supabaseClient
            .from('categories')
            .insert([category])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabaseClient
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabaseClient
            .from('categories')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};

// ========== Delivery Charges ==========
const DeliveryService = {
    async getAll() {
        const { data, error } = await supabaseClient
            .from('delivery_charges')
            .select('*')
            .order('district');
        
        if (error) throw error;
        return data;
    },

    async getByDistrict(district) {
        const { data, error } = await supabaseClient
            .from('delivery_charges')
            .select('*')
            .eq('district', district);
        
        if (error) throw error;
        return data;
    },

    async getCharge(district, city = null) {
        let query = supabaseClient
            .from('delivery_charges')
            .select('charge')
            .eq('district', district);
        
        if (city) {
            query = query.eq('city', city);
        } else {
            query = query.is('city', null);
        }
        
        const { data, error } = await query.single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        // If no specific city charge found, get district default
        if (!data && city) {
            const { data: defaultCharge, error: defaultError } = await supabaseClient
                .from('delivery_charges')
                .select('charge')
                .eq('district', district)
                .is('city', null)
                .single();
            
            if (defaultError) throw defaultError;
            return defaultCharge?.charge || 0;
        }
        
        return data?.charge || 0;
    },

    async create(deliveryCharge) {
        const { data, error } = await supabaseClient
            .from('delivery_charges')
            .insert([deliveryCharge])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabaseClient
            .from('delivery_charges')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabaseClient
            .from('delivery_charges')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};

// ========== Payment Methods ==========
const PaymentService = {
    async getAll() {
        const { data, error } = await supabaseClient
            .from('payment_methods')
            .select('*')
            .order('sort_order');
        
        if (error) throw error;
        return data;
    },

    async getActive() {
        const { data, error } = await supabaseClient
            .from('payment_methods')
            .select('*')
            .eq('is_active', true)
            .order('sort_order');
        
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabaseClient
            .from('payment_methods')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
};

// ========== Storage (Images) ==========
const StorageService = {
    async uploadProductImage(file, productId) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { data, error } = await supabaseClient.storage
            .from('product-images')
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(filePath);
        
        return publicUrl;
    },

    async deleteProductImage(imageUrl) {
        const path = imageUrl.split('/').slice(-2).join('/');
        
        const { error } = await supabaseClient.storage
            .from('product-images')
            .remove([path]);
        
        if (error) throw error;
    }
};

// ========== Authentication ==========
const AuthService = {
    async login(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },

    async getSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    },

    async onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange(callback);
    },

    async isAdmin() {
        const session = await this.getSession();
        return !!session;
    }
};

// Export all services
window.ProductService = ProductService;
window.CategoryService = CategoryService;
window.DeliveryService = DeliveryService;
window.PaymentService = PaymentService;
window.StorageService = StorageService;
window.AuthService = AuthService;