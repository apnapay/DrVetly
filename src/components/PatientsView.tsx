import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  Heart, 
  Activity, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Scale, 
  Thermometer, 
  Folder, 
  PlusCircle, 
  Calendar, 
  Layers, 
  ShieldAlert, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  X,
  Upload,
  Camera
} from 'lucide-react';
import { Patient, SOAPNote } from '../types';
import { renderPatientAvatar, uploadToSupabaseStorage } from '../lib/supabaseStorage';

interface PatientsViewProps {
  patients: Patient[];
  onAddPatient: (patient: Omit<Patient, 'id'>) => void;
  selectedPatientId: string | null;
  onClearSelectedPatient: () => void;
  soapNotes?: SOAPNote[];
}

export default function PatientsView({
  patients,
  onAddPatient,
  selectedPatientId,
  onClearSelectedPatient,
  soapNotes = []
}: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Canine' | 'Feline' | 'Exotic'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeChartId, setActiveChartId] = useState<string | null>(null);

  // Form states for creating a new patient record
  const [newName, setNewName] = useState('');
  const [newSpecies, setNewSpecies] = useState<'Canine' | 'Feline' | 'Exotic'>('Canine');
  const [newBreed, setNewBreed] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newWeight, setNewWeight] = useState('15.0 kg');
  const [newTemp, setNewTemp] = useState('101.2 °F');
  const [newAvatar, setNewAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (selectedPatientId) {
      setActiveChartId(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadToSupabaseStorage(file, 'avatars');
      setNewAvatar(publicUrl);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setNewAvatar(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const speciesAvatars: Record<string, string> = {
      Canine: '🐶',
      Feline: '🐱',
      Exotic: '🐰'
    };

    onAddPatient({
      name: newName,
      species: newSpecies,
      breed: newBreed,
      age: newAge,
      ownerName: newOwner,
      avatar: newAvatar || speciesAvatars[newSpecies] || '🐶',
      status: 'New patient',
      lastVisit: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      weight: newWeight,
      temp: newTemp
    });

    // Reset form states
    setNewName('');
    setNewBreed('');
    setNewAge('');
    setNewOwner('');
    setNewWeight('15.0 kg');
    setNewTemp('101.2 °F');
    setNewAvatar('');
    setShowAddModal(false);
  };

  // Filters logic
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecies = speciesFilter === 'All' || patient.species === speciesFilter;

    return matchesSearch && matchesSpecies;
  });

  const activePatient = patients.find(p => p.id === activeChartId);

  const handleCloseChart = () => {
    setActiveChartId(null);
    onClearSelectedPatient();
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 welcome-band fade-in">
        <div>
          <h2>Patient Registry</h2>
          <p>Access active health folders, evaluate telemetry vitals, and review historical SOAP charts.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="btn btn-primary self-start transition-all"
        >
          <Plus size={15} strokeWidth={2.4} /> Register patient
        </button>
      </div>

      {/* Main Directory Table */}
      <div className="panel fade-in d1 flex flex-col justify-between">
        <div className="p-5 border-b border-[#e3eaf6] flex items-center justify-between flex-wrap gap-4 bg-slate-50/20">
          <div className="search-box !w-full sm:!w-[280px]">
            <Search size={14} className="text-[#8a92b8]" />
            <input 
              type="text" 
              placeholder="Search by patient or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Species filters */}
          <div className="flex gap-1.5 flex-wrap">
            {['All', 'Canine', 'Feline', 'Exotic'].map((spec) => (
              <button
                key={spec}
                onClick={() => setSpeciesFilter(spec as any)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${speciesFilter === spec ? 'bg-[#04044A] text-white border-[#04044A] shadow-xs' : 'bg-white text-[#5a6291] border-[#e3eaf6] hover:bg-slate-50'}`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient profile</th>
                <th>Household Owner</th>
                <th>Last physical</th>
                <th>Clinical Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id} 
                    className={`hover:bg-[#f6f9fd]/50 transition-colors cursor-pointer ${activeChartId === patient.id ? 'bg-[#eef3fb]/70' : ''}`}
                    onClick={() => setActiveChartId(patient.id)}
                  >
                    <td>
                      <div className="cell-patient">
                        {renderPatientAvatar(patient.avatar, 'w-10 h-10', 'text-xl')}
                        <div>
                          <div className="p-name">{patient.name}</div>
                          <div className="p-meta">{patient.breed} &bull; {patient.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-[#3c4372] font-semibold">{patient.ownerName}</td>
                    <td className="font-mono text-xs text-[#5a6291]">{patient.lastVisit}</td>
                    <td>
                      <span className="tag font-bold">
                        {patient.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button 
                        className="btn btn-soft btn-sm text-[#00A4FF] hover:text-[#04044A] transition-colors font-bold text-xs" 
                        onClick={(e) => { e.stopPropagation(); setActiveChartId(patient.id); }}
                      >
                        Chart file &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-xs text-[#8a92b8] font-medium bg-white">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-lg">📁</span>
                      <p className="font-bold text-slate-700">No pet folders matching filter</p>
                      <p className="text-slate-400">Try modifying your search or registry filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Side Drawer for Patient Medical History & SOAP Notes */}
      {activePatient && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[#04044A]/40 backdrop-blur-xs transition-opacity" onClick={handleCloseChart} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-[#e3eaf6]">
              {/* Drawer Header */}
              <div className="p-6 bg-[#04044A] text-white flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3.5">
                  {renderPatientAvatar(activePatient.avatar, 'w-12 h-12', 'text-2xl')}
                  <div>
                    <h3 className="font-bold text-lg tracking-tight">{activePatient.name}</h3>
                    <p className="text-xs text-white/70 font-medium">{activePatient.breed} &bull; {activePatient.age} &bull; Owner: {activePatient.ownerName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseChart} 
                  className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {/* Vitals Summary Card */}
                <div className="bg-white p-5 rounded-2xl border border-[#e3eaf6] shadow-xs space-y-4">
                  <h4 className="font-bold text-xs text-[#04044A] uppercase tracking-wider font-mono flex items-center gap-2">
                    <Activity size={14} className="text-[#00A4FF]" /> Clinical Vitals &amp; Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#f6f9fd] p-3.5 rounded-xl border border-[#e3eaf6]">
                      <div className="text-[10px] font-mono font-bold text-[#8a92b8] uppercase">Weight</div>
                      <div className="font-bold text-sm text-[#04044A] mt-0.5">{activePatient.weight}</div>
                    </div>
                    <div className="bg-[#f6f9fd] p-3.5 rounded-xl border border-[#e3eaf6]">
                      <div className="text-[10px] font-mono font-bold text-[#8a92b8] uppercase">Body Temperature</div>
                      <div className="font-bold text-sm text-[#04044A] mt-0.5">{activePatient.temp}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-[#e3eaf6]">
                    <span className="font-semibold text-slate-500">Vaccination Status:</span>
                    <span className="text-[#00875A] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00C875] animate-pulse"></span> Clinically Safe &amp; Active
                    </span>
                  </div>
                </div>

                {/* Full Medical History & Recent SOAP Notes */}
                <div className="bg-white p-5 rounded-2xl border border-[#e3eaf6] shadow-xs space-y-4">
                  <h4 className="font-bold text-xs text-[#04044A] uppercase tracking-wider font-mono flex items-center gap-2">
                    <Folder size={14} className="text-[#00C875]" /> Full Medical History &amp; SOAP Notes
                  </h4>

                  <div className="relative border-l-2 border-[#dfe7f4] ml-3 pl-5 space-y-6 pt-2">
                    {soapNotes && soapNotes.filter(n => n.patientId === activePatient.id).length > 0 ? (
                      soapNotes.filter(n => n.patientId === activePatient.id).map((note, idx) => (
                        <div key={note.id || idx} className="relative bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0] space-y-2">
                          <span className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-[#0057D9] border-2 border-white shadow-xs"></span>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xs text-[#04044A]">SOAP Clinical Note ({note.time})</span>
                            <span className="text-[10px] font-mono bg-[#E6F5FF] text-[#0057D9] px-2 py-0.5 rounded font-bold">{note.vetName}</span>
                          </div>
                          <div className="text-xs space-y-1.5 text-slate-700">
                            <div><strong>S:</strong> {note.subjective}</div>
                            <div><strong>O:</strong> {note.objective}</div>
                            <div><strong>A:</strong> {note.assessment}</div>
                            <div><strong>P:</strong> {note.plan}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="relative">
                          <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-[#00A4FF] to-[#00E1FF] border-2 border-white shadow-xs"></span>
                          <div className="font-bold text-[#04044A] text-xs">Initial Consultation &amp; Stifle Exam</div>
                          <div className="text-[10px] text-[#8a92b8] mt-0.5 font-mono">Jul 7, 2026 &bull; Dr. Jamie Morales</div>
                          <p className="text-xs text-[#5a6291] mt-1 leading-relaxed">Owner reports mild limping on left hind leg after jumping off back porch. Stifle slight swelling. Prescribed strict rest for 10 days and Carprofen 75mg daily.</p>
                        </div>
                        <div className="relative">
                          <span className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-slate-300 border-2 border-white shadow-xs"></span>
                          <div className="font-bold text-[#04044A] text-xs">Annual Preventive Wellness Check</div>
                          <div className="text-[10px] text-[#8a92b8] mt-0.5 font-mono">May 14, 2026 &bull; Dr. Alex Whitfield</div>
                          <p className="text-xs text-[#5a6291] mt-1 leading-relaxed">Administered core DHPP and Rabies booster shots. Physical exam normal, weight stable.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-white border-t border-[#e3eaf6] flex justify-end gap-3">
                <button onClick={handleCloseChart} className="btn btn-outline text-xs font-bold px-5 py-2.5 cursor-pointer">
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= REGISTER PATIENT MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#04044A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-2xl shadow-blue-950/10 overflow-hidden border border-slate-200/80 transition-all">
            <div className="bg-gradient-to-r from-[#04044A] to-[#0a0a6b] p-6 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg shadow-inner">
                  🐾
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight text-white">Register Household Patient</h3>
                  <p className="text-[11px] text-white/70 mt-0.5 font-mono">Initialize a clinical profile record folder</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition-all border-none cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="p-7 space-y-5 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Patient Name *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                    placeholder="e.g. Bella"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Species Type *</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold cursor-pointer"
                    value={newSpecies}
                    onChange={(e) => setNewSpecies(e.target.value as any)}
                    required
                  >
                    <option value="Canine">Canine (🐶)</option>
                    <option value="Feline">Feline (🐱)</option>
                    <option value="Exotic">Exotic (🐰)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Breed *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                    placeholder="e.g. Golden Retriever"
                    value={newBreed}
                    onChange={(e) => setNewBreed(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Age *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                    placeholder="e.g. 4y or 6m"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Household Owner Name *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                  placeholder="e.g. Sarah Ahmed"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Patient Profile Picture / Avatar</label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {renderPatientAvatar(newAvatar || (newSpecies === 'Canine' ? '🐶' : newSpecies === 'Feline' ? '🐱' : '🐰'), 'w-14 h-14', 'text-2xl')}
                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#04044A] hover:bg-slate-100 transition-all shadow-xs">
                      <Camera size={14} className="text-[#0057D9]" />
                      <span>{uploadingAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarFileChange} 
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">Upload custom photo or use default species emoji.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Initial Weight</label>
                  <div className="relative">
                    <Scale size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                      placeholder="e.g. 29.4 kg"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1.5">Body Temp</label>
                  <div className="relative">
                    <Thermometer size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#04044A] focus:bg-white focus:outline-none focus:border-[#0057D9] focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
                      placeholder="e.g. 101.4 °F"
                      value={newTemp}
                      onChange={(e) => setNewTemp(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end text-xs font-semibold">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-xl bg-[#0057D9] hover:bg-[#0048b3] text-white transition-all shadow-md shadow-blue-500/25 cursor-pointer font-bold"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
