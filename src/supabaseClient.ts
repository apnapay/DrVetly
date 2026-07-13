import { createClient } from '@supabase/supabase-js';
import { Patient, Appointment, SOAPNote, Invoice, Conversation, Message, StaffMember } from './types';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_SOAP_NOTES, INITIAL_INVOICES, INITIAL_CONVERSATIONS } from './data';

export const INITIAL_STAFF_MEMBERS: StaffMember[] = [];

const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  return {
    url: envUrl,
    key: envKey
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
    supabaseAnonKey.length > 15
  );

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
  from: (_table: string) => ({
    select: () => ({ eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }), maybeSingle: () => Promise.resolve({ data: null, error: null }), single: () => Promise.resolve({ data: null, error: null }), then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve) }) }), maybeSingle: () => Promise.resolve({ data: null, error: null }), single: () => Promise.resolve({ data: null, error: null }), then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve) }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  }),
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

// ==========================================
// LOCAL STORAGE PERSISTENCE ENGINE (FALLBACK)
// ==========================================
const LOCAL_USERS_KEY = 'drvetly_local_users';
const ACTIVE_SESSION_KEY = 'drvetly_active_session';

interface LocalUser {
  id: string;
  email: string;
  password?: string;
  clinicName: string;
  vetName: string;
}

export interface SessionData {
  user: {
    id: string;
    email: string;
  };
  clinicName: string;
  vetName: string;
  subscriptionPlan?: 'solo' | 'hyper' | 'custom';
}

// Help create seed data for a new user if their local storage is clean
function getInitialSeedData<T>(key: string, initial: T[]): T[] {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return initial;
}

function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function filterRealPatients(list: Patient[]): Patient[] {
  const sampleNames = ['bella', 'harry', 'milo', 'rocky', 'luna', 'coco', 'max', 'duke', 'oreo', 'javed', 'naimutallah', 'hi'];
  return list.filter(p => p.id !== 'p1' && p.id !== 'p2' && !sampleNames.includes(p.name.toLowerCase()));
}

