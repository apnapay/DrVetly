import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  Award, 
  FileText, 
  Calendar,
  Lock,
  Stethoscope,
  Search,
  CheckCircle2,
  Clock,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useCurrentClinic } from '../lib/useCurrentClinic';
import { StaffMember } from '../types';

interface StaffViewProps {
  vetName: string;
  clinicName: string;
}

export default function StaffView({
  vetName,
  clinicName
}: StaffViewProps) {
  const clinic = useCurrentClinic();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+1 (555) ');
  const [role, setRole] = useState<StaffMember['role']>('Associate Veterinarian');
  const [status, setStatus] = useState<StaffMember['status']>('Active');

  const fetchStaff = useCallback(async () => {
    if (!supabase) {
      setStaffMembers([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('users').select('*');
      if (clinic.clinicId) {
        query = query.eq('clinic_id', clinic.clinicId);
      }
      const { data, error: err } = await query;

      if (err || !data || data.length === 0) {
        const { data: staffTableData } = await supabase.from('staff_members').select('*');
        if (staffTableData && staffTableData.length > 0) {
          const mapped = staffTableData.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            role: s.role,
            status: s.status,
            phone: s.phone,
            avatar: s.avatar,
            notesCount: s.notes_count || 0,
            appointmentsCount: s.appointments_count || 0,
            joinedDate: s.joined_date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));
          setStaffMembers(mapped);
        } else {
          setStaffMembers([]);
        }
      } else {
        const mapped = data.map((u: any) => {
          const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Staff Member';
          let displayRole: StaffMember['role'] = 'Associate Veterinarian';
          if (u.role === 'ADMIN') displayRole = 'Lead Veterinarian';
          else if (u.role === 'RECEPTIONIST') displayRole = 'Receptionist';
          else if (u.role === 'VET') displayRole = 'Associate Veterinarian';

          const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

          return {
            id: u.id,
            name: fullName,
            email: u.email || '',
            role: displayRole,
            status: u.active !== false ? 'Active' : 'Inactive',
            phone: u.phone || '+1 (555) 000-0000',
            avatar: u.avatar_url || initials || 'ST',
            notesCount: u.notes_count || 0,
            appointmentsCount: u.appointments_count || 0,
            joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
        });
        setStaffMembers(mapped);
      }
    } catch (e: any) {
      console.warn('Failed to fetch staff from Supabase:', e);
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  }, [clinic.clinicId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Realtime subscription on users and staff_members tables using supabase.channel('public:users')
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchStaff();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff_members' },
        () => {
          fetchStaff();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStaff]);

  const filteredStaff = staffMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPhone('+1 (555) ');
    setRole('Associate Veterinarian');
    setStatus('Active');
    setShowAddModal(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone);
    setRole(member.role);
    setStatus(member.status);
    setShowAddModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const dbRole = role === 'Lead Veterinarian' || role === 'Clinic Manager' ? 'ADMIN' : role === 'Receptionist' ? 'RECEPTIONIST' : 'VET';
    const isActive = status === 'Active';

    if (supabase) {
      try {
        if (editingStaff) {
          await supabase.from('users').update({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            role: dbRole,
            active: isActive
          }).eq('id', editingStaff.id);
        } else {
          await supabase.from('users').insert({
            clinic_id: clinic.clinicId || 'demo-clinic-id',
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            role: dbRole,
            active: isActive
          });
        }
      } catch (err) {
        console.error('Error saving staff to Supabase:', err);
      }
    }

    await fetchStaff();
    setShowAddModal(false);
  };

  const handleDeleteStaff = async (id: string) => {
    if (supabase) {
      try {
        await supabase.from('users').delete().eq('id', id);
        await supabase.from('staff_members').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting staff:', err);
      }
    }
    setStaffMembers(prev => prev.filter(s => s.id !== id));
  };

  const roleColors: Record<string, string> = {
    'Lead Veterinarian': 'bg-purple-50 text-purple-700 border-purple-200',
    'Associate Veterinarian': 'bg-blue-50 text-blue-700 border-blue-200',
    'Vet Technician': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Receptionist': 'bg-amber-50 text-amber-700 border-amber-200',
    'Clinic Manager': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0057D9] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#3c4372]">Loading staff directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 welcome-band fade-in">
        <div>
          <h2>Staff &amp; Role Management</h2>
          <p>Assign clinical roles, grant sub-doctor privileges, track appointment workloads, and monitor AI SOAP note approvals in real time.</p>
        </div>
      </div>

      {/* Workspace Wrapper with Background Blur & Locked Overlay */}
      <div className="relative rounded-[24px] overflow-hidden">
        
        {/* Blurred underlying workspace */}
        <div className="space-y-6 filter blur-md select-none pointer-events-none opacity-50">
          
          {/* Top Banner Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#dfe7f4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-50/80 to-transparent pointer-events-none"></div>
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0057D9] text-xs font-mono font-bold uppercase tracking-wider">
                <Shield size={13} /> {clinicName} Staff Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#04044A] tracking-tight">Staff &amp; Role Management</h1>
              <p className="text-sm text-[#3c4372] max-w-xl">
                Assign clinical roles, grant sub-doctor privileges, track appointment workloads, and monitor AI SOAP note approvals in real time.
              </p>
            </div>

            <button 
              className="btn btn-primary relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-md cursor-pointer"
            >
              <UserPlus size={18} />
              <span>Invite Staff Member</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0057D9] flex items-center justify-center font-bold">
                <Users size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#04044A]">4</div>
                <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">Total Active Staff</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Stethoscope size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#04044A]">2</div>
                <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">Veterinarians &amp; Sub-Docs</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Award size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#04044A]">336</div>
                <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">AI Notes Drafted</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Calendar size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-[#04044A]">588</div>
                <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">Appointments Managed</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#dfe7f4] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search staff by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dfe7f4] text-xs font-medium text-[#04044A] bg-slate-50 focus:outline-none"
              />
            </div>
          </div>

          {/* Staff Grid Sample */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-[#dfe7f4] p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#04044A] to-[#0057D9] text-white font-bold flex items-center justify-center text-lg">
                      JM
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#04044A]">Dr. Jamie Morales</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#3c4372] mt-0.5">
                        <Mail size={12} className="text-slate-400" /> jamie@riverbendvet.com
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0057D9]">
                    Lead Veterinarian
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Locked Feature Frosted Glass Overlay with Background Blur */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#04044A]/15 backdrop-blur-[8px] p-6 text-center">
          <div className="bg-white/95 border border-[#e3eaf6] p-8 sm:p-10 rounded-[32px] shadow-2xl max-w-[460px] w-full flex flex-col items-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#04044A] to-[#0057D9] flex items-center justify-center text-white shadow-xl shadow-[#04044A]/25">
              <Lock size={30} strokeWidth={2.2} />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider bg-[#eef3fb] text-[#04044A] font-extrabold px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#d6e3f8]">
                <Sparkles size={11} className="text-[#00A4FF]" /> Coming Soon
              </span>
              <h3 className="text-xl font-bold text-[#04044A] tracking-tight mt-2">Staff Management Locked</h3>
              <p className="text-xs text-[#5a6291] leading-relaxed max-w-[380px] mx-auto mt-1">
                Multi-doctor privilege delegation, audit trails, and automated shift rostering are currently locked and scheduled for an upcoming DrVetly release.
              </p>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={() => alert('Coming Soon: Staff & Role Management feature will be unlocked in the next update!')}
                className="btn btn-primary px-7 py-3.5 text-xs font-bold shadow-lg inline-flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Lock size={14} /> Coming soon &middot; Feature locked
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
