import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Clock, 
  User, 
  Building, 
  Phone, 
  Calendar,
  Layers,
  Check,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Download,
  Printer,
  Camera,
  Eye,
  Table,
  LayoutGrid,
  Pencil,
  Trash2,
  X,
  PlusCircle,
  ShieldAlert,
  ListPlus
} from 'lucide-react';
import { api } from '../utils/api';
import { exportLoansCSV, exportInventoryCSV } from '../utils/exportUtils';

export default function EquipmentView({ onOpenIssueModal, refreshKey, initialSport }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSport ? 'inventory' : 'loans'); // 'loans' or 'inventory'
  const [equipmentList, setEquipmentList] = useState([]);
  const [loansList, setLoansList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSport || '');
  const [loanStatusFilter, setLoanStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' (default - as requested) or 'cards'

  useEffect(() => {
    if (initialSport) {
      setActiveSubTab('inventory');
      setSearchQuery(initialSport);
    }
  }, [initialSport]);

  
  // Return Modal State
  const [returnModalLoan, setReturnModalLoan] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');
  const [sendReturnWhatsApp, setSendReturnWhatsApp] = useState(true);
  const [returning, setReturning] = useState(false);

  // Photo viewer modal
  const [viewingPhotoLoan, setViewingPhotoLoan] = useState(null);

  // Add Equipment Modal State (Single Quick Item)
  const [showAddEqModal, setShowAddEqModal] = useState(false);
  const [newEqName, setNewEqName] = useState('');
  const [newEqSport, setNewEqSport] = useState('Cricket');
  const [newEqCategory, setNewEqCategory] = useState('Balls');
  const [newEqQty, setNewEqQty] = useState(5);
  const [newEqLocation, setNewEqLocation] = useState('Hostel Sports Store Bay');

  // Sport-First Multi-Item Stock Delivery Modal (Requested: "pehle puche kis game ka hai, aur pura list banaye")
  const [showBatchAddModal, setShowBatchAddModal] = useState(false);
  const [batchSport, setBatchSport] = useState('Cricket');
  const [batchDefaultLocation, setBatchDefaultLocation] = useState('Locker C-1');
  const [batchItems, setBatchItems] = useState([
    { name: 'Cricket Bat (SG Kashmir Willow)', quantity: 2, category: 'Bats/Racquets', condition: 'Good', location: 'Locker C-1' },
    { name: 'Wickets / Stumps (Set of 6 + Bails)', quantity: 4, category: 'Stumps/Posts', condition: 'Good', location: 'Locker C-1' },
    { name: 'Leather Balls (Pack of 6)', quantity: 6, category: 'Balls', condition: 'Good', location: 'Locker C-1' }
  ]);
  const [batchSaving, setBatchSaving] = useState(false);

  // Edit Equipment State
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSport, setEditSport] = useState('Cricket');
  const [editCategory, setEditCategory] = useState('Bats/Racquets');
  const [editQty, setEditQty] = useState(1);
  const [editCondition, setEditCondition] = useState('Good');
  const [editLocation, setEditLocation] = useState('');
  const [editingSaving, setEditingSaving] = useState(false);

  // Delete Equipment State
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Delete Loan State (User: "yaha bhi delete ka option do")
  const [deletingLoan, setDeletingLoan] = useState(null);
  const [isDeletingLoan, setIsDeletingLoan] = useState(false);

  // Clear Mock Data State
  const [showClearMockModal, setShowClearMockModal] = useState(false);
  const [isClearingMock, setIsClearingMock] = useState(false);

  const sportsList = [
    'Cricket', 'Gully Cricket', 'Football', 'Basketball', 'Volleyball',
    'Table Tennis', 'Badminton', 'Chess', 'Kabaddi', 'Kho-Kho', 'Tug of War', 'Athletics'
  ];

  const SPORT_ITEM_PRESETS = {
    'Cricket': [
      { name: 'Cricket Bat (Kashmir Willow)', category: 'Bats/Racquets', defaultQty: 2 },
      { name: 'Wickets / Stumps (Set of 6)', category: 'Stumps/Posts', defaultQty: 2 },
      { name: 'Leather Balls (Pack of 6)', category: 'Balls', defaultQty: 6 },
      { name: 'Tennis Balls for Cricket', category: 'Balls', defaultQty: 12 },
      { name: 'Batting Pads (Pair)', category: 'Protective', defaultQty: 2 },
      { name: 'Batting Gloves (Pair)', category: 'Protective', defaultQty: 2 },
      { name: 'Wicket Keeping Gloves', category: 'Protective', defaultQty: 1 },
      { name: 'Cricket Helmet', category: 'Protective', defaultQty: 2 }
    ],
    'Gully Cricket': [
      { name: 'Lightweight Wooden Bat', category: 'Bats/Racquets', defaultQty: 3 },
      { name: 'Tennis Balls (Pack of 6)', category: 'Balls', defaultQty: 6 },
      { name: 'Plastic Wickets Stand', category: 'Stumps/Posts', defaultQty: 2 }
    ],
    'Football': [
      { name: 'Football (Size 5)', category: 'Balls', defaultQty: 5 },
      { name: 'Goalkeeper Gloves (Pair)', category: 'Protective', defaultQty: 2 },
      { name: 'Shin Guards (Pair)', category: 'Protective', defaultQty: 6 },
      { name: 'Goal Post Net (Pair)', category: 'Nets', defaultQty: 1 },
      { name: 'Training Cones Set', category: 'Misc', defaultQty: 20 }
    ],
    'Basketball': [
      { name: 'Basketball (Size 7)', category: 'Balls', defaultQty: 4 },
      { name: 'Basketball Ring Net (Pair)', category: 'Nets', defaultQty: 2 },
      { name: 'Ball Air Pump with Needle', category: 'Misc', defaultQty: 1 }
    ],
    'Volleyball': [
      { name: 'Volleyball (Super Soft PU)', category: 'Balls', defaultQty: 6 },
      { name: 'Volleyball Court Net (10m)', category: 'Nets', defaultQty: 1 },
      { name: 'Knee Support Pads (Pair)', category: 'Protective', defaultQty: 4 }
    ],
    'Table Tennis': [
      { name: 'Table Tennis Paddles (Pair)', category: 'Bats/Racquets', defaultQty: 4 },
      { name: 'TT 3-Star Balls (Pack of 6)', category: 'Balls', defaultQty: 12 },
      { name: 'TT Clamp-on Net & Post Set', category: 'Nets', defaultQty: 2 }
    ],
    'Badminton': [
      { name: 'Badminton Racquets', category: 'Bats/Racquets', defaultQty: 6 },
      { name: 'Nylon Shuttlecocks (Tube of 6)', category: 'Balls', defaultQty: 6 },
      { name: 'Feather Shuttlecocks (Tube)', category: 'Balls', defaultQty: 4 },
      { name: 'Badminton Tournament Net', category: 'Nets', defaultQty: 1 }
    ],
    'Chess': [
      { name: 'Weighted Chess Pieces Set', category: 'Boards', defaultQty: 4 },
      { name: 'Vinyl Roll-up Chess Board', category: 'Boards', defaultQty: 4 },
      { name: 'Digital Chess Clock Timer', category: 'Misc', defaultQty: 2 }
    ],
    'Kabaddi': [
      { name: 'Kabaddi Knee & Ankle Sleeves (Pair)', category: 'Protective', defaultQty: 8 }
    ],
    'Kho-Kho': [
      { name: 'Kho-Kho Wooden Turn Posts (Pair)', category: 'Misc', defaultQty: 2 }
    ],
    'Tug of War': [
      { name: 'Heavy Manila Hemp Rope (35m)', category: 'Misc', defaultQty: 1 },
      { name: 'Tug of War Grip Gloves', category: 'Protective', defaultQty: 10 }
    ],
    'Athletics': [
      { name: 'Digital Stopwatches', category: 'Misc', defaultQty: 4 },
      { name: 'Relay Race Batons (Set of 4)', category: 'Misc', defaultQty: 2 }
    ]
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eq, loans] = await Promise.all([
        api.getEquipment(),
        api.getLoans('all')
      ]);
      setEquipmentList(eq);
      setLoansList(loans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [refreshKey]);

  // Dispatch WhatsApp Helper
  const sendWhatsAppReceipt = (phoneNum, messageText) => {
    const rawNumber = (phoneNum || '').replace(/\D/g, '');
    const fullNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const url = `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  // Generate Issue reminder message
  const handleSendReminder = (loan) => {
    const msg = 
`🏆 *MPGI SPORTS FEST 2026 - GEAR REMINDER*
━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${loan.studentName}
🏢 *Hostel / Room:* ${loan.hostelName} (Room ${loan.roomNumber})

📦 *CURRENTLY BORROWED GEAR:*
  • ${loan.equipmentName}

🕒 *Issued Date:* ${new Date(loan.issuedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
⏳ *Return Due:* ${loan.isFlexibleReturn || loan.expectedReturn === 'Open / Flexible' ? 'Open / Flexible (जब मन हो जब रिटर्न करे)' : new Date(loan.expectedReturn).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
━━━━━━━━━━━━━━━━━━━━━━━
Kindly return the sports items to the Sports Store Room once finished playing. Thank you!`;
    
    sendWhatsAppReceipt(loan.phone, msg);
  };

  // Handle return submission
  const handleConfirmReturn = async () => {
    if (!returnModalLoan) return;
    setReturning(true);
    try {
      await api.returnEquipment({
        loanId: returnModalLoan.id,
        condition: returnCondition,
        notes: returnNotes
      });

      // Send Return WhatsApp Receipt if enabled
      if (sendReturnWhatsApp && returnModalLoan.phone) {
        const returnMsg = 
`✅ *MPGI SPORTS FEST 2026 - GEAR RETURN CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${returnModalLoan.studentName}
🏢 *Hostel & Room:* ${returnModalLoan.hostelName} | Room ${returnModalLoan.roomNumber}

📦 *RETURNED ITEMS:*
  • ${returnModalLoan.equipmentName}

🟢 *Condition Verified:* ${returnCondition}
🕒 *Deposited At:* ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}, ${new Date().toLocaleTimeString('en-IN', { timeStyle: 'short' })}
━━━━━━━━━━━━━━━━━━━━━━━
Thank you! The hostel sports gear has been safely checked in and restored to inventory.
_MPGI Sports Desk_`;

        sendWhatsAppReceipt(returnModalLoan.phone, returnMsg);
      }

      setReturnModalLoan(null);
      setReturnNotes('');
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Error processing return');
    } finally {
      setReturning(false);
    }
  };

  // Handle add equipment
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!newEqName) return;
    try {
      await api.addEquipment({
        name: newEqName,
        sport: newEqSport,
        category: newEqCategory,
        totalQuantity: parseInt(newEqQty, 10),
        condition: 'Good',
        location: newEqLocation
      });
      setShowAddEqModal(false);
      setNewEqName('');
      await fetchAll();
    } catch (err) {
      alert('Failed to add equipment');
    }
  };

  // Quick Preset Click
  const handleAddPresetItem = (preset) => {
    setBatchItems(prev => [
      ...prev,
      {
        name: preset.name,
        quantity: preset.defaultQty || 2,
        category: preset.category || 'Misc',
        condition: 'Good',
        location: batchDefaultLocation || 'Hostel Sports Store Bay'
      }
    ]);
  };

  // Add blank item row in batch
  const handleAddBatchRow = () => {
    setBatchItems(prev => [
      ...prev,
      {
        name: '',
        quantity: 1,
        category: 'Misc',
        condition: 'Good',
        location: batchDefaultLocation || 'Hostel Sports Store Bay'
      }
    ]);
  };

  // Remove item row in batch
  const handleRemoveBatchRow = (index) => {
    if (batchItems.length <= 1) return;
    setBatchItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update item field in batch
  const handleUpdateBatchField = (index, field, value) => {
    setBatchItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Change batch sport and refresh preset suggestions
  const handleSelectBatchSport = (selectedSport) => {
    setBatchSport(selectedSport);
    const presets = SPORT_ITEM_PRESETS[selectedSport];
    if (presets && presets.length > 0) {
      setBatchItems(presets.slice(0, 3).map(p => ({
        name: p.name,
        quantity: p.defaultQty,
        category: p.category,
        condition: 'Good',
        location: batchDefaultLocation
      })));
    }
  };

  // Submit Batch Stock Arrival
  const handleSaveBatchEquipment = async (e) => {
    e.preventDefault();
    const valid = batchItems.filter(it => it.name && it.name.trim() !== '');
    if (valid.length === 0) {
      alert('Please enter at least one item name in the list');
      return;
    }
    setBatchSaving(true);
    try {
      await api.addEquipmentBatch({
        sport: batchSport,
        defaultLocation: batchDefaultLocation,
        items: valid
      });
      setShowBatchAddModal(false);
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to save equipment batch');
    } finally {
      setBatchSaving(false);
    }
  };

  // Start Edit Item
  const handleStartEdit = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditSport(item.sport);
    setEditCategory(item.category);
    setEditQty(item.totalQuantity);
    setEditCondition(item.condition || 'Good');
    setEditLocation(item.location || 'Hostel Sports Store Bay');
  };

  // Submit Edit Item
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditingSaving(true);
    try {
      await api.updateEquipment(editingItem.id, {
        name: editName,
        sport: editSport,
        category: editCategory,
        totalQuantity: parseInt(editQty, 10),
        condition: editCondition,
        location: editLocation
      });
      setEditingItem(null);
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to update equipment');
    } finally {
      setEditingSaving(false);
    }
  };

  // Confirm Delete Item
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await api.deleteEquipment(deletingItem.id);
      setDeletingItem(null);
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to delete equipment');
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm Clear Mock Catalog
  const handleConfirmClearMock = async () => {
    setIsClearingMock(true);
    try {
      await api.clearMockEquipment();
      setShowClearMockModal(false);
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to clear mock catalog');
    } finally {
      setIsClearingMock(false);
    }
  };

  // Confirm Delete Loan Record (User Voice Note: "yaha bhi delete ka option do")
  const handleConfirmDeleteLoan = async () => {
    if (!deletingLoan) return;
    setIsDeletingLoan(true);
    try {
      await api.deleteLoan(deletingLoan.id);
      setDeletingLoan(null);
      await fetchAll();
    } catch (err) {
      alert(err.message || 'Failed to delete loan record');
    } finally {
      setIsDeletingLoan(false);
    }
  };

  // Filter loans
  const filteredLoans = loansList.filter(l => {
    const matchesSearch = 
      l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.roomNumber && l.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.hostelName && l.hostelName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = loanStatusFilter === 'all' || l.status.toLowerCase() === loanStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Filter equipment
  const filteredEquipment = equipmentList.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header & Sub-tab Switcher (Mobile responsive) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white dark:bg-[#0c0e22] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-sm">
        
        {/* Sub-tabs segment control: full-width on mobile */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-1 bg-slate-100 dark:bg-[#070818] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('loans')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'loans'
                ? 'bg-[#7156a5] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeSubTab === 'loans' ? 'text-white' : 'text-[#7156a5] dark:text-[#b8a5e5]'}`} />
            <span className="sm:hidden">Loans ({loansList.filter(l => l.status === 'Active' || l.status === 'Overdue').length})</span>
            <span className="hidden sm:inline">Issued Loans & Returns ({loansList.filter(l => l.status === 'Active' || l.status === 'Overdue').length} Active)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-[#7156a5] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeSubTab === 'inventory' ? 'text-white' : 'text-[#7156a5] dark:text-[#b8a5e5]'}`} />
            <span className="sm:hidden">Stock ({equipmentList.length})</span>
            <span className="hidden sm:inline">Stock Inventory ({equipmentList.length} Items)</span>
          </button>
        </div>


        {/* Action Buttons: Unified Primary & Dark Outlines */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeSubTab === 'loans') {
                  exportLoansCSV(filteredLoans);
                } else {
                  exportInventoryCSV(filteredEquipment);
                }
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#12152e] dark:hover:bg-[#1a1e3d] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer active:scale-95"
              title="Download CSV Report"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7156a5] dark:text-[#b8a5e5]" />
              <span>{activeSubTab === 'loans' ? 'Export Loans (CSV)' : 'Export Stock (CSV)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#12152e] dark:hover:bg-[#1a1e3d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
              title="Print Ledger"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <span>Print</span>
            </button>

            {activeSubTab === 'inventory' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowBatchAddModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#7156a5] hover:bg-[#5e458e] text-white shadow-xs transition-all cursor-pointer active:scale-95"
                  title="Add delivery stock for a game"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>Receive Stock Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddEqModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#12152e] dark:hover:bg-[#1a1e3d] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                  title="Add single item"
                >
                  <Plus className="w-3.5 h-3.5 text-[#7156a5] dark:text-[#b8a5e5]" />
                  <span className="hidden sm:inline">Quick Item</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearMockModal(true)}
                  className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 transition-all cursor-pointer"
                  title="Clear all mock equipment data from database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Mock</span>
                </button>
              </>
            )}
          </div>

          <button
            onClick={onOpenIssueModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#7156a5] hover:bg-[#5e458e] shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Gear to Student</span>
          </button>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0c0e22] p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeSubTab === 'loans' ? "Search borrower, room no, hostel, or gear..." : "Search equipment by name or sport..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-[#070818] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-[#7156a5]"
          />
        </div>

        {activeSubTab === 'loans' && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
            {['all', 'Active', 'Overdue', 'Returned'].map(st => (
              <button
                key={st}
                onClick={() => setLoanStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  loanStatusFilter === st
                    ? 'bg-[#7156a5] text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#12152e] dark:hover:bg-[#1a1e3d] text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {st === 'all' ? 'All Loans' : st}
              </button>
            ))}
          </div>
        )}

        {/* View Mode Switcher: Table View (Default) vs Card View */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070818] p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-[#7156a5] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Table View (As Requested)"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-[#7156a5] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Numbers Strip matching mpgisports.in clean dark surface */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {activeSubTab === 'loans' ? (
          <>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Total Issued Loans</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{loansList.length}</span>
            </div>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Active Out On Loan</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{loansList.filter(l => l.status === 'Active').length}</span>
            </div>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Overdue Return</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{loansList.filter(l => l.status === 'Overdue').length}</span>
                {loansList.filter(l => l.status === 'Overdue').length > 0 && (
                  <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">Requires Attention</span>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Safely Returned</span>
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{loansList.filter(l => l.status === 'Returned').length}</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Available Stock (बचा हुआ सामान)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {equipmentList.reduce((acc, e) => acc + (e.availableQuantity || 0), 0)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">Units</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Currently Issued (इशू हुआ सामान)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {equipmentList.reduce((acc, e) => acc + (e.issuedQuantity || 0), 0)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">Units</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Total Stock Units</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {equipmentList.reduce((acc, e) => acc + (e.totalQuantity || 0), 0)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">Units</span>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d1025] border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl flex flex-col justify-between hover:border-[#7156a5]/30 transition-colors shadow-2xs">
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">Master Catalog Items</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{equipmentList.length}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">Items</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* SUB-TAB 1: LOANS & RETURNS LEDGER */}
      {activeSubTab === 'loans' && (
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="py-12 flex justify-center text-slate-400">Loading loans ledger...</div>
          ) : filteredLoans.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
              <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">No equipment loan records match your query</h3>
              <p className="text-xs text-slate-500 mt-1">Click "Issue Gear to Student" to issue equipment.</p>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW: ISSUED LOANS & RETURNS (Requested: 'Kaun sa saman issue hua hai, kisko issue hua hai, table ke form me dikhao') */
            <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3.5 px-3 text-center w-12">#</th>
                    <th className="py-3.5 px-3">Issued Gear & Qty</th>
                    <th className="py-3.5 px-3">Borrower Student</th>
                    <th className="py-3.5 px-3">Hostel & Room</th>
                    <th className="py-3.5 px-3">Contact & WhatsApp</th>
                    <th className="py-3.5 px-3">Issued Time</th>
                    <th className="py-3.5 px-3">Return Due</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 px-3 text-center">Photo</th>
                    <th className="py-3.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredLoans.map((loan, idx) => {
                    const isOverdue = loan.status === 'Overdue';
                    const isReturned = loan.status === 'Returned';
                    const isActive = loan.status === 'Active';
                    const isFlexible = loan.isFlexibleReturn || loan.expectedReturn === 'Open / Flexible';

                    return (
                      <tr 
                        key={loan.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                          isOverdue ? 'bg-rose-500/[0.04]' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Issued Gear & Quantity */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base flex-shrink-0">📦</span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                                {loan.equipmentName}
                              </div>
                              <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">
                                Qty: {loan.quantity} unit{loan.quantity > 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Borrower Student */}
                        <td className="py-3 px-3">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                              {loan.studentName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-slate-400">
                                {loan.studentRoll}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                loan.residency === 'Day Scholar'
                                  ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/25'
                                  : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25'
                              }`}>
                                {loan.residency || 'Hosteller'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Hostel & Room */}
                        <td className="py-3 px-3">
                          {loan.residency === 'Day Scholar' ? (
                            <span className="text-[11px] text-slate-500 italic">Day Scholar (Local)</span>
                          ) : (
                            <div className="text-xs">
                              <div className="text-slate-700 dark:text-slate-300 font-medium">
                                {loan.hostelName?.replace('Maharana Pratap ', 'MP ') || 'Hostel'}
                              </div>
                              <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                                Room {loan.roomNumber || 'N/A'}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Contact & WhatsApp */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {loan.phone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                {loan.phone}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSendReminder(loan)}
                                className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 hover:text-emerald-700 border border-emerald-300/60 dark:border-emerald-800 transition-colors cursor-pointer"
                                title="Send WhatsApp Gear Reminder"
                              >
                                <MessageSquare className="w-3 h-3 text-emerald-600" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>

                        {/* Issued Time */}
                        <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
                          <div>{new Date(loan.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                          <div className="text-[10px] text-slate-400">{new Date(loan.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>

                        {/* Return Due */}
                        <td className="py-3 px-3 whitespace-nowrap text-xs">
                          {isFlexible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Flexible
                            </span>
                          ) : (
                            <div className={isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                              <div>{new Date(loan.expectedReturn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                              <div className="text-[10px]">{new Date(loan.expectedReturn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              OVERDUE
                            </span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Clock className="w-2.5 h-2.5" />
                              ISSUED
                            </span>
                          )}
                          {isReturned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <Check className="w-2.5 h-2.5" />
                              RETURNED
                            </span>
                          )}
                        </td>

                        {/* Photo */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {loan.handoverPhoto ? (
                            <button
                              type="button"
                              onClick={() => setViewingPhotoLoan(loan)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-blue-700 dark:text-cyan-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                              title="Inspect Handover Verification Photo"
                            >
                              <Camera className="w-3 h-3 text-blue-500" />
                              <span>View</span>
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                          )}
                        </td>

                        {/* Return & Delete Action (Requested by User) */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {!isReturned ? (
                              <button
                                onClick={() => {
                                  setReturnModalLoan(loan);
                                  setReturnCondition('Good');
                                  setReturnNotes('');
                                  setSendReturnWhatsApp(Boolean(loan.phone));
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Deposit</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Deposited
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeletingLoan(loan)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer"
                              title="Delete Loan Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLoans.map(loan => {
                const isOverdue = loan.status === 'Overdue';
                const isReturned = loan.status === 'Returned';
                const isActive = loan.status === 'Active';
                const isFlexible = loan.isFlexibleReturn || loan.expectedReturn === 'Open / Flexible';

                return (
                  <div
                    key={loan.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between gap-3.5 shadow-sm transition-all duration-200 ${
                      isOverdue 
                        ? 'border-rose-400 dark:border-rose-500/50 bg-rose-500/5' 
                        : isActive 
                        ? 'border-amber-400/60 dark:border-amber-500/30' 
                        : 'border-slate-200 dark:border-slate-800 opacity-90'
                    }`}
                  >
                    
                    {/* Card Header: Equipment & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center font-bold text-lg border border-blue-500/20 flex-shrink-0">
                          📦
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                            {loan.equipmentName}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Total Units: <strong className="text-blue-600 dark:text-cyan-400">{loan.quantity}</strong> item(s)
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          OVERDUE
                        </span>
                      )}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          ISSUED
                        </span>
                      )}
                      {isReturned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          RETURNED
                        </span>
                      )}
                    </div>

                    {/* Borrower Details (Name, Room, Hostel, Phone) */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          {loan.studentName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {loan.studentId}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs">
                        <Building className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                        <span>{loan.hostelName} • <strong>Room {loan.roomNumber}</strong></span>
                      </div>

                      {loan.phone && (
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>+91 {loan.phone}</span>
                          </div>

                          {/* 1-Click WhatsApp Direct Link */}
                          <button
                            type="button"
                            onClick={() => handleSendReminder(loan)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-[#25D366] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-500/30 transition-colors cursor-pointer"
                            title="Open in WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Timestamp & Return Schedule Info */}
                    <div className="flex flex-col gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Issued On:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {new Date(loan.issuedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} {new Date(loan.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Due Return:</span>
                        {isFlexible ? (
                          <span className="inline-flex items-center gap-1 font-bold text-cyan-700 dark:text-cyan-400">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Open / Flexible (जब मन हो)
                          </span>
                        ) : (
                          <span className={`font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                            {new Date(loan.expectedReturn).toLocaleDateString('en-IN', { dateStyle: 'medium' })} {new Date(loan.expectedReturn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      {isReturned && loan.returnedAt && (
                        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                          <span>Deposited At:</span>
                          <span className="font-semibold">
                            {new Date(loan.returnedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })} ({loan.returnCondition})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Handover Photo Inspection Button (Requested by User) */}
                    {loan.handoverPhoto && (
                      <button
                        type="button"
                        onClick={() => setViewingPhotoLoan(loan)}
                        className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-blue-700 dark:text-cyan-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        <span>📸 View Handover Photo</span>
                      </button>
                    )}

                    {/* Action: Mark as Returned & Delete */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex-1">
                        {!isReturned ? (
                          <button
                            onClick={() => {
                              setReturnModalLoan(loan);
                              setReturnCondition('Good');
                              setReturnNotes('');
                              setSendReturnWhatsApp(Boolean(loan.phone));
                            }}
                            className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Deposit / Mark as Returned</span>
                          </button>
                        ) : (
                          <div className="text-center py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 rounded-xl">
                            ✓ Gear Checked & Returned into Stock
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeletingLoan(loan)}
                        className="p-2.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/40 transition-colors cursor-pointer flex items-center justify-center"
                        title="Delete Loan Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: INVENTORY STOCK CATALOG (Bacha hua saman) */}
      {activeSubTab === 'inventory' && (
        loading ? (
          <div className="py-12 flex justify-center text-slate-400">Loading equipment inventory...</div>
        ) : filteredEquipment.length === 0 ? (
          <div className="py-14 text-center bg-white dark:bg-[#0c0e22] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#7156a5]/10 dark:bg-[#7156a5]/15 text-[#7156a5] dark:text-[#b8a5e5] border border-[#7156a5]/30 flex items-center justify-center mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {searchQuery ? 'No matching equipment found' : 'No equipment in inventory'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {searchQuery 
                ? 'Try adjusting your search terms or clear the search input.' 
                : 'All mock stock has been removed. You can now use "Receive Stock Delivery" to register your genuine sports equipment.'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBatchAddModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7156a5] hover:bg-[#5e458e] text-white shadow-xs transition-all cursor-pointer"
              >
                + Receive Stock Delivery
              </button>
              <button
                type="button"
                onClick={() => setShowAddEqModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#12152e] dark:hover:bg-[#1a1e3d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                + Add Single Item
              </button>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW: INVENTORY STOCK (Requested in audio: 'Kaun sa saman bacha hua hai') */
          <div className="overflow-x-auto scrollbar-thin rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs border-collapse min-w-[940px]">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-3 text-center">#</th>
                  <th className="py-3.5 px-4">Equipment Item (सामान का नाम)</th>
                  <th className="py-3.5 px-3">Sport Discipline</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-4 text-center bg-emerald-500/5 text-emerald-800 dark:text-emerald-300">
                    Available In Store (बचा हुआ सामान)
                  </th>
                  <th className="py-3.5 px-4 text-center bg-amber-500/5 text-amber-800 dark:text-amber-300">
                    Currently Issued (इशू हुआ सामान)
                  </th>
                  <th className="py-3.5 px-4 text-center">Total Stock (कुल सामान)</th>
                  <th className="py-3.5 px-3 text-center">Availability Gauge</th>
                  <th className="py-3.5 px-3">Condition</th>
                  <th className="py-3.5 px-4">Storage Location</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredEquipment.map((item, idx) => {
                  const availPct = Math.round((item.availableQuantity / item.totalQuantity) * 100);
                  const isLow = item.availableQuantity <= 1;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center font-mono text-[11px] text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center text-sm font-bold border border-blue-500/20 flex-shrink-0">
                            📦
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-cyan-300 border border-blue-500/20">
                          {item.sport}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-emerald-500/5">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs sm:text-sm font-black border ${
                          isLow 
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30' 
                            : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                        }`}>
                          {item.availableQuantity} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center bg-amber-500/5">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          {item.issuedQuantity} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                        {item.totalQuantity} Units
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1 w-24 mx-auto">
                          <span className="text-[10px] font-bold text-slate-500">{availPct}% in stock</span>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`}
                              style={{ width: `${availPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-400">
                        {item.location}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer"
                            title="Edit Stock Item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                            title="Delete Stock Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEquipment.map(item => {
              const availPct = Math.round((item.availableQuantity / item.totalQuantity) * 100);
              const isLow = item.availableQuantity <= 1;

              return (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl border border-slate-200 dark:border-slate-700">
                        ⚽
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 mt-0.5">
                          {item.sport} • {item.category}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.condition}
                    </span>
                  </div>

                  {/* Stock Numbers */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase">Available In Store</span>
                      <span className={`text-xl font-extrabold ${isLow ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {item.availableQuantity}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 uppercase">Currently Issued</span>
                      <span className="text-xl font-extrabold text-amber-500">
                        {item.issuedQuantity}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 uppercase">Total Stock</span>
                      <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                        {item.totalQuantity}
                      </span>
                    </div>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span>Availability ({availPct}%)</span>
                      <span>Location: {item.location}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`}
                        style={{ width: `${availPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Actions: Edit & Delete */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Item</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )
      )}

      {/* MODAL 1: RETURN EQUIPMENT VERIFICATION */}
      {returnModalLoan && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                Return Sports Equipment
              </h3>
              <button 
                onClick={() => setReturnModalLoan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex flex-col gap-1 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">{returnModalLoan.equipmentName}</span>
                <span className="text-slate-500">Borrower: <strong>{returnModalLoan.studentName}</strong> (Room {returnModalLoan.roomNumber}, {returnModalLoan.hostelName})</span>
                <span className="text-slate-500">Total units to return: <strong>{returnModalLoan.quantity}</strong> item(s)</span>
              </div>

              {/* Condition Check */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Equipment Condition on Return
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="Good">🟢 Good / Intact (Ready for reuse)</option>
                  <option value="Fair">🟡 Fair / Minor Wear</option>
                  <option value="Damaged">🔴 Damaged (Needs Repair / Warden Note)</option>
                  <option value="Lost">❌ Lost / Replacement Required</option>
                </select>
              </div>

              {/* Condition Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Condition Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Returned with ball pressure good, clean grip"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              {/* WhatsApp Return Confirmation Checkbox */}
              {returnModalLoan.phone && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Send WhatsApp Return Receipt to +91 {returnModalLoan.phone}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendReturnWhatsApp}
                    onChange={(e) => setSendReturnWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReturnModalLoan(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={returning}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-md shadow-emerald-600/30 cursor-pointer min-h-[42px]"
              >
                {returning ? 'Verifying...' : 'Confirm Return & Restore Stock'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW EQUIPMENT */}
      {showAddEqModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleAddEquipment}
            className="w-full max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Add New Sports Equipment
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddEqModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Equipment Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cosco Super Volleyball"
                  value={newEqName}
                  onChange={(e) => setNewEqName(e.target.value)}
                  required
                  className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Sport Discipline</label>
                  <select
                    value={newEqSport}
                    onChange={(e) => setNewEqSport(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {sportsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newEqQty}
                    onChange={(e) => setNewEqQty(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Storage Location</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Sports Room Locker 4"
                  value={newEqLocation}
                  onChange={(e) => setNewEqLocation(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddEqModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 cursor-pointer min-h-[42px]"
              >
                Save Equipment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: View Handover Verification Photo (Admin Inspection) */}
      {viewingPhotoLoan && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Equipment Handover Photo
                </h3>
              </div>
              <button 
                onClick={() => setViewingPhotoLoan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 max-h-[300px] sm:max-h-[340px] flex items-center justify-center">
                <img 
                  src={viewingPhotoLoan.handoverPhoto} 
                  alt="Handover verification" 
                  className="w-full h-auto max-h-[300px] sm:max-h-[340px] object-contain"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Borrower:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{viewingPhotoLoan.studentName} ({viewingPhotoLoan.studentId})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Room & Hostel:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingPhotoLoan.hostelName} • Room {viewingPhotoLoan.roomNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Gear Issued:</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">{viewingPhotoLoan.equipmentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Issued On:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(viewingPhotoLoan.issuedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}, {new Date(viewingPhotoLoan.issuedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              {viewingPhotoLoan.phone && (
                <button
                  type="button"
                  onClick={() => {
                    const clean = viewingPhotoLoan.phone.replace(/\D/g, '');
                    const full = clean.length === 10 ? `91${clean}` : clean;
                    const txt = `🏆 *APEX SPORTS FEST 2026*\n\nHello *${viewingPhotoLoan.studentName}*, your handover photo verification for *${viewingPhotoLoan.equipmentName}* is confirmed on the Hostel Sports Store Desk.\n\n_Sports Desk_`;
                    window.open(`https://api.whatsapp.com/send?phone=${full}&text=${encodeURIComponent(txt)}`, '_blank');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-[#25D366] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1.5 cursor-pointer min-h-[42px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingPhotoLoan(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 cursor-pointer min-h-[42px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SPORT-FIRST STOCK ARRIVAL (User Voice Note: "pehle puche kis game ka hai, aur pura list banaye") */}
      {showBatchAddModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleSaveBatchEquipment}
            className="w-full max-w-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ListPlus className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  <span>Receive New Stock Delivery</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  First select the game/sport, then add the full list of received items.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowBatchAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 flex flex-col gap-4">

            {/* STEP 1: SELECT SPORT / GAME & DEFAULT LOCATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/60 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/40">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <span>1. Kis Game Ka Saman Aaya Hai? (Select Sport) *</span>
                </label>
                <select
                  value={batchSport}
                  onChange={(e) => handleSelectBatchSport(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  {sportsList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-blue-950 dark:text-blue-200">
                  Default Storage Location / Locker
                </label>
                <input
                  type="text"
                  placeholder="e.g. Locker C-1, Sports Store Room"
                  value={batchDefaultLocation}
                  onChange={(e) => setBatchDefaultLocation(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            {/* Quick One-Click Presets for this Sport */}
            {SPORT_ITEM_PRESETS[batchSport] && (
              <div className="flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Add Suggestions for {batchSport} (Click to append):</span>
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                  {SPORT_ITEM_PRESETS[batchSport].map(preset => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleAddPresetItem(preset)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-blue-500" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: DYNAMIC LIST OF RECEIVED ITEMS */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  2. Received Items List ({batchItems.length} items entered)
                </span>
                <button
                  type="button"
                  onClick={handleAddBatchRow}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Item Row</span>
                </button>
              </div>

              {/* Items Table / Grid */}
              <div className="flex flex-col gap-2">
                {batchItems.map((it, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="sm:col-span-1 text-center font-mono font-bold text-xs text-slate-400">
                      #{idx + 1}
                    </div>

                    <div className="sm:col-span-5 flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:hidden">Item Name</label>
                      <input
                        type="text"
                        placeholder="Item name (e.g. Cricket Bat, Wickets, Ball...)"
                        value={it.name}
                        onChange={(e) => handleUpdateBatchField(idx, 'name', e.target.value)}
                        required
                        className="px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 w-full"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:hidden">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        placeholder="Qty"
                        value={it.quantity}
                        onChange={(e) => handleUpdateBatchField(idx, 'quantity', e.target.value)}
                        required
                        className="px-2.5 py-1.5 rounded-xl text-xs sm:text-sm text-center font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 w-full"
                      />
                    </div>

                    <div className="sm:col-span-3 flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:hidden">Category</label>
                      <select
                        value={it.category}
                        onChange={(e) => handleUpdateBatchField(idx, 'category', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 w-full"
                      >
                        <option value="Bats/Racquets">Bats / Racquets</option>
                        <option value="Balls">Balls</option>
                        <option value="Stumps/Posts">Stumps / Posts</option>
                        <option value="Protective">Protective Gear</option>
                        <option value="Nets">Nets / Court</option>
                        <option value="Boards">Boards / Sets</option>
                        <option value="Misc">Misc / Accessories</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveBatchRow(idx)}
                        disabled={batchItems.length <= 1}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 cursor-pointer transition-colors"
                        title="Remove row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Modal Sticky Footer */}
            <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total Units to Receive: <strong className="text-blue-600 dark:text-cyan-400 text-sm">{batchItems.reduce((sum, it) => sum + (parseInt(it.quantity || 0, 10) || 0), 0)}</strong> units across <strong>{batchItems.length}</strong> items.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchAddModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={batchSaving}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 min-h-[42px]"
                >
                  {batchSaving ? 'Saving to Database...' : 'Save All Items into Stock'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* MODAL 4: EDIT EQUIPMENT ITEM (User Voice Note: "edit karne ka option ho") */}
      {editingItem && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-600" />
                <span>Edit Equipment Item ({editingItem.id})</span>
              </h3>
              <button 
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Equipment Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Sport Discipline</label>
                  <select
                    value={editSport}
                    onChange={(e) => setEditSport(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    {sportsList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Bats/Racquets">Bats / Racquets</option>
                    <option value="Balls">Balls</option>
                    <option value="Stumps/Posts">Stumps / Posts</option>
                    <option value="Protective">Protective Gear</option>
                    <option value="Nets">Nets / Court</option>
                    <option value="Boards">Boards / Sets</option>
                    <option value="Misc">Misc / Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Total Stock Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    required
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400">
                    Currently issued: {editingItem.issuedQuantity || 0} units
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Physical Condition</label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="New">New / Brand New</option>
                    <option value="Good">Good Condition</option>
                    <option value="Fair">Fair / Usable</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Storage Location / Locker</label>
                <input
                  type="text"
                  placeholder="e.g. Locker C-1, Sports Store Bay"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editingSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 cursor-pointer disabled:opacity-50 min-h-[42px]"
              >
                {editingSaving ? 'Updating...' : 'Update Equipment in DB'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: CONFIRM DELETE EQUIPMENT (User Voice Note: "delete karne ka option ho") */}
      {deletingItem && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Delete Equipment from Stock?
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  This item will be permanently removed from PostgreSQL.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Item Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{deletingItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Sport:</span>
                <span className="font-semibold text-blue-600 dark:text-cyan-400">{deletingItem.sport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Stock Units:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{deletingItem.totalQuantity} Units</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                disabled={isDeleting}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 cursor-pointer disabled:opacity-50 min-h-[42px]"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete from DB'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CLEAR ALL MOCK DATA (User Voice Note: "isme se saare jo mock data hain usko hata do") */}
      {showClearMockModal && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Clear All Mock Equipment Catalog?
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Purges all mock/seeded stock so you can enter 100% genuine inventory.
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-relaxed">
              ⚠️ This will delete all <strong>{equipmentList.length}</strong> equipment items from your PostgreSQL database. You can then use <strong>"Receive Stock Delivery"</strong> to add your real gear game-wise.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearMockModal(false)}
                disabled={isClearingMock}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearMock}
                disabled={isClearingMock}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 cursor-pointer disabled:opacity-50 min-h-[42px]"
              >
                {isClearingMock ? 'Clearing Database...' : 'Yes, Wipe All Mock Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: DELETE LOAN RECORD (User: "yaha bhi delete ka option do") */}
      {deletingLoan && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Delete Loan Record?
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  This loan entry will be permanently removed from PostgreSQL.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Borrower:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{deletingLoan.studentName} ({deletingLoan.studentRoll})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Issued Gear:</span>
                <span className="font-semibold text-blue-600 dark:text-cyan-400">{deletingLoan.equipmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Quantity:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{deletingLoan.quantity} unit(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
                <span className={`font-bold ${deletingLoan.status === 'Returned' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {deletingLoan.status}
                </span>
              </div>
            </div>

            {deletingLoan.status !== 'Returned' && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
                ℹ️ <strong>Auto Stock Recovery:</strong> Since this gear was not deposited yet, deleting this record will automatically restore <strong>{deletingLoan.quantity}</strong> unit(s) back into available stock.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingLoan(null)}
                disabled={isDeletingLoan}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLoan}
                disabled={isDeletingLoan}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/25 cursor-pointer disabled:opacity-50 min-h-[42px]"
              >
                {isDeletingLoan ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