// Generate SQL schemas so the user can easily copy and execute them in Supabase
export const SUPABASE_SQL_SETUP = `-- Supabase Production-Grade SQL Setup Script for DrVetly
-- Run this in your Supabase SQL Editor to provision all tables, edge functions schemas, realtime, and storage buckets!

-- 1. Create Profiles table (linked to Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  clinic_name text not null,
  vet_name text not null,
  subscription_plan text default 'solo',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
drop policy if exists "Users can view and update their own profile" on public.profiles;
create policy "Users can view and update their own profile" 
  on public.profiles for all 
  using (auth.uid() = id or auth.uid() is null);

-- Create trigger function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, clinic_name, vet_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'clinic_name', 'Riverbend Animal Hospital'),
    coalesce(new.raw_user_meta_data->>'vet_name', 'Dr. Jamie Morales')
  )
  on conflict (id) do update
  set clinic_name = excluded.clinic_name,
      vet_name = excluded.vet_name,
      updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Staff Members table
create table if not exists public.staff_members (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  email text not null,
  role text not null,
  status text not null,
  phone text not null,
  avatar text not null,
  notes_count integer default 0,
  appointments_count integer default 0,
  joined_date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.staff_members enable row level security;
create policy "Users can manage their own clinic staff" 
  on public.staff_members for all 
  using (auth.uid() = user_id);

-- 3. Create Patients table
create table if not exists public.patients (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  species text not null,
  breed text not null,
  age text not null,
  owner_name text not null,
  avatar text not null,
  status text not null,
  last_visit text not null,
  weight text not null,
  temp text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.patients enable row level security;
create policy "Users can manage their own patients" 
  on public.patients for all 
  using (auth.uid() = user_id);

-- 4. Create Appointments table
create table if not exists public.appointments (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  time text not null,
  patient_id text not null,
  reason text not null,
  vet_name text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;
create policy "Users can manage their own appointments" 
  on public.appointments for all 
  using (auth.uid() = user_id);

-- 5. Create SOAP Notes table
create table if not exists public.soap_notes (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  patient_id text not null,
  time text not null,
  vet_name text not null,
  status text not null,
  subjective text not null,
  objective text not null,
  assessment text not null,
  plan text not null,
  raw_transcript text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.soap_notes enable row level security;
create policy "Users can manage their own SOAP notes" 
  on public.soap_notes for all 
  using (auth.uid() = user_id);

-- 6. Create Invoices table (Clinic billing to pet owners)
create table if not exists public.invoices (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  patient_id text not null,
  client_name text not null,
  date text not null,
  amount numeric not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.invoices enable row level security;
create policy "Users can manage their own invoices" 
  on public.invoices for all 
  using (auth.uid() = user_id);

-- 7. Create Creem.io Subscriptions & Billing Tracking table
create table if not exists public.creem_subscriptions (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  subscription_id text not null,
  plan_name text not null,
  status text not null,
  amount numeric not null,
  billing_interval text not null,
  current_period_end text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.creem_subscriptions enable row level security;
create policy "Users can manage their own creem subscriptions" 
  on public.creem_subscriptions for all 
  using (auth.uid() = user_id);

-- 8. Create Conversations & Messages table (Two-way SMS / Client Chat)
create table if not exists public.conversations (
  id text primary key,
  user_id uuid references auth.users on delete cascade,
  client_name text not null,
  client_initials text not null,
  patient_name text not null,
  last_message_text text not null,
  last_message_time text not null,
  is_unread boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;
create policy "Users can manage their own conversations" 
  on public.conversations for all 
  using (auth.uid() = user_id);

create table if not exists public.messages (
  id text primary key,
  conversation_id text references public.conversations on delete cascade,
  user_id uuid references auth.users on delete cascade,
  sender_name text not null,
  text text not null,
  time text not null,
  is_incoming boolean not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;
create policy "Users can manage their own messages" 
  on public.messages for all 
  using (auth.uid() = user_id);

-- 9. Storage Buckets Setup
insert into storage.buckets (id, name, public) 
values ('patient-records', 'patient-records', true)
on conflict (id) do nothing;

drop policy if exists "Public Access for Patient Records" on storage.objects;
create policy "Public Access for Patient Records" 
  on storage.objects for select 
  using (bucket_id = 'patient-records');

drop policy if exists "Authenticated Users Upload Patient Records" on storage.objects;
create policy "Authenticated Users Upload Patient Records" 
  on storage.objects for insert 
  with check (bucket_id = 'patient-records' and auth.role() = 'authenticated');

-- 10. Enable Supabase Realtime Publication for Live Sync
alter publication supabase_realtime add table public.patients;
alter publication supabase_realtime add table public.appointments;
alter publication supabase_realtime add table public.soap_notes;
alter publication supabase_realtime add table public.invoices;
alter publication supabase_realtime add table public.staff_members;
alter publication supabase_realtime add table public.creem_subscriptions;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
`;

