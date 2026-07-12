import { createClient } from '@supabase/supabase-js';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_SOAP_NOTES, INITIAL_INVOICES, INITIAL_CONVERSATIONS } from '../data';

const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('drvetly_supabase_url') || '';
  const localKey = localStorage.getItem('drvetly_supabase_key') || '';
  return {
    url: envUrl || localUrl,
    key: envKey || localKey
  };
};

const config = getSupabaseConfig();
const supabaseUrl = config.url;
const supabaseAnonKey = config.key;

export const isSupabaseConfigured = 
  Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'YOUR_SUPABASE_URL' && 
    supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    !supabaseUrl.includes('fakqramigcggrpacopyz') &&
    supabaseAnonKey.length > 15 &&
    localStorage.getItem('drvetly_force_local') !== 'true'
  );

class MockQueryBuilder {
  private table: string;
  constructor(table: string) {
    this.table = table;
  }
  select(_query?: string) { return this; }
  eq(_col: string, _val: any) { return this; }
  gte(_col: string, _val: any) { return this; }
  lt(_col: string, _val: any) { return this; }
  order(_col: string, _opts?: any) { return this; }
  limit(_n: number) { return this; }
  ilike(_col: string, _val: any) { return this; }
  maybeSingle() {
    return Promise.resolve({ data: this.getMockSingle(), error: null });
  }
  single() {
    return Promise.resolve({ data: this.getMockSingle(), error: null });
  }
  then(resolve: any, reject?: any) {
    return Promise.resolve({ data: this.getMockList(), error: null }).then(resolve, reject);
  }
  insert(_payload: any) {
    return Promise.resolve({ data: { id: 'mock-id-' + Date.now() }, error: null });
  }
  update(_payload: any) {
    return Promise.resolve({ data: null, error: null });
  }
  upsert(_payload: any) {
    return Promise.resolve({ data: null, error: null });
  }
  delete() {
    return Promise.resolve({ data: null, error: null });
  }

  private getMockSingle() {
    if (this.table === 'clinics') {
      return { id: 'demo-clinic-id', name: 'HotiVet Animal Hospital', slug: 'hotivet', timezone: 'America/New_York' };
    }
    return null;
  }

  private getMockList() {
    if (this.table === 'clinics') {
      return [{ id: 'demo-clinic-id', name: 'HotiVet Animal Hospital', slug: 'hotivet', timezone: 'America/New_York' }];
    }
    if (this.table === 'users') {
      return [
        { id: 'vet-1', clinic_id: 'demo-clinic-id', first_name: 'Jamie', last_name: 'Morales', role: 'VET', active: true },
        { id: 'vet-2', clinic_id: 'demo-clinic-id', first_name: 'Alex', last_name: 'Whitfield', role: 'VET', active: true }
      ];
    }
    if (this.table === 'patients') {
      return [
        { id: 'p1', clinic_id: 'demo-clinic-id', name: 'Bella', species: 'Canine', breed: 'Golden Retriever', client: { first_name: 'Sarah', last_name: 'Connor', email: 'sarah@example.com', phone: '555-0192' } }
      ];
    }
    if (this.table === 'appointments') {
      return [
        {
          id: 'a1',
          clinic_id: 'demo-clinic-id',
          patient_id: 'p1',
          vet_id: 'vet-1',
          start_at: new Date(Date.now() + 3600000).toISOString(),
          end_at: new Date(Date.now() + 7200000).toISOString(),
          reason: 'Annual wellness exam',
          status: 'SCHEDULED',
          patient: { id: 'p1', name: 'Bella', species: 'Canine', breed: 'Golden Retriever', client: { first_name: 'Sarah', last_name: 'Connor' } },
          vet: { id: 'vet-1', first_name: 'Jamie', last_name: 'Morales' }
        }
      ];
    }
    if (this.table === 'booking_event_types') {
      return [
        {
          id: 'et1',
          clinic_id: 'demo-clinic-id',
          name: '30-Min Wellness Exam',
          slug: 'wellness-exam',
          description: 'Comprehensive physical examination and vaccination review.',
          duration_minutes: 30,
          buffer_before_minutes: 0,
          buffer_after_minutes: 10,
          min_notice_hours: 2,
          max_days_in_advance: 45,
          location_type: 'IN_PERSON',
          location_details: 'Exam Room 1',
          color: '#0057D9',
          is_active: true,
          position: 0,
          booking_questions: [
            { id: 'q1', event_type_id: 'et1', label: "Pet's name and species", type: 'TEXT', required: true, position: 0 }
          ]
        }
      ];
    }
    return [];
  }
}

let client: any = null;
try {
  if (isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error('Failed to init Supabase client:', e);
}

const mockChannel = {
  on: (_type: string, _filter: any, _callback: any) => mockChannel,
  subscribe: (_statusCb?: any) => mockChannel
};

const mockSupabase = {
  from: (table: string) => new MockQueryBuilder(table),
  channel: (_name: string) => mockChannel,
  removeChannel: (_ch: any) => {},
  auth: {
    signUp: async () => ({ data: { user: { id: 'mock-user' } }, error: null }),
    signInWithPassword: async () => ({ data: { user: { id: 'mock-user' } }, error: null }),
    signOut: async () => {}
  }
};

export const supabase = client ? new Proxy(client, {
  get(target, prop, receiver) {
    if (prop === 'channel') {
      return (name: string) => {
        try {
          if (target && typeof target.channel === 'function') {
            return target.channel(name);
          }
        } catch (e) {
          console.warn('Realtime channel fallback:', e);
        }
        return mockChannel;
      };
    }
    if (prop === 'removeChannel') {
      return (ch: any) => {
        try {
          if (target && typeof target.removeChannel === 'function') {
            return target.removeChannel(ch);
          }
        } catch (e) {
          // ignore
        }
      };
    }
    const val = Reflect.get(target, prop, receiver);
    if (typeof val === 'function') {
      return val.bind(target);
    }
    return val;
  }
}) : mockSupabase;

export function forceLocalMode(enabled: boolean) {
  if (enabled) {
    localStorage.setItem('drvetly_force_local', 'true');
  } else {
    localStorage.removeItem('drvetly_force_local');
  }
  window.location.reload();
}
