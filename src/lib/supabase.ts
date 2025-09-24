// Supabase client configuration
// This is a mock implementation - replace with actual Supabase setup

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Mock Supabase client
class MockSupabaseClient {
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
  }

  // Mock auth methods
  auth = {
    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      // Mock sign up
      console.log('Mock signUp:', credentials);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          }
        },
        error: null
      };
    },

    signInWithPassword: async (credentials: { email: string; password: string }) => {
      // Mock sign in
      console.log('Mock signInWithPassword:', credentials);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock different user roles based on email
      let role = 'user';
      if (credentials.email.includes('admin')) role = 'admin';
      if (credentials.email.includes('seller')) role = 'seller';
      
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            user_metadata: { role },
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          }
        },
        error: null
      };
    },

    signInWithOAuth: async (provider: { provider: string; options?: any }) => {
      console.log('Mock OAuth sign in:', provider);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        data: { url: 'mock-oauth-url' },
        error: null
      };
    },

    signOut: async () => {
      console.log('Mock signOut');
      return { error: null };
    },

    getSession: async () => {
      return {
        data: { session: null },
        error: null
      };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Mock auth state change listener
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  };

  // Mock database methods
  from = (table: string) => {
    return new MockSupabaseTable(table);
  };

  // Mock storage methods
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log('Mock storage upload:', { bucket, path, file });
        return {
          data: { path: `${bucket}/${path}` },
          error: null
        };
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.com/${path}` }
      })
    })
  };
}

class MockSupabaseTable {
  private table: string;
  private query: any = {};

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*') {
    this.query.select = columns;
    return this;
  }

  insert(data: any) {
    this.query.insert = data;
    return this;
  }

  update(data: any) {
    this.query.update = data;
    return this;
  }

  delete() {
    this.query.delete = true;
    return this;
  }

  eq(column: string, value: any) {
    this.query.eq = { column, value };
    return this;
  }

  neq(column: string, value: any) {
    this.query.neq = { column, value };
    return this;
  }

  gt(column: string, value: any) {
    this.query.gt = { column, value };
    return this;
  }

  lt(column: string, value: any) {
    this.query.lt = { column, value };
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.query.order = { column, ...options };
    return this;
  }

  limit(count: number) {
    this.query.limit = count;
    return this;
  }

  async then(resolve: (result: any) => void) {
    // Mock database operation
    await new Promise(r => setTimeout(r, 500));
    
    console.log(`Mock ${this.table} query:`, this.query);
    
    // Mock response based on table and query
    let mockData = [];
    let error = null;

    switch (this.table) {
      case 'stores':
        mockData = [
          {
            id: '1',
            name: '강남 휴대폰 매장',
            address: '서울시 강남구 역삼동 123-45',
            phone: '02-1234-5678',
            rating: 4.8,
            created_at: '2024-01-15T10:00:00Z'
          }
        ];
        break;
      case 'products':
        mockData = [
          {
            id: '1',
            store_id: '1',
            model: 'iPhone 15 Pro',
            price: 1200000,
            carrier: 'KT',
            storage: '256GB',
            created_at: '2024-01-15T10:00:00Z'
          }
        ];
        break;
      case 'reservations':
        mockData = [
          {
            id: '1',
            store_id: '1',
            user_id: 'user1',
            date: '2024-01-20',
            time: '14:30',
            status: 'pending',
            created_at: '2024-01-18T10:30:00Z'
          }
        ];
        break;
      default:
        mockData = [];
    }

    resolve({
      data: mockData,
      error: error,
      status: 200,
      statusText: 'OK'
    });
  }
}

// Mock Supabase instance
const mockSupabase = new MockSupabaseClient({
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key'
});

export { mockSupabase as supabase };

// Type definitions for Supabase tables
export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          description: string;
          address: string;
          phone: string;
          business_number: string;
          owner_id: string;
          status: 'active' | 'blocked' | 'pending';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stores']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['stores']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          model: string;
          carrier: string;
          storage: string;
          price: number;
          conditions: string[];
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      reservations: {
        Row: {
          id: string;
          store_id: string;
          user_id: string;
          customer_name: string;
          customer_phone: string;
          date: string;
          time: string;
          model: string;
          price: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reservations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          role: 'user' | 'seller' | 'admin';
          status: 'active' | 'blocked';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
  };
}