// ==========================================
// UNIFIED AUTH SERVICE
// ==========================================
export const authService = {
  async signUp(email: string, password: string, clinicName: string, vetName: string): Promise<SessionData> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              clinic_name: clinicName,
              vet_name: vetName
            }
          }
        });
        
        if (error) {
          if (error.message && error.message.toLowerCase().includes('already registered')) {
            throw new Error('An account with this email is already registered. Please go to the Login page to access your clinic, or use a different email.');
          }
          throw error;
        }
        if (!data.user) throw new Error('Sign up succeeded but no user was returned.');

        // Create profile row as fallback/backup in case trigger hasn't been run yet in their DB
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              clinic_name: clinicName,
              vet_name: vetName
            });

          if (profileError) {
            console.warn('Profile creation returned warning, likely fine if trigger is enabled:', profileError.message);
          }
        } catch (err) {
          console.warn('Ignored profile upsert error, relying on database triggers:', err);
        }

        // Seed standard data for this new real user
        try {
          await seedNewUserSupabaseData(data.user.id, vetName, clinicName);
        } catch (seedErr) {
          console.warn('Failed to seed real tables; table schemas might not be ready yet. Fallback to offline runtime.');
        }

        const session: SessionData = {
          user: { id: data.user.id, email: data.user.email || email },
          clinicName,
          vetName
        };
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
        return session;
      } catch (err: any) {
        if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch') || err.message.includes('NetworkError'))) {
          throw new Error('FAILED_TO_FETCH: Failed to connect to your Supabase Project database. This indicates that your VITE_SUPABASE_URL config is unreachable, your Supabase project is paused, or there is a local CORS restriction.');
        }
        throw err;
      }
    } else {
      // Local fallback
      const localUsers: LocalUser[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      if (localUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists locally.');
      }

      const newId = Math.random().toString(36).substring(2, 11);
      const newUser: LocalUser = { id: newId, email, password, clinicName, vetName };
      localUsers.push(newUser);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));

      // Seed local storage with default clinical records for this specific user
      seedNewLocalUserData(newId);

      const session: SessionData = {
        user: { id: newId, email },
        clinicName,
        vetName
      };
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
      return session;
    }
  },

  async signIn(email: string, password: string): Promise<SessionData> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error(error.message || 'Invalid email or password, or user does not exist in Supabase backend.');
        }
        if (!data.user) {
          throw new Error('User not found in Supabase backend.');
        }

        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_name, vet_name, subscription_plan')
          .eq('id', data.user.id)
          .maybeSingle();

        const emailVal = data.user.email || email;
        const emailPrefix = emailVal.split('@')[0];
        const formattedName = emailPrefix.split(/[-_.]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        const defaultVetName = `Dr. ${formattedName}`;
        const defaultClinicName = `${formattedName} Veterinary Clinic`;

        const clinicName = profile?.clinic_name || data.user.user_metadata?.clinic_name || defaultClinicName;
        const vetName = profile?.vet_name || data.user.user_metadata?.vet_name || defaultVetName;
        const subscriptionPlan = profile?.subscription_plan || 'solo';

        const session: SessionData = {
          user: { id: data.user.id, email: data.user.email || email },
          clinicName,
          vetName,
          subscriptionPlan: subscriptionPlan as any
        };
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
        return session;
      } catch (err: any) {
        if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch') || err.message.includes('NetworkError'))) {
          throw new Error('FAILED_TO_FETCH: Failed to connect to your Supabase Project database. This indicates that your VITE_SUPABASE_URL config is unreachable, your Supabase project is paused, or there is a local CORS restriction.');
        }
        throw err;
      }
    } else {
      throw new Error('Supabase backend is not configured. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to log in with real Supabase users.');
    }
  },

  async signInLocalFallback(email: string, password: string): Promise<SessionData> {
      const localUsers: LocalUser[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      let user = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        const newId = Math.random().toString(36).substring(2, 11);
        const emailPrefix = email.split('@')[0] || 'vet';
        const formattedName = emailPrefix.split(/[-_.]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        const newUser: LocalUser = {
          id: newId,
          email,
          password: password || 'password',
          clinicName: `${formattedName} Veterinary Hospital`,
          vetName: `Dr. ${formattedName}`
        };
        localUsers.push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        seedNewLocalUserData(newId);
        user = newUser;
      }

      const session: SessionData = {
        user: { id: user.id, email: user.email },
        clinicName: user.clinicName,
        vetName: user.vetName
      };
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
      return session;
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  },

  getCurrentSession(): SessionData | null {
    const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  updateProfile(clinicName: string, vetName: string) {
    const session = this.getCurrentSession();
    if (session) {
      session.clinicName = clinicName;
      session.vetName = vetName;
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
      
      const localUsers: LocalUser[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
      const user = localUsers.find(u => u.id === session.user.id || u.email.toLowerCase() === session.user.email.toLowerCase());
      if (user) {
        user.clinicName = clinicName;
        user.vetName = vetName;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
      }
    }
  },

  async updateSubscriptionPlan(plan: 'solo' | 'hyper' | 'custom') {
    const session = this.getCurrentSession();
    if (session) {
      session.subscriptionPlan = plan;
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('profiles').update({ subscription_plan: plan }).eq('id', session.user.id);
        } catch (e) {
          console.error('Failed to update subscription in Supabase:', e);
        }
      }
    }
  }
};

