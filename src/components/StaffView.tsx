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
  Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useCurrentClinic } from '../lib/useCurrentClinic';
import { StaffMember } from '../types';

interface StaffViewProps {
  vetName: string;
  clinicName: string;
}

const INITIAL_FALLBACK_STAFF: StaffMember[] = [
  { id: '1', name: 'Dr. Jamie Morales', email: 'jamie@riverbendvet.com', role: 'Lead Veterinarian', status: 'Active', phone: '+1 (555) 234-5678', avatar: 'JM', notesCount: 42, appointmentsCount: 128, joinedDate: 'Jan 15, 2024' },
  { id: '2', name: 'Dr. Alex Morgan', email: 'alex@riverbendvet.com', role: 'Associate Veterinarian', status: 'Active', phone: '+1 (555) 345-6789', avatar: 'AM', notesCount: 28, appointmentsCount: 94, joinedDate: 'Mar 10, 2024' },
  { id: '3', name: 'Sarah Jenkins, RVT', email: 'sarah@riverbendvet.com', role: 'Vet Technician', status: 'Active', phone: '+1 (555) 456-7890', avatar: 'SJ', notesCount: 15, appointmentsCount: 156, joinedDate: 'Feb 01, 2024' },
  { id: '4', name: 'Michael Chang', email: 'michael@riverbendvet.com', role: 'Receptionist', status: 'Active', phone: '+1 (555) 567-8901', avatar: 'MC', notesCount: 0, appointmentsCount: 210, joinedDate: 'Apr 12, 2024' }
];

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
      setStaffMembers(INITIAL_FALLBACK_STAFF);
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
            joinedDate: s.joined_date || 'Jan 15, 2024'
          }));
          setStaffMembers(mapped);
        } else {
          setStaffMembers(INITIAL_FALLBACK_STAFF);
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
            notesCount: u.notes_count || Math.floor(Math.random() * 30),
            appointmentsCount: u.appointments_count || Math.floor(Math.random() * 100),
            joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 15, 2024'
          };
        });
        setStaffMembers(mapped);
      }
    } catch (e: any) {
      console.warn('Failed to fetch staff from Supabase, using fallback:', e);
      setStaffMembers(INITIAL_FALLBACK_STAFF);
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
    <div className="space-y-8 animate-in fade-in duration-300">
      
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
          onClick={handleOpenAdd}
          className="btn btn-primary relative z-10 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-md cursor-pointer hover:scale-[1.02] transition-transform"
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
            <div className="text-2xl font-bold font-mono text-[#04044A]">{staffMembers.length}</div>
            <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">Total Active Staff</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#04044A]">
              {staffMembers.filter(s => s.role.includes('Veterinarian')).length}
            </div>
            <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">Veterinarians &amp; Sub-Docs</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#04044A]">
              {staffMembers.reduce((acc, curr) => acc + curr.notesCount, 0)}
            </div>
            <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">AI Notes Drafted</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#dfe7f4] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#04044A]">
              {staffMembers.reduce((acc, curr) => acc + curr.appointmentsCount, 0)}
            </div>
            <div className="text-xs font-semibold text-[#3c4372] uppercase tracking-wider">Appointments Managed</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dfe7f4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dfe7f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['All', 'Lead Veterinarian', 'Associate Veterinarian', 'Vet Technician', 'Receptionist', 'Clinic Manager'].map((roleItem) => (
            <button
              key={roleItem}
              onClick={() => setRoleFilter(roleItem)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                roleFilter === roleItem 
                  ? 'bg-[#04044A] text-white shadow-xs' 
                  : 'bg-[#f6f9fd] text-[#3c4372] hover:bg-[#eef3fb]'
              }`}
            >
              {roleItem}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((member) => (
          <div key={member.id} className="bg-white rounded-3xl border border-[#dfe7f4] p-6 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#04044A] to-[#0057D9] text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#04044A]">{member.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#3c4372] mt-0.5">
                      <Mail size={12} className="text-slate-400" /> {member.email}
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleColors[member.role] || 'bg-slate-100 text-slate-700'}`}>
                  {member.role}
                </span>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3 py-3 border-y border-[#dfe7f4] text-xs">
                <div className="flex items-center gap-2 text-[#3c4372]">
                  <FileText size={15} className="text-[#0057D9]" />
                  <span><strong>{member.notesCount}</strong> SOAP Notes</span>
                </div>
                <div className="flex items-center gap-2 text-[#3c4372]">
                  <Calendar size={15} className="text-emerald-600" />
                  <span><strong>{member.appointmentsCount}</strong> Appts</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" /> {member.phone}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  member.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dfe7f4] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Joined {member.joinedDate}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenEdit(member)}
                  className="p-2 rounded-xl bg-[#f6f9fd] hover:bg-[#eef3fb] text-[#04044A] cursor-pointer transition-colors"
                  title="Edit staff role"
                >
                  <Edit size={15} />
                </button>
                <button 
                  onClick={() => handleDeleteStaff(member.id)}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer transition-colors"
                  title="Remove staff member"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-[#dfe7f4]">
            <Users size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="font-bold text-base text-[#04044A]">No staff members found</h3>
            <p className="text-xs text-[#3c4372] mt-1">Try adjusting your search criteria or invite a new team member.</p>
          </div>
        )}
      </div>

      {/* Invite / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#04044A]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-[#dfe7f4] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0057D9] flex items-center justify-center font-bold">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#04044A]">
                    {editingStaff ? 'Edit Staff Member' : 'Invite Staff Member'}
                  </h2>
                  <p className="text-xs text-[#3c4372]">Configure permissions and clinical role.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Dr. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dfe7f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase mb-1">Email Address</label>
                <input 
                  type="email"
                  required
                  placeholder="alex.morgan@riverbendvet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dfe7f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase mb-1">Phone Number</label>
                <input 
                  type="text"
                  placeholder="+1 (555) 234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#dfe7f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase mb-1">Clinical Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dfe7f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9] bg-white"
                  >
                    <option value="Lead Veterinarian">Lead Veterinarian</option>
                    <option value="Associate Veterinarian">Associate Veterinarian</option>
                    <option value="Vet Technician">Vet Technician</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Clinic Manager">Clinic Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase mb-1">Account Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#dfe7f4] text-sm focus:outline-none focus:ring-2 focus:ring-[#0057D9]/20 focus:border-[#0057D9] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Invite">Pending Invite</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#dfe7f4]">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#dfe7f4] text-sm font-semibold text-[#3c4372] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {editingStaff ? 'Save Changes' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
