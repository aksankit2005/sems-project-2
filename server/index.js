import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  initDatabase, 
  isDatabaseConnected, 
  dbStudents, 
  dbEquipment, 
  dbLoans, 
  dbAttendance, 
  dbGatePasses 
} from './db/index.js';
import { uploadToCloudinary, isConfigured as isCloudinaryConfigured } from './config/cloudinary.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize PostgreSQL on Server Boot
initDatabase();

// 12 MPGI Sports Disciplines Configuration
const SPORTS_CONFIG = [
  { id: 'gully-cricket', name: 'Gully Cricket', icon: '🏏', category: 'Team Sport', defaultPlayers: 6 },
  { id: 'cricket', name: 'Cricket', icon: '🏏', category: 'Team Sport', defaultPlayers: 11 },
  { id: 'basketball', name: 'Basketball', icon: '🏀', category: 'Team Sport', defaultPlayers: 5 },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', category: 'Team Sport', defaultPlayers: 6 },
  { id: 'football', name: 'Football', icon: '⚽', category: 'Team Sport', defaultPlayers: 7 },
  { id: 'kho-kho', name: 'Kho-Kho', icon: '🏃‍♂️', category: 'Team Sport', defaultPlayers: 9 },
  { id: 'kabaddi', name: 'Kabaddi', icon: '🤼', category: 'Contact Sport', defaultPlayers: 7 },
  { id: 'tug-of-war', name: 'Tug of War', icon: '🪢', category: 'Strength Sport', defaultPlayers: 8 },
  { id: 'chess', name: 'Chess', icon: '♟️', category: 'Indoor / Mind Sport', defaultPlayers: 1 },
  { id: 'table-tennis', name: 'Table Tennis', icon: '🏓', category: 'Racquet Sport', defaultPlayers: 2 },
  { id: 'badminton', name: 'Badminton', icon: '🏸', category: 'Racquet Sport', defaultPlayers: 2 },
  { id: 'athletics', name: 'Athletics', icon: '🏃', category: 'Track & Field', defaultPlayers: 1 },
];

// GET /api/sports
app.get('/api/sports', (req, res) => {
  res.json({ sports: SPORTS_CONFIG });
});

// GET /api/db-status (Audit DB & Cloudinary connection)
app.get('/api/db-status', (req, res) => {
  res.json({
    database: {
      type: 'PostgreSQL',
      connected: isDatabaseConnected(),
      connectionUrl: process.env.DATABASE_URL ? 'Configured in .env' : 'Using PG* host variables'
    },
    cloudinary: {
      configured: isCloudinaryConfigured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'Not set'
    },
    uptime: process.uptime()
  });
});