// ==========================================
// SEED HELPERS FOR NEW USERS
// ==========================================
function seedNewLocalUserData(userId: string) {
  // Save scoped initial datasets under user_id prefixes so multiple users are isolated
  localStorage.setItem(`patients_${userId}`, JSON.stringify(INITIAL_PATIENTS));
  localStorage.setItem(`appointments_${userId}`, JSON.stringify(INITIAL_APPOINTMENTS));
  localStorage.setItem(`soap_notes_${userId}`, JSON.stringify(INITIAL_SOAP_NOTES));
  localStorage.setItem(`invoices_${userId}`, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(`conversations_${userId}`, JSON.stringify(INITIAL_CONVERSATIONS));
  localStorage.setItem(`staff_${userId}`, JSON.stringify(INITIAL_STAFF_MEMBERS));
}

async function seedNewUserSupabaseData(userId: string, vetName: string, clinicName: string) {
  if (!supabase) return;
  // Try to bulk insert default records in parallel. If any fails (RLS/schema missing), we logs gracefully
  const pData = INITIAL_PATIENTS.map(p => ({
    id: `${userId}_p_${p.id}`,
    user_id: userId,
    name: p.name,
    species: p.species,
    breed: p.breed,
    age: p.age,
    owner_name: p.ownerName,
    avatar: p.avatar,
    status: p.status,
    last_visit: p.lastVisit,
    weight: p.weight,
    temp: p.temp
  }));

  const apptData = INITIAL_APPOINTMENTS.map(a => ({
    id: `${userId}_a_${a.id}`,
    user_id: userId,
    time: a.time,
    patient_id: `${userId}_p_${a.patientId}`,
    reason: a.reason,
    vet_name: a.vetName === 'Dr. Morales' ? vetName : a.vetName,
    status: a.status
  }));

  const notesData = INITIAL_SOAP_NOTES.map(s => ({
    id: `${userId}_s_${s.id}`,
    user_id: userId,
    patient_id: `${userId}_p_${s.patientId}`,
    time: s.time,
    vet_name: s.vetName.includes('Morales') ? vetName : s.vetName,
    status: s.status,
    subjective: s.subjective,
    objective: s.objective,
    assessment: s.assessment,
    plan: s.plan,
    raw_transcript: s.rawTranscript
  }));

  const invData = INITIAL_INVOICES.map(inv => ({
    id: `${userId}_inv_${inv.id.replace('#', '')}`,
    user_id: userId,
    patient_id: `${userId}_p_${inv.patientId}`,
    client_name: inv.clientName,
    date: inv.date,
    amount: inv.amount,
    status: inv.status
  }));

  const convsData = INITIAL_CONVERSATIONS.map(c => ({
    id: `${userId}_c_${c.id}`,
    user_id: userId,
    client_name: c.clientName,
    client_initials: c.clientInitials,
    patient_name: c.patientName,
    last_message_text: c.lastMessageText,
    last_message_time: c.lastMessageTime,
    is_unread: c.isUnread
  }));

  // Perform fire-and-forget seeding so startup does not block
  Promise.all([
    supabase.from('patients').upsert(pData).then(r => console.log('Seeded patients:', r.status)),
    supabase.from('appointments').upsert(apptData).then(r => console.log('Seeded appointments:', r.status)),
    supabase.from('soap_notes').upsert(notesData).then(r => console.log('Seeded SOAP notes:', r.status)),
    supabase.from('invoices').upsert(invData).then(r => console.log('Seeded invoices:', r.status)),
    supabase.from('conversations').upsert(convsData).then(r => console.log('Seeded conversations:', r.status))
  ]).catch(err => {
    console.warn('Direct Supabase seeding failed. Make sure you run the setup SQL inside your Supabase console.', err);
  });
}

// ==========================================
// UNIFIED CLINICAL DATA SERVICE
// ==========================================
export const dbService = {
  // ----------------------------------------
  // PATIENTS CRUD
  // ----------------------------------------
  async getPatients(userId: string): Promise<Patient[]> {
    let raw: Patient[] = [];
    if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
          raw = data.map(p => ({
            id: p.id,
            name: p.name,
            species: p.species,
            breed: p.breed,
            age: p.age,
            ownerName: p.owner_name,
            avatar: p.avatar,
            status: p.status,
            lastVisit: p.last_visit,
            weight: p.weight,
            temp: p.temp
          }));
        }
      } catch {
        // ignore
      }
    }
    if (raw.length === 0) {
      raw = getInitialSeedData(`patients_${userId}`, INITIAL_PATIENTS);
    }
    return filterRealPatients(raw);
  },

  async savePatients(userId: string, list: Patient[]): Promise<void> {
    const cleanList = filterRealPatients(list);
    localStorage.setItem(`patients_${userId}`, JSON.stringify(cleanList));
    
    if (isSupabaseConfigured && supabase) {
      try {
        const validUserId = isValidUuid(userId) ? userId : undefined;
        const payload = cleanList.map(p => ({
          id: p.id,
          ...(validUserId ? { user_id: validUserId } : {}),
          name: p.name,
          species: p.species,
          breed: p.breed,
          age: p.age,
          owner_name: p.ownerName,
          avatar: p.avatar,
          status: p.status,
          last_visit: p.lastVisit,
          weight: p.weight,
          temp: p.temp
        }));
        const { error } = await supabase.from('patients').upsert(payload);
        if (error) {
          console.debug('Supabase patients upsert info:', error.message);
        }
      } catch (err) {
        // ignore network error
      }
    }
  },

  // ----------------------------------------
  // APPOINTMENTS CRUD
  // ----------------------------------------
  async getAppointments(userId: string): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase appointments fetch failed, using local storage fallback:', error.message);
          return getInitialSeedData(`appointments_${userId}`, INITIAL_APPOINTMENTS);
        }

        if (data && data.length > 0) {
          return data.map(a => ({
            id: a.id,
            time: a.time,
            patientId: a.patient_id,
            reason: a.reason,
            vetName: a.vet_name,
            status: a.status as any
          }));
        }
      } catch (err: any) {
        console.warn('Supabase network error in getAppointments, using local fallback:', err.message);
        return getInitialSeedData(`appointments_${userId}`, INITIAL_APPOINTMENTS);
      }
    }
    return getInitialSeedData(`appointments_${userId}`, INITIAL_APPOINTMENTS);
  },

  async saveAppointments(userId: string, list: Appointment[]): Promise<void> {
    localStorage.setItem(`appointments_${userId}`, JSON.stringify(list));
    
    if (isSupabaseConfigured && supabase) {
      try {
        const validUserId = isValidUuid(userId) ? userId : undefined;
        const payload = list.map(a => ({
          id: a.id,
          ...(validUserId ? { user_id: validUserId } : {}),
          time: a.time,
          patient_id: a.patientId,
          reason: a.reason,
          vet_name: a.vetName,
          status: a.status
        }));
        const { error } = await supabase.from('appointments').upsert(payload);
        if (error) console.debug('Supabase appointments upsert info:', error.message);
      } catch (err) {
        // ignore
      }
    }
  },

  // ----------------------------------------
  // SOAP NOTES CRUD
  // ----------------------------------------
  async getSoapNotes(userId: string): Promise<SOAPNote[]> {
    if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('soap_notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(s => ({
            id: s.id,
            patientId: s.patient_id,
            time: s.time,
            vetName: s.vet_name,
            status: s.status as any,
            subjective: s.subjective,
            objective: s.objective,
            assessment: s.assessment,
            plan: s.plan,
            rawTranscript: s.raw_transcript
          }));
        }
      } catch {
        // ignore
      }
    }
    return getInitialSeedData(`soap_notes_${userId}`, INITIAL_SOAP_NOTES);
  },

  async saveSoapNotes(userId: string, list: SOAPNote[]): Promise<void> {
    localStorage.setItem(`soap_notes_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        const validUserId = isValidUuid(userId) ? userId : undefined;
        const payload = list.map(s => ({
          id: s.id,
          ...(validUserId ? { user_id: validUserId } : {}),
          patient_id: s.patientId,
          time: s.time,
          vet_name: s.vetName,
          status: s.status,
          subjective: s.subjective,
          objective: s.objective,
          assessment: s.assessment,
          plan: s.plan,
          raw_transcript: s.rawTranscript
        }));
        const { error } = await supabase.from('soap_notes').upsert(payload);
        if (error) console.debug('Supabase soap_notes upsert info:', error.message);
      } catch (err) {
        // ignore
      }
    }
  },

  // ----------------------------------------
  // INVOICES CRUD
  // ----------------------------------------
  async getInvoices(userId: string): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map(i => ({
            id: i.id,
            patientId: i.patient_id,
            clientName: i.client_name,
            date: i.date,
            amount: Number(i.amount),
            status: i.status as any
          }));
        }
      } catch {
        // ignore
      }
    }
    return getInitialSeedData(`invoices_${userId}`, INITIAL_INVOICES);
  },

  async saveInvoices(userId: string, list: Invoice[]): Promise<void> {
    localStorage.setItem(`invoices_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        const validUserId = isValidUuid(userId) ? userId : undefined;
        const payload = list.map(i => ({
          id: i.id,
          ...(validUserId ? { user_id: validUserId } : {}),
          patient_id: i.patientId,
          client_name: i.clientName,
          date: i.date,
          amount: i.amount,
          status: i.status
        }));
        const { error } = await supabase.from('invoices').upsert(payload);
        if (error) console.debug('Supabase invoices upsert info:', error.message);
      } catch (err) {
        // ignore
      }
    }
  },

  // ----------------------------------------
  // CONVERSATIONS & MESSAGES CRUD
  // ----------------------------------------
  async getConversations(userId: string): Promise<Conversation[]> {
    if (isSupabaseConfigured && supabase && isValidUuid(userId)) {
      try {
        const { data: convs, error: convsErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!convsErr && convs && convs.length > 0) {
          const { data: msgs } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

          const messagesList = msgs || [];

          return convs.map(c => {
            const matchedMessages = messagesList
              .filter(m => m.conversation_id === c.id)
              .map(m => ({
                id: m.id,
                senderName: m.sender_name,
                text: m.text,
                time: m.time,
                isIncoming: m.is_incoming
              }));

            return {
              id: c.id,
              clientName: c.client_name,
              clientInitials: c.client_initials,
              patientName: c.patient_name,
              lastMessageText: c.last_message_text,
              lastMessageTime: c.last_message_time,
              isUnread: c.is_unread,
              messages: matchedMessages
            };
          });
        }
      } catch {
        // ignore
      }
    }
    return getInitialSeedData(`conversations_${userId}`, INITIAL_CONVERSATIONS);
  },

  async saveConversations(userId: string, list: Conversation[]): Promise<void> {
    localStorage.setItem(`conversations_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        const validUserId = isValidUuid(userId) ? userId : undefined;
        const payloadConvs = list.map(c => ({
          id: c.id,
          ...(validUserId ? { user_id: validUserId } : {}),
          client_name: c.clientName,
          client_initials: c.clientInitials,
          patient_name: c.patientName,
          last_message_text: c.lastMessageText,
          last_message_time: c.lastMessageTime,
          is_unread: c.isUnread
        }));

        const { error: convsErr } = await supabase.from('conversations').upsert(payloadConvs);
        if (convsErr) console.debug('Supabase conversations upsert info:', convsErr.message);

        const flatMsgs: any[] = [];
        list.forEach(c => {
          c.messages.forEach(m => {
            flatMsgs.push({
              id: m.id,
              conversation_id: c.id,
              ...(validUserId ? { user_id: validUserId } : {}),
              sender_name: m.senderName,
              text: m.text,
              time: m.time,
              is_incoming: m.isIncoming
            });
          });
        });

        if (flatMsgs.length > 0) {
          const { error: msgsErr } = await supabase.from('messages').upsert(flatMsgs);
          if (msgsErr) console.debug('Supabase messages upsert info:', msgsErr.message);
        }
      } catch {
        // ignore
      }
    }
  },

  // ----------------------------------------
  // STAFF CRUD
  // ----------------------------------------
  async getStaff(userId: string): Promise<StaffMember[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('staff_members')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase staff fetch failed, using local storage fallback:', error.message);
          return getInitialSeedData(`staff_${userId}`, INITIAL_STAFF_MEMBERS);
        }

        if (data && data.length > 0) {
          return data.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            role: s.role,
            status: s.status,
            phone: s.phone,
            avatar: s.avatar,
            notesCount: s.notes_count || 0,
            appointmentsCount: s.appointments_count || 0,
            joinedDate: s.joined_date || 'Jan 15, 2024'
          }));
        }
      } catch (err: any) {
        console.warn('Supabase network error in getStaff, using local fallback:', err.message);
        return getInitialSeedData(`staff_${userId}`, INITIAL_STAFF_MEMBERS);
      }
    }
    return getInitialSeedData(`staff_${userId}`, INITIAL_STAFF_MEMBERS);
  },

  async saveStaff(userId: string, list: StaffMember[]): Promise<void> {
    localStorage.setItem(`staff_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = list.map(s => ({
          id: s.id,
          user_id: userId,
          name: s.name,
          email: s.email,
          role: s.role,
          status: s.status,
          phone: s.phone,
          avatar: s.avatar,
          notes_count: s.notesCount,
          appointments_count: s.appointmentsCount,
          joined_date: s.joinedDate
        }));
        const { error } = await supabase.from('staff_members').upsert(payload);
        if (error) console.error('Error saving staff to Supabase:', error);
      } catch (err) {
        // ignore
      }
    }
  }
};
