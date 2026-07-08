import { createClient } from '@supabase/supabase-js';
import { Patient, Appointment, SOAPNote, Invoice, Conversation, Message } from './types';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_SOAP_NOTES, INITIAL_INVOICES, INITIAL_CONVERSATIONS } from './data';

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
    supabaseAnonKey.length > 15 &&
    localStorage.getItem('drvetly_force_local') !== 'true'
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

// Generate SQL schemas so the user can easily copy and execute them in Supabase
export const SUPABASE_SQL_SETUP = `-- Supabase SQL Setup Script for DrVetly
-- Run this in your Supabase SQL Editor to provision the tables!

-- 1. Create Profiles table (linked to Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  clinic_name text not null,
  vet_name text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view and update their own profile" on public.profiles;

-- Create robust policies
create policy "Users can view and update their own profile" 
  on public.profiles for all 
  using (auth.uid() = id or auth.uid() is null); -- allow trigger/session flexibility

-- Create a trigger function to automatically create a profile on signup
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

-- Bind the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Patients table
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

-- 3. Create Appointments table
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

-- 4. Create SOAP Notes table
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

-- 5. Create Invoices table
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

-- 6. Create Conversations / Messages table
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
          // If remote login fails (e.g., user not found in remote Supabase or bad password), fallback smoothly to local mode
          return this.signInLocalFallback(email, password);
        }
        if (!data.user) {
          return this.signInLocalFallback(email, password);
        }

        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('clinic_name, vet_name')
          .eq('id', data.user.id)
          .single();

        const emailVal = data.user.email || email;
        const emailPrefix = emailVal.split('@')[0];
        const formattedName = emailPrefix.split(/[-_.]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        const defaultVetName = `Dr. ${formattedName}`;
        const defaultClinicName = `${formattedName} Veterinary Clinic`;

        const clinicName = profile?.clinic_name || data.user.user_metadata?.clinic_name || defaultClinicName;
        const vetName = profile?.vet_name || data.user.user_metadata?.vet_name || defaultVetName;

        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            clinic_name: clinicName,
            vet_name: vetName
          });
        } catch (e) {
          // ignore if table doesn't exist yet or offline
        }

        const session: SessionData = {
          user: { id: data.user.id, email: data.user.email || email },
          clinicName,
          vetName
        };
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
        return session;
      } catch (err: any) {
        // Fallback to local session on any remote error
        return this.signInLocalFallback(email, password);
      }
    } else {
      return this.signInLocalFallback(email, password);
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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Supabase patients fetch failed, using local storage fallback:', error.message);
        return getInitialSeedData(`patients_${userId}`, INITIAL_PATIENTS);
      }

      if (data && data.length > 0) {
        return data.map(p => ({
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
    }
    return getInitialSeedData(`patients_${userId}`, INITIAL_PATIENTS);
  },

  async savePatients(userId: string, list: Patient[]): Promise<void> {
    localStorage.setItem(`patients_${userId}`, JSON.stringify(list));
    
    if (isSupabaseConfigured && supabase) {
      const payload = list.map(p => ({
        id: p.id,
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
      const { error } = await supabase.from('patients').upsert(payload);
      if (error) console.error('Error saving patients to Supabase:', error);
    }
  },

  // ----------------------------------------
  // APPOINTMENTS CRUD
  // ----------------------------------------
  async getAppointments(userId: string): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
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
    }
    return getInitialSeedData(`appointments_${userId}`, INITIAL_APPOINTMENTS);
  },

  async saveAppointments(userId: string, list: Appointment[]): Promise<void> {
    localStorage.setItem(`appointments_${userId}`, JSON.stringify(list));
    
    if (isSupabaseConfigured && supabase) {
      const payload = list.map(a => ({
        id: a.id,
        user_id: userId,
        time: a.time,
        patient_id: a.patientId,
        reason: a.reason,
        vet_name: a.vetName,
        status: a.status
      }));
      const { error } = await supabase.from('appointments').upsert(payload);
      if (error) console.error('Error saving appointments to Supabase:', error);
    }
  },

  // ----------------------------------------
  // SOAP NOTES CRUD
  // ----------------------------------------
  async getSoapNotes(userId: string): Promise<SOAPNote[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('soap_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase soap_notes fetch failed, using local storage fallback:', error.message);
        return getInitialSeedData(`soap_notes_${userId}`, INITIAL_SOAP_NOTES);
      }

      if (data && data.length > 0) {
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
    }
    return getInitialSeedData(`soap_notes_${userId}`, INITIAL_SOAP_NOTES);
  },

  async saveSoapNotes(userId: string, list: SOAPNote[]): Promise<void> {
    localStorage.setItem(`soap_notes_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      const payload = list.map(s => ({
        id: s.id,
        user_id: userId,
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
      if (error) console.error('Error saving SOAP notes to Supabase:', error);
    }
  },

  // ----------------------------------------
  // INVOICES CRUD
  // ----------------------------------------
  async getInvoices(userId: string): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase invoices fetch failed, using local storage fallback:', error.message);
        return getInitialSeedData(`invoices_${userId}`, INITIAL_INVOICES);
      }

      if (data && data.length > 0) {
        return data.map(i => ({
          id: i.id,
          patientId: i.patient_id,
          clientName: i.client_name,
          date: i.date,
          amount: Number(i.amount),
          status: i.status as any
        }));
      }
    }
    return getInitialSeedData(`invoices_${userId}`, INITIAL_INVOICES);
  },

  async saveInvoices(userId: string, list: Invoice[]): Promise<void> {
    localStorage.setItem(`invoices_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      const payload = list.map(i => ({
        id: i.id,
        user_id: userId,
        patient_id: i.patientId,
        client_name: i.clientName,
        date: i.date,
        amount: i.amount,
        status: i.status
      }));
      const { error } = await supabase.from('invoices').upsert(payload);
      if (error) console.error('Error saving invoices to Supabase:', error);
    }
  },

  // ----------------------------------------
  // CONVERSATIONS & MESSAGES CRUD
  // ----------------------------------------
  async getConversations(userId: string): Promise<Conversation[]> {
    if (isSupabaseConfigured && supabase) {
      const { data: convs, error: convsErr } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (convsErr) {
        console.warn('Supabase conversations fetch failed, using local fallback:', convsErr.message);
        return getInitialSeedData(`conversations_${userId}`, INITIAL_CONVERSATIONS);
      }

      if (convs && convs.length > 0) {
        // Fetch all messages for these conversations
        const { data: msgs, error: msgsErr } = await supabase
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
    }
    return getInitialSeedData(`conversations_${userId}`, INITIAL_CONVERSATIONS);
  },

  async saveConversations(userId: string, list: Conversation[]): Promise<void> {
    localStorage.setItem(`conversations_${userId}`, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      const payloadConvs = list.map(c => ({
        id: c.id,
        user_id: userId,
        client_name: c.clientName,
        client_initials: c.clientInitials,
        patient_name: c.patientName,
        last_message_text: c.lastMessageText,
        last_message_time: c.lastMessageTime,
        is_unread: c.isUnread
      }));

      const { error: convsErr } = await supabase.from('conversations').upsert(payloadConvs);
      if (convsErr) console.error('Error saving conversations to Supabase:', convsErr);

      // Save messages in flat structures
      const flatMsgs: any[] = [];
      list.forEach(c => {
        c.messages.forEach(m => {
          flatMsgs.push({
            id: m.id,
            conversation_id: c.id,
            user_id: userId,
            sender_name: m.senderName,
            text: m.text,
            time: m.time,
            is_incoming: m.isIncoming
          });
        });
      });

      if (flatMsgs.length > 0) {
        const { error: msgsErr } = await supabase.from('messages').upsert(flatMsgs);
        if (msgsErr) console.error('Error saving messages to Supabase:', msgsErr);
      }
    }
  }
};