// GET /api/stats (Real-time dynamic stats from DB)
app.get('/api/stats', async (req, res) => {
  try {
    const [students, equipment, loans, sessions] = await Promise.all([
      dbStudents.getAll(),
      dbEquipment.getAll(),
      dbLoans.getAll(),
      dbAttendance.getSessions()
    ]);

    const totalStudents = students.length;
    const hostellers = students.filter(s => s.residency === 'Hosteller').length;
    const dayScholars = students.filter(s => s.residency === 'Day Scholar').length;
    
    const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Overdue').length;
    const overdueLoans = loans.filter(l => l.status === 'Overdue').length;
    
    const totalEquipmentItems = equipment.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
    const issuedEquipmentItems = equipment.reduce((sum, item) => sum + (item.issuedQuantity || 0), 0);

    let totalAttendanceLogs = 0;
    let presentAttendanceLogs = 0;
    sessions.forEach(s => {
      totalAttendanceLogs += s.total || 0;
      presentAttendanceLogs += (s.present || 0) + (s.late || 0);
    });

    const attendanceRate = totalAttendanceLogs > 0 ? Math.round((presentAttendanceLogs / totalAttendanceLogs) * 100) : 0;

    res.json({
      totalStudents,
      hostellers,
      dayScholars,
      activeLoans,
      overdueLoans,
      totalEquipmentItems,
      issuedEquipmentItems,
      attendanceRate,
      totalSessions: sessions.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// STUDENTS API
// ====================================================================

// GET /api/students
app.get('/api/students', async (req, res) => {
  try {
    let students = await dbStudents.getAll();
    const { residency, sport, gender, search } = req.query;

    if (residency && residency !== 'all') {
      students = students.filter(s => s.residency?.toLowerCase() === residency.toLowerCase());
    }
    if (sport && sport !== 'all') {
      students = students.filter(s => s.sports && s.sports.some(sp => sp.toLowerCase() === sport.toLowerCase()));
    }
    if (gender && gender !== 'all') {
      students = students.filter(s => s.gender?.toLowerCase() === gender.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.rollNumber.toLowerCase().includes(q) ||
        (s.college && s.college.toLowerCase().includes(q)) ||
        (s.roomNumber && s.roomNumber.toLowerCase().includes(q)) ||
        (s.hostelName && s.hostelName.toLowerCase().includes(q))
      );
    }

    // Attach real turnout stats from actual attendance sessions
    students = await Promise.all(students.map(async student => {
      const history = await dbAttendance.getStudentHistory(student.id);
      const total = history.length;
      const attended = history.filter(h => h.status === 'Present' || h.status === 'Late').length;
      const attendancePct = total > 0 ? Math.round((attended / total) * 100) : null;
      return {
        ...student,
        attendanceStats: {
          total,
          attended,
          attendancePct
        }
      };
    }));

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students
app.post('/api/students', async (req, res) => {
  try {
    const { name, rollNumber, college, residency, hostelName, roomNumber, gender, phone, sports } = req.body;

    if (!name || !rollNumber) {
      return res.status(400).json({ error: 'Name and Roll Number are required' });
    }

    const newStudent = {
      id: `MPGI-${Date.now().toString().slice(-4)}`,
      name,
      rollNumber,
      college: college || 'MPGI',
      residency: residency || 'Hosteller',
      hostelName: residency === 'Day Scholar' ? 'Day Scholar' : (hostelName || 'Maharana Pratap Boys Hostel'),
      roomNumber: residency === 'Day Scholar' ? 'N/A' : (roomNumber || 'A-101'),
      gender: gender || 'Male',
      phone: phone || '',
      sports: sports || ['Cricket'],
    };

    const saved = await dbStudents.create(newStudent);
    res.status(201).json({ student: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id
app.delete('/api/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const students = await dbStudents.getAll();
    const student = students.find(s => s.id === studentId || s.rollNumber === studentId);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found in roster' });
    }

    // Safeguard: Check if student currently holds unreturned gear
    const loans = await dbLoans.getAll('Active');
    const activeLoan = loans.find(l => 
      (l.studentId === student.id || l.studentRoll === student.rollNumber || (l.studentName && l.studentName.toLowerCase() === student.name.toLowerCase()))
    );

    if (activeLoan) {
      return res.status(400).json({ 
        error: `Cannot delete student. "${student.name}" currently holds active gear (${activeLoan.equipmentName}). Please ensure gear is returned first.` 
      });
    }

    await dbStudents.delete(student.id);
    res.json({ success: true, message: `Student "${student.name}" deleted successfully from database` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// ATTENDANCE API
// ====================================================================

// GET /api/attendance/sessions
app.get('/api/attendance/sessions', async (req, res) => {
  try {
    const sessions = await dbAttendance.getSessions();
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const { date, sport } = req.query;
    const session = await dbAttendance.getSession(date, sport);
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance
app.post('/api/attendance', async (req, res) => {
  try {
    const { date, sport, sessionType, records } = req.body;

    if (!date || !sport || !records) {
      return res.status(400).json({ error: 'Date, Sport, and Records are required' });
    }

    const sessionObj = {
      id: `ATT-${date}-${sport.replace(/\s+/g, '-').toLowerCase()}`,
      date,
      sport,
      sessionType: sessionType || 'Evening Practice',
      records,
      updatedAt: new Date().toISOString()
    };

    const saved = await dbAttendance.saveSession(sessionObj);
    res.json({ success: true, session: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/history/:studentId
app.get('/api/attendance/history/:studentId', async (req, res) => {
  try {
    const students = await dbStudents.getAll();
    const student = students.find(s => s.id === req.params.studentId || s.rollNumber === req.params.studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const history = await dbAttendance.getStudentHistory(student.id);
    const totalSessions = history.length;
    const presentCount = history.filter(h => h.status === 'Present').length;
    const absentCount = history.filter(h => h.status === 'Absent').length;
    const lateCount = history.filter(h => h.status === 'Late').length;
    const excusedCount = history.filter(h => h.status === 'Excused').length;
    const attendancePct = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;

    res.json({
      student,
      summary: {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePct
      },
      history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// EQUIPMENT & LOANS API
// ====================================================================

// GET /api/equipment
app.get('/api/equipment', async (req, res) => {
  try {
    const equipment = await dbEquipment.getAll();
    res.json({ equipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipment
app.post('/api/equipment', async (req, res) => {
  try {
    const { name, sport, category, totalQuantity, condition, location } = req.body;

    if (!name || !sport || !totalQuantity) {
      return res.status(400).json({ error: 'Name, Sport, and Total Quantity are required' });
    }

    const qty = parseInt(totalQuantity, 10);
    const newItem = {
      id: `EQ-${Date.now().toString().slice(-4)}`,
      name,
      sport,
      category: category || 'Misc',
      totalQuantity: qty,
      availableQuantity: qty,
      issuedQuantity: 0,
      condition: condition || 'Good',
      location: location || 'Hostel Sports Store Bay'
    };

    const saved = await dbEquipment.create(newItem);
    res.status(201).json({ item: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipment/batch (Sport-first multi-item arrival list)
app.post('/api/equipment/batch', async (req, res) => {
  try {
    const { sport, defaultLocation, items } = req.body;

    if (!sport) {
      return res.status(400).json({ error: 'Sport / Game is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one equipment item is required' });
    }

    const validItems = items.filter(it => it && it.name && it.name.trim() !== '');
    if (validItems.length === 0) {
      return res.status(400).json({ error: 'Please enter at least one valid item name' });
    }

    const itemsToCreate = validItems.map((it, idx) => {
      const qty = Math.max(1, parseInt(it.quantity || 1, 10));
      return {
        id: `EQ-${Date.now().toString().slice(-4)}-${idx + 1}`,
        name: it.name.trim(),
        sport: sport,
        category: it.category || 'Misc',
        totalQuantity: qty,
        availableQuantity: qty,
        issuedQuantity: 0,
        condition: it.condition || 'Good',
        location: it.location || defaultLocation || 'Hostel Sports Store Bay'
      };
    });

    const savedItems = await dbEquipment.createBatch(itemsToCreate);
    res.status(201).json({ 
      success: true, 
      count: savedItems.length, 
      items: savedItems 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/equipment/:id (Edit equipment in PostgreSQL)
app.put('/api/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sport, category, totalQuantity, condition, location } = req.body;

    const updated = await dbEquipment.update(id, {
      name,
      sport,
      category,
      totalQuantity,
      condition,
      location
    });

    if (!updated) {
      return res.status(404).json({ error: 'Equipment item not found' });
    }

    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/equipment/mock/clear (Wipe all mock/seeded stock data)
app.delete('/api/equipment/mock/clear', async (req, res) => {
  try {
    await dbEquipment.clearAll();
    res.json({ success: true, message: 'All mock equipment catalog cleared from database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/equipment/:id (Delete individual equipment from PostgreSQL)
app.delete('/api/equipment/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Optional check: if equipment is currently on active loan, warn or block
    const allLoans = await dbLoans.getAll('all');
    const hasActiveLoan = allLoans.some(
      l => (l.status === 'Active' || l.status === 'Overdue') && l.equipmentId === id
    );

    if (hasActiveLoan) {
      return res.status(400).json({ 
        error: 'Cannot delete equipment currently issued out on loan. Return items first.' 
      });
    }

    await dbEquipment.delete(id);
    res.json({ success: true, message: `Equipment ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/equipment/loans
app.get('/api/equipment/loans', async (req, res) => {
  try {
    const { status } = req.query;
    const loans = await dbLoans.getAll(status);
    res.json({ loans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipment/issue (With Cloudinary Image Upload)
app.post('/api/equipment/issue', async (req, res) => {
  try {
    const { 
      items, 
      equipmentId, 
      quantity, 
      studentName, 
      rollNumber, 
      roomNumber, 
      hostelName, 
      phone, 
      residency, 
      expectedReturn, 
      isFlexibleReturn,
      handoverPhoto,
      notes 
    } = req.body;

    if (!studentName) {
      return res.status(400).json({ error: 'Student Name is required' });
    }

    const inventory = await dbEquipment.getAll();

    // Normalize items
    let itemsToProcess = [];
    if (Array.isArray(items) && items.length > 0) {
      itemsToProcess = items.filter(it => it && it.name && it.name.trim() !== '');
    } else if (equipmentId) {
      itemsToProcess = [{ equipmentId, quantity: parseInt(quantity || 1, 10) }];
    }

    if (itemsToProcess.length === 0) {
      return res.status(400).json({ error: 'At least one equipment item is required to issue' });
    }

    const processedItems = [];

    for (const it of itemsToProcess) {
      const qty = parseInt(it.quantity || 1, 10);
      let found = null;
      if (it.equipmentId) {
        found = inventory.find(e => e.id === it.equipmentId);
      }
      if (!found && it.name) {
        found = inventory.find(e => e.name.toLowerCase() === it.name.toLowerCase().trim());
      }

      if (found) {
        if (found.availableQuantity < qty) {
          return res.status(400).json({ 
            error: `Insufficient stock for "${found.name}". Only ${found.availableQuantity} available in store.` 
          });
        }
        await dbEquipment.updateQuantities(
          found.id,
          found.availableQuantity - qty,
          found.issuedQuantity + qty,
          found.condition
        );

        processedItems.push({
          equipmentId: found.id,
          name: found.name,
          sport: found.sport,
          quantity: qty
        });
      } else {
        processedItems.push({
          equipmentId: null,
          name: (it.name || 'Sports Equipment').trim(),
          sport: it.sport || 'Custom / Misc',
          quantity: qty
        });
      }
    }

    const summaryName = processedItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const totalQty = processedItems.reduce((acc, i) => acc + i.quantity, 0);

    // Upload handover photo to Cloudinary if supplied
    let photoUrl = null;
    if (handoverPhoto && typeof handoverPhoto === 'string' && handoverPhoto.startsWith('data:image')) {
      try {
        console.log('📸 Uploading gear handover verification photo to Cloudinary...');
        const uploadRes = await uploadToCloudinary(handoverPhoto, 'sems_gear_loans');
        photoUrl = uploadRes?.url || handoverPhoto;
        console.log('✅ Handover photo ready:', photoUrl?.slice(0, 50) + '...');
      } catch (uploadErr) {
        console.error('Photo upload error, using local fallback:', uploadErr.message);
        photoUrl = handoverPhoto;
      }
    } else if (handoverPhoto) {
      photoUrl = handoverPhoto;
    }

    const newLoan = {
      id: `LOAN-${Date.now().toString().slice(-6)}`,
      items: processedItems,
      equipmentId: processedItems[0]?.equipmentId || null,
      equipmentName: summaryName,
      quantity: totalQty,
      studentId: rollNumber || `TEMP-${Date.now().toString().slice(-4)}`,
      studentName,
      studentRoll: rollNumber || 'N/A',
      roomNumber: roomNumber || 'N/A',
      hostelName: hostelName || 'Hostel',
      phone: phone || '',
      residency: residency || 'Hosteller',
      issuedAt: new Date().toISOString(),
      expectedReturn: isFlexibleReturn ? 'Open / Flexible' : (expectedReturn || 'Open / Flexible'),
      isFlexibleReturn: Boolean(isFlexibleReturn || expectedReturn === 'Open / Flexible'),
      returnedAt: null,
      status: 'Active',
      returnCondition: null,
      handoverPhoto: photoUrl,
      notes: notes || ''
    };

    const savedLoan = await dbLoans.create(newLoan);
    res.status(201).json({ loan: savedLoan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/equipment/return
app.post('/api/equipment/return', async (req, res) => {
  try {
    const { loanId, condition, notes } = req.body;
    const loans = await dbLoans.getAll();
    const loan = loans.find(l => l.id === loanId);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan record not found' });
    }

    if (loan.status === 'Returned') {
      return res.status(400).json({ error: 'Item is already returned' });
    }

    // Restore stock
    const inventory = await dbEquipment.getAll();
    if (loan.equipmentId) {
      const match = inventory.find(e => e.id === loan.equipmentId);
      if (match) {
        await dbEquipment.updateQuantities(
          match.id,
          Math.min(match.totalQuantity, match.availableQuantity + (loan.quantity || 1)),
          Math.max(0, match.issuedQuantity - (loan.quantity || 1)),
          condition || match.condition
        );
      }
    }

    const updated = await dbLoans.markReturned(loanId, condition, notes);
    res.json({ success: true, loan: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/equipment/loans/:id (Delete loan from PostgreSQL and history)
app.delete('/api/equipment/loans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await dbLoans.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Loan record not found' });
    }
    res.json({ success: true, message: `Loan ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// DAY SCHOLAR GATE PASSES API
// ====================================================================

// GET /api/gate-passes
app.get('/api/gate-passes', async (req, res) => {
  try {
    const passes = await dbGatePasses.getAll();
    res.json({ passes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gate-passes
app.post('/api/gate-passes', async (req, res) => {
  try {
    const { date, guardPhone, guardName, gateLocation, students, authorizedBy, notes } = req.body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'At least one day scholar must be added to the gate pass' });
    }

    const newPass = {
      id: `PASS-${Date.now().toString().slice(-6)}`,
      date: date || new Date().toISOString().split('T')[0],
      guardPhone: guardPhone || '',
      guardName: guardName || 'Main Gate Security',
      gateLocation: gateLocation || 'Main Campus Security Gate',
      authorizedBy: authorizedBy || 'Sports Coach / APEX Council',
      notes: notes || '',
      students: students.map((s, idx) => ({
        id: s.id || `s-${idx + 1}`,
        name: s.name,
        sport: s.sport || 'Cricket',
        gender: s.gender || 'Male',
        course: s.course || 'B.Tech',
        entryTime: s.entryTime || '05:00 PM',
        exitTime: s.exitTime || '07:30 PM'
      })),
      createdAt: new Date().toISOString(),
      status: 'Authorized'
    };

    const saved = await dbGatePasses.create(newPass);
    res.status(201).json({ pass: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/gate-passes/:id
app.delete('/api/gate-passes/:id', async (req, res) => {
  try {
    await dbGatePasses.delete(req.params.id);
    res.json({ success: true, message: 'Gate pass record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// DIRECT IMAGE UPLOAD TO CLOUDINARY
// ====================================================================
app.post('/api/upload', async (req, res) => {
  try {
    const { image, folder } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 string) is required' });
    }

    const result = await uploadToCloudinary(image, folder || 'sems_uploads');
    res.json({
      success: true,
      url: result?.url || image,
      publicId: result?.public_id || null,
      provider: isCloudinaryConfigured ? 'Cloudinary CDN' : 'Local Fallback'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 [Production Backend] SEMS API Server running on port ${PORT}`);
  console.log(`📡 Endpoints: http://localhost:${PORT}/api/stats, /api/db-status`);
});
