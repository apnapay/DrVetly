import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  Layers, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Coins, 
  X 
} from 'lucide-react';
import { Patient, Invoice } from '../types';

interface BillingViewProps {
  patients: Patient[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Omit<Invoice, 'id' | 'clientName'>) => void;
}

const INITIAL_MEDICAL_ITEMS = [
  { desc: 'Comprehensive Wellness Exam', price: 85.00 },
  { desc: 'Rabies Vaccination Booster', price: 35.00 },
  { desc: 'DHPP Canine Vaccine Booster', price: 42.00 },
  { desc: 'FVRCP Feline Vaccine Booster', price: 38.00 },
  { desc: 'Carprofen NSAID (75mg, 14 caps)', price: 54.00 },
  { desc: 'Dental Scale and Polish', price: 295.00 },
  { desc: 'Complete Blood Count (CBC) Panel', price: 110.00 }
];

export default function BillingView({
  patients,
  invoices,
  onAddInvoice
}: BillingViewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [medicalItems, setMedicalItems] = useState(INITIAL_MEDICAL_ITEMS);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Form states for custom invoice
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [invoiceItems, setInvoiceItems] = useState<string[]>([INITIAL_MEDICAL_ITEMS[0].desc]);
  const [customAmount, setCustomAmount] = useState<string>('85.00');
  const [invoiceStatus, setInvoiceStatus] = useState<'paid' | 'pending' | 'overdue'>('pending');

  // Calculate billing statistics
  const totalOutstanding = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueSum = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getPatientName = (id: string) => {
    return patients.find(p => p.id === id)?.name || 'Unknown';
  };

  const getPatientOwner = (id: string) => {
    return patients.find(p => p.id === id)?.ownerName || 'Unknown';
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(customAmount) || 85.00;
    
    onAddInvoice({
      patientId: selectedPatientId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: amountNum,
      status: invoiceStatus
    });

    // Reset states
    setInvoiceItems([medicalItems[0].desc]);
    setCustomAmount('85.00');
    setInvoiceStatus('pending');
    setShowAddModal(false);
  };

  const handleAddItemSelection = (desc: string, price: number) => {
    // Toggles item or calculates sum
    let newItems = [...invoiceItems];
    if (newItems.includes(desc)) {
      newItems = newItems.filter(i => i !== desc);
    } else {
      newItems.push(desc);
    }
    setInvoiceItems(newItems);

    // Recalculate amount
    const sum = newItems.reduce((acc, itemDesc) => {
      const match = medicalItems.find(m => m.desc === itemDesc);
      return acc + (match ? match.price : 0);
    }, 0);
    setCustomAmount(sum.toFixed(2));
  };

  const handleAddCustomCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemDesc.trim()) return;
    const priceNum = parseFloat(customItemPrice) || 0.00;

    const newItem = { desc: customItemDesc.trim(), price: priceNum };
    const updatedItems = [...medicalItems, newItem];
    setMedicalItems(updatedItems);

    // Also auto-select it in current invoice
    const newInvoiceItems = [...invoiceItems, newItem.desc];
    setInvoiceItems(newInvoiceItems);

    const sum = newInvoiceItems.reduce((acc, itemDesc) => {
      const match = updatedItems.find(m => m.desc === itemDesc);
      return acc + (match ? match.price : 0);
    }, 0);
    setCustomAmount(sum.toFixed(2));

    setCustomItemDesc('');
    setCustomItemPrice('');
  };

  // Filter invoice records
  const filteredInvoices = invoices.filter(inv => {
    const patientName = getPatientName(inv.patientId).toLowerCase();
    const ownerName = getPatientOwner(inv.patientId).toLowerCase();
    const matchesSearch = 
      patientName.includes(searchTerm.toLowerCase()) || 
      ownerName.includes(searchTerm.toLowerCase());

    const matchesStatus = activeFilter === 'all' || inv.status === activeFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 welcome-band fade-in">
        <div>
          <h2>Billing Ledger</h2>
          <p>Supervise invoice records, calculate tax summaries, and track transactions with clean billing ledgers.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="btn btn-primary self-start transition-all"
        >
          <Plus size={15} strokeWidth={2.4} /> Create invoice
        </button>
      </div>

      {/* KPI Stats Banners using our beautiful kpi-grid style */}
      <div className="kpi-grid fade-in d1">
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic red">
              <AlertCircle size={17} className="text-white" />
            </div>
            <span className="kpi-trend down">Deficit</span>
          </div>
          <div className="kpi-label">Overdue balance</div>
          <div className="kpi-value text-rose-600">${overdueSum.toLocaleString()}</div>
          <div className="kpi-sub">3 client accounts overdue</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic amber">
              <DollarSign size={17} className="text-white" />
            </div>
            <span className="kpi-trend up">Awaiting</span>
          </div>
          <div className="kpi-label">Outstanding total</div>
          <div className="kpi-value text-[#04044A]">${totalOutstanding.toLocaleString()}</div>
          <div className="kpi-sub">Awaiting checkouts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic green">
              <CheckCircle2 size={17} className="text-white" />
            </div>
            <span className="kpi-trend up">Collected</span>
          </div>
          <div className="kpi-label">Payments collected</div>
          <div className="kpi-value text-emerald-600">${totalCollected.toLocaleString()}</div>
          <div className="kpi-sub">This billing cycle</div>
        </div>
      </div>

      {/* Main ledger list table wrapped in .panel */}
      <div className="panel fade-in d2">
        <div className="p-5 border-b border-[#e3eaf6] flex items-center justify-between flex-wrap gap-4 bg-slate-50/20">
          <div className="search-box !w-full sm:!w-[280px]">
            <Search size={14} className="text-[#8a92b8]" />
            <input 
              type="text" 
              placeholder="Search invoice patient or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtering tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { key: 'all', label: 'All invoices' },
              { key: 'paid', label: 'Paid' },
              { key: 'pending', label: 'Pending' },
              { key: 'overdue', label: 'Overdue' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${activeFilter === tab.key ? 'bg-[#04044A] text-white border-[#04044A] shadow-xs' : 'bg-white text-[#5a6291] border-[#e3eaf6] hover:bg-slate-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Issued date</th>
                <th>Patient &amp; Owner</th>
                <th>Total cost</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f6f9fd]/50 transition-colors">
                    <td className="font-mono text-xs text-[#5a6291] font-bold">#INV-{inv.id}</td>
                    <td className="font-mono text-xs text-[#5a6291]">{inv.date}</td>
                    <td>
                      <div>
                        <div className="font-bold text-sm text-[#04044A]">{getPatientName(inv.patientId)}</div>
                        <div className="text-[11px] text-[#8a92b8] font-medium">Owner: {getPatientOwner(inv.patientId)}</div>
                      </div>
                    </td>
                    <td className="text-sm text-[#04044A] font-bold">${inv.amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-pill ${inv.status}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="text-xs font-bold text-[#00A4FF] hover:text-[#04044A] flex items-center justify-end gap-1.5 ml-auto cursor-pointer bg-transparent border-none">
                        <FileText size={13} /> View invoice
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-[#8a92b8] font-medium bg-white">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-lg font-bold">💵</span>
                      <p className="font-bold text-slate-700">No invoice records found</p>
                      <p className="text-slate-400">There are no invoices matched your select criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= NEW INVOICE MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#04044A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-[500px] shadow-lg overflow-hidden animate-fade-in border border-[#e3eaf6] transition-all">
            <div className="bg-[#04044A] p-6 text-white flex justify-between items-center border-b border-white/10">
              <div>
                <h3 className="font-bold text-lg tracking-tight">Generate Treatment Invoice</h3>
                <p className="text-[11px] text-white/70 mt-0.5">Aggregate patient treatments &amp; medical codes into ledger receipts</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Consulting Patient</label>
                <select 
                  className="w-full px-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 transition-all font-semibold cursor-pointer"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species} &middot; Owner: {p.ownerName})</option>
                  ))}
                </select>
              </div>

              {/* Treatments selection board */}
              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Treatments &amp; Consumables</label>
                <div className="border border-[#e3eaf6] rounded-2xl max-h-40 overflow-y-auto p-2 bg-slate-50/50 space-y-1 mb-3">
                  {medicalItems.map((item) => {
                    const isSelected = invoiceItems.includes(item.desc);
                    return (
                      <button
                        key={item.desc}
                        type="button"
                        onClick={() => handleAddItemSelection(item.desc, item.price)}
                        className={`w-full flex justify-between items-center px-4.5 py-2.5 rounded-xl text-left transition-all text-xs font-semibold cursor-pointer ${
                          isSelected 
                            ? 'bg-[#04044A] text-white shadow-xs scale-[0.99]' 
                            : 'hover:bg-slate-100 text-[#3c4372] bg-white border border-[#e3eaf6]/40'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00E1FF]' : 'bg-slate-300'}`}></span>
                          {item.desc}
                        </span>
                        <span className="font-mono text-xs">${item.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Add Custom Treatment / Consumable Form */}
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                  <span className="block text-[11px] font-bold text-[#04044A] uppercase tracking-wider font-mono">+ Add Custom Treatment / Consumable</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                      placeholder="Item name / drug / lab test"
                      value={customItemDesc}
                      onChange={(e) => setCustomItemDesc(e.target.value)}
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                      placeholder="Price ($)"
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCharge}
                      className="px-4 py-2 bg-[#0057D9] hover:bg-[#0048b3] text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Invoice Status</label>
                  <select 
                    className="w-full px-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 transition-all font-semibold cursor-pointer"
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as any)}
                  >
                    <option value="pending">Pending / Invoice Sent</option>
                    <option value="paid">Paid &middot; Clear checkout</option>
                    <option value="overdue">Mark Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Sum Total Cost</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#04044A] text-xs">$</span>
                    <input 
                      type="text" 
                      className="w-full pl-8 pr-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] font-bold bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 transition-all"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e3eaf6] flex gap-3 justify-end text-xs font-semibold">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline py-2.5 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary py-2.5 px-5 cursor-pointer"
                >
                  Post Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
