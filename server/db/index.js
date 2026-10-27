import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from environment variables
// Supports Supabase, Neon, Render, Railway and local PostgreSQL
function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    const isCloudDb = 
      process.env.NODE_ENV === 'production' || 
      process.env.DATABASE_URL.includes('supabase') || 
      process.env.DATABASE_URL.includes('render') || 
      process.env.DATABASE_URL.includes('neon') || 
      process.env.DATABASE_URL.includes('aws') ||
      process.env.PGSSL === 'true';

    return {
      connectionString: process.env.DATABASE_URL,
      ...(isCloudDb ? { ssl: { rejectUnauthorized: false } } : {})
    };
  }

  if (process.env.PGPASSWORD) {
    const isCloudHost = process.env.PGHOST && process.env.PGHOST !== 'localhost' && process.env.PGHOST !== '127.0.0.1';
    return {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'sems_db',
      ...((isCloudHost || process.env.PGSSL === 'true') ? { ssl: { rejectUnauthorized: false } } : {})
    };
  }

  return {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'sems_db'
  };
}

export const pool = new Pool(buildPoolConfig());

let isPgConnected = false;

// Fallback JSON store (in case PostgreSQL credentials are still being configured)
const FALLBACK_DATA_FILE = path.join(__dirname, '..', 'data.json');

function readFallbackData() {
  try {
    if (!fs.existsSync(FALLBACK_DATA_FILE)) {
      return { students: [], equipment: [], loans: [], attendance: [], gatePasses: [], hostelPermissions: [] };
    }
    const raw = fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.gatePasses) parsed.gatePasses = [];
    if (!parsed.hostelPermissions) parsed.hostelPermissions = [];
    return parsed;
  } catch (err) {
    return { students: [], equipment: [], loans: [], attendance: [], gatePasses: [], hostelPermissions: [] };
  }
}

function writeFallbackData(data) {
  try {
    fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fallback data:', err);
  }
}

/**
 * Initialize PostgreSQL Schema & Tables
 */
export async function initDatabase() {
  try {
    const test = await pool.query('SELECT NOW() as now, version() as version;');
    isPgConnected = true;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🐘 [PostgreSQL] Connected successfully to database!');
    console.log('   Timestamp:', test.rows[0].now);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('✅ [PostgreSQL] Schema Verified: Tables students, equipment, loans, attendance, day_scholar_passes are ready.');
    }

    // Auto-migrate tables to ensure all required columns exist across any DB version (local or cloud)
    const migrations = [
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS pass_code VARCHAR(64);`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS gate_number VARCHAR(128);`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS gate_location VARCHAR(128);`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS guard_name VARCHAR(128);`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS guard_phone VARCHAR(32);`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'Authorized';`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS issued_by VARCHAR(128) DEFAULT 'Sports Admin';`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS authorized_by VARCHAR(128) DEFAULT 'Sports Admin';`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS authorized_students JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS students JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS notes TEXT;`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS date VARCHAR(64);`,
      `ALTER TABLE day_scholar_passes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,
      `ALTER TABLE day_scholar_passes ALTER COLUMN pass_code DROP NOT NULL;`,
      `ALTER TABLE day_scholar_passes ALTER COLUMN gate_number DROP NOT NULL;`,
      `ALTER TABLE day_scholar_passes ALTER COLUMN guard_phone DROP NOT NULL;`,
      `ALTER TABLE day_scholar_passes ALTER COLUMN authorized_students DROP NOT NULL;`,
      `ALTER TABLE loans ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE loans ADD COLUMN IF NOT EXISTS is_flexible_return BOOLEAN DEFAULT false;`,
      `ALTER TABLE loans ADD COLUMN IF NOT EXISTS handover_photo_url TEXT;`,
      `ALTER TABLE loans ADD COLUMN IF NOT EXISTS return_condition VARCHAR(32);`,
      `ALTER TABLE loans ADD COLUMN IF NOT EXISTS notes TEXT;`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS college VARCHAR(128) DEFAULT 'MPGI';`,
      `CREATE TABLE IF NOT EXISTS hostel_permissions (
        id VARCHAR(64) PRIMARY KEY,
        permission_code VARCHAR(64),
        warden_name VARCHAR(128),
        warden_phone VARCHAR(32),
        hostel_name VARCHAR(128),
        from_date VARCHAR(64),
        to_date VARCHAR(64),
        from_time VARCHAR(64),
        to_time VARCHAR(64),
        venue VARCHAR(256),
        purpose VARCHAR(256),
        authorized_by VARCHAR(128) DEFAULT 'APEX Sports Officer / Coach',
        notes TEXT,
        players JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(32) DEFAULT 'Approved',
        pdf_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );`
    ];

    for (const sql of migrations) {
      try {
        await pool.query(sql);
      } catch (migErr) {
        // Silently continue if column already exists or constraint already dropped
      }
    }

    // Check equipment table status
    const eqCount = await pool.query('SELECT COUNT(*) FROM equipment;');
    console.log(`📦 [PostgreSQL] Equipment inventory ready (${eqCount.rows[0].count} items).`);

    // Check students table status & seed if empty
    const stuCount = await pool.query('SELECT COUNT(*) FROM students;');
    if (parseInt(stuCount.rows[0].count, 10) === 0) {
      console.log('🌱 [PostgreSQL] Seeding initial student roster from directory catalog...');
      const fallback = readFallbackData();
      for (const s of (fallback.students || [])) {
        await pool.query(
          `INSERT INTO students (id, roll_number, name, college, gender, residency, hostel_name, room_number, phone, sports)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (roll_number) DO NOTHING;`,
          [
            s.id,
            s.rollNumber,
            s.name,
            s.college || 'MPGI',
            s.gender || 'Male',
            s.residency || 'Hosteller',
            s.hostelName || 'Maharana Pratap Boys Hostel',
            s.roomNumber || 'N/A',
            s.phone || '',
            JSON.stringify(s.sports || ['Cricket'])
          ]
        );
      }
      console.log('✅ [PostgreSQL] Initial student roster seeded successfully.');
    } else {
      console.log(`🎓 [PostgreSQL] Students directory ready (${stuCount.rows[0].count} registered).`);
    }

    return true;
  } catch (err) {
    isPgConnected = false;
    console.warn('\n⚠️  [PostgreSQL Connection Notice]');
    console.warn('   PostgreSQL could not be reached with current .env credentials.');
    console.warn('   Reason:', err.message);
    console.warn('   💡 To connect directly to your PostgreSQL database, update .env:');
    console.warn('      DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/sems_db');
    console.warn('   ⚡ Zero-downtime persistence engine active so API continues seamlessly.\n');
    return false;
  }
}

export function isDatabaseConnected() {
  return isPgConnected;
}

// ====================================================================
// UNIFIED DATA ACCESS METHODS (PostgreSQL with Zero-Downtime Fallback)
// ====================================================================

export const dbStudents = {
  async getAll() {
    if (isPgConnected) {
      const res = await pool.query('SELECT * FROM students ORDER BY name ASC;');
      return res.rows.map(r => ({
        id: r.id,
        rollNumber: r.roll_number,
        name: r.name,
        college: r.college || 'MPGI',
        gender: r.gender,
        residency: r.residency,
        hostelName: r.hostel_name,
        roomNumber: r.room_number,
        phone: r.phone,
        sports: typeof r.sports === 'string' ? JSON.parse(r.sports) : (r.sports || []),
        createdAt: r.created_at
      }));
    }
    return readFallbackData().students || [];
  },

  async create(student) {
    if (isPgConnected) {
      const res = await pool.query(
        `INSERT INTO students (id, roll_number, name, college, gender, residency, hostel_name, room_number, phone, sports)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`,
        [
          student.id,
          student.rollNumber,
          student.name,
          student.college || 'MPGI',
          student.gender || 'Male',
          student.residency || 'Hosteller',
          student.hostelName,
          student.roomNumber,
          student.phone || '',
          JSON.stringify(student.sports || ['Cricket'])
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        rollNumber: r.roll_number,
        name: r.name,
        college: r.college || 'MPGI',
        gender: r.gender,
        residency: r.residency,
        hostelName: r.hostel_name,
        roomNumber: r.room_number,
        phone: r.phone,
        sports: typeof r.sports === 'string' ? JSON.parse(r.sports) : (r.sports || []),
        createdAt: r.created_at
      };
    }
    const data = readFallbackData();
    data.students.push(student);
    writeFallbackData(data);
    return student;
  },

  async delete(studentId) {
    if (isPgConnected) {
      await pool.query('DELETE FROM students WHERE id = $1 OR roll_number = $1;', [studentId]);
      return true;
    }
    const data = readFallbackData();
    const idx = data.students.findIndex(s => s.id === studentId || s.rollNumber === studentId);
    if (idx !== -1) {
      data.students.splice(idx, 1);
      writeFallbackData(data);
    }
    return true;
  }
};

export const dbEquipment = {
  async getAll() {
    if (isPgConnected) {
      const res = await pool.query('SELECT * FROM equipment ORDER BY name ASC;');
      return res.rows.map(r => ({
        id: r.id,
        name: r.name,
        sport: r.sport,
        category: r.category,
        totalQuantity: r.total_quantity,
        availableQuantity: r.available_quantity,
        issuedQuantity: r.issued_quantity,
        condition: r.condition,
        location: r.location
      }));
    }
    return readFallbackData().equipment || [];
  },

  async create(item) {
    if (isPgConnected) {
      const res = await pool.query(
        `INSERT INTO equipment (id, name, sport, category, total_quantity, available_quantity, issued_quantity, condition, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
        [
          item.id,
          item.name,
          item.sport,
          item.category,
          item.totalQuantity,
          item.availableQuantity,
          item.issuedQuantity,
          item.condition || 'Good',
          item.location || 'Hostel Sports Store Bay'
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        name: r.name,
        sport: r.sport,
        category: r.category,
        totalQuantity: r.total_quantity,
        availableQuantity: r.available_quantity,
        issuedQuantity: r.issued_quantity,
        condition: r.condition,
        location: r.location
      };
    }
    const data = readFallbackData();
    data.equipment.push(item);
    writeFallbackData(data);
    return item;
  },

  async update(id, updates) {
    if (isPgConnected) {
      // First get current row to accurately compute availableQuantity
      const currentRes = await pool.query('SELECT * FROM equipment WHERE id = $1;', [id]);
      if (currentRes.rows.length === 0) return null;
      const current = currentRes.rows[0];

      const newTotal = updates.totalQuantity !== undefined ? parseInt(updates.totalQuantity, 10) : current.total_quantity;
      const currentIssued = current.issued_quantity || 0;
      const newAvail = Math.max(0, newTotal - currentIssued);

      const res = await pool.query(
        `UPDATE equipment 
         SET name = COALESCE($1, name),
             sport = COALESCE($2, sport),
             category = COALESCE($3, category),
             total_quantity = $4,
             available_quantity = $5,
             condition = COALESCE($6, condition),
             location = COALESCE($7, location),
             updated_at = NOW()
         WHERE id = $8
         RETURNING *;`,
        [
          updates.name || null,
          updates.sport || null,
          updates.category || null,
          newTotal,
          newAvail,
          updates.condition || null,
          updates.location || null,
          id
        ]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        name: r.name,
        sport: r.sport,
        category: r.category,
        totalQuantity: r.total_quantity,
        availableQuantity: r.available_quantity,
        issuedQuantity: r.issued_quantity,
        condition: r.condition,
        location: r.location
      };
    }
    const data = readFallbackData();
    const match = data.equipment.find(e => e.id === id);
    if (match) {
      if (updates.name) match.name = updates.name;
      if (updates.sport) match.sport = updates.sport;
      if (updates.category) match.category = updates.category;
      if (updates.totalQuantity !== undefined) {
        match.totalQuantity = parseInt(updates.totalQuantity, 10);
        match.availableQuantity = Math.max(0, match.totalQuantity - (match.issuedQuantity || 0));
      }
      if (updates.condition) match.condition = updates.condition;
      if (updates.location) match.location = updates.location;
      writeFallbackData(data);
      return match;
    }
    return null;
  },

  async delete(id) {
    if (isPgConnected) {
      await pool.query('DELETE FROM equipment WHERE id = $1;', [id]);
      return true;
    }
    const data = readFallbackData();
    const idx = data.equipment.findIndex(e => e.id === id);
    if (idx !== -1) {
      data.equipment.splice(idx, 1);
      writeFallbackData(data);
    }
    return true;
  },

  async clearAll() {
    if (isPgConnected) {
      await pool.query('DELETE FROM equipment;');
      return true;
    }
    const data = readFallbackData();
    data.equipment = [];
    writeFallbackData(data);
    return true;
  },

  async createBatch(items) {
    const results = [];
    for (const item of items) {
      const res = await this.create(item);
      results.push(res);
    }
    return results;
  },

  async updateQuantities(id, availableQuantity, issuedQuantity, condition) {
    if (isPgConnected) {
      await pool.query(
        `UPDATE equipment 
         SET available_quantity = $1, issued_quantity = $2, condition = COALESCE($3, condition), updated_at = NOW()
         WHERE id = $4;`,
        [availableQuantity, issuedQuantity, condition || null, id]
      );
      return;
    }
    const data = readFallbackData();
    const match = data.equipment.find(e => e.id === id);
    if (match) {
      match.availableQuantity = availableQuantity;
      match.issuedQuantity = issuedQuantity;
      if (condition) match.condition = condition;
      writeFallbackData(data);
    }
  }
};

export const dbLoans = {
  async getAll(statusFilter = 'all') {
    if (isPgConnected) {
      let sql = 'SELECT * FROM loans';
      const params = [];
      if (statusFilter && statusFilter !== 'all') {
        sql += ' WHERE LOWER(status) = LOWER($1)';
        params.push(statusFilter);
      }
      sql += ' ORDER BY issued_at DESC;';
      const res = await pool.query(sql, params);
      return res.rows.map(r => ({
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentRoll: r.student_roll,
        residency: r.residency,
        hostelName: r.hostel_name,
        roomNumber: r.room_number,
        phone: r.phone,
        equipmentId: r.equipment_id,
        equipmentName: r.equipment_name,
        quantity: r.quantity,
        issuedAt: r.issued_at,
        expectedReturn: r.expected_return,
        isFlexibleReturn: r.is_flexible_return,
        returnedAt: r.returned_at,
        status: r.status,
        returnCondition: r.return_condition,
        notes: r.notes,
        handoverPhoto: r.handover_photo_url
      }));
    }
    const data = readFallbackData();
    let loans = [...(data.loans || [])];
    if (statusFilter && statusFilter !== 'all') {
      loans = loans.filter(l => l.status.toLowerCase() === statusFilter.toLowerCase());
    }
    return loans.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  },

  async create(loan) {
    if (isPgConnected) {
      const res = await pool.query(
        `INSERT INTO loans (
          id, student_id, student_name, student_roll, residency, hostel_name, room_number, phone,
          equipment_id, equipment_name, quantity, issued_at, expected_return, is_flexible_return,
          status, return_condition, notes, handover_photo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *;`,
        [
          loan.id,
          loan.studentId,
          loan.studentName,
          loan.studentRoll || loan.rollNumber || 'TEMP',
          loan.residency || 'Hosteller',
          loan.hostelName,
          loan.roomNumber,
          loan.phone || '',
          loan.equipmentId,
          loan.equipmentName,
          loan.quantity || 1,
          loan.issuedAt || new Date().toISOString(),
          loan.expectedReturn && loan.expectedReturn !== 'Open / Flexible' ? new Date(loan.expectedReturn).toISOString() : null,
          Boolean(loan.isFlexibleReturn),
          loan.status || 'Active',
          null,
          loan.notes || '',
          loan.handoverPhoto || null
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        studentId: r.student_id,
        studentName: r.student_name,
        studentRoll: r.student_roll,
        residency: r.residency,
        hostelName: r.hostel_name,
        roomNumber: r.room_number,
        phone: r.phone,
        equipmentId: r.equipment_id,
        equipmentName: r.equipment_name,
        quantity: r.quantity,
        issuedAt: r.issued_at,
        expectedReturn: r.expected_return,
        isFlexibleReturn: r.is_flexible_return,
        returnedAt: r.returned_at,
        status: r.status,
        returnCondition: r.return_condition,
        notes: r.notes,
        handoverPhoto: r.handover_photo_url
      };
    }
    const data = readFallbackData();
    data.loans.unshift(loan);
    writeFallbackData(data);
    return loan;
  },

  async markReturned(loanId, condition, notes) {
    if (isPgConnected) {
      const res = await pool.query(
        `UPDATE loans 
         SET status = 'Returned', returned_at = NOW(), return_condition = $1, notes = COALESCE(notes || ' | ' || $2, $2), updated_at = NOW()
         WHERE id = $3 RETURNING *;`,
        [condition || 'Good', notes || '', loanId]
      );
      return res.rows[0];
    }
    const data = readFallbackData();
    const loan = data.loans.find(l => l.id === loanId);
    if (loan) {
      loan.status = 'Returned';
      loan.returnedAt = new Date().toISOString();
      loan.returnCondition = condition || 'Good';
      if (notes) loan.notes = (loan.notes ? loan.notes + ' | ' : '') + notes;
      writeFallbackData(data);
    }
    return loan;
  },

  async delete(loanId) {
    if (isPgConnected) {
      // First get loan details to restore equipment stock if active/overdue
      const loanRes = await pool.query('SELECT * FROM loans WHERE id = $1;', [loanId]);
      if (loanRes.rows.length === 0) return null;
      const loan = loanRes.rows[0];

      // If active/overdue, restore equipment quantity
      if (loan.status === 'Active' || loan.status === 'Overdue') {
        const eqId = loan.equipment_id;
        const qty = loan.quantity || 1;
        if (eqId) {
          await pool.query(
            `UPDATE equipment 
             SET available_quantity = available_quantity + $1, 
                 issued_quantity = GREATEST(0, issued_quantity - $1), 
                 updated_at = NOW() 
             WHERE id = $2;`,
            [qty, eqId]
          );
        }
      }

      await pool.query('DELETE FROM loans WHERE id = $1;', [loanId]);
      return loan;
    }
    const data = readFallbackData();
    const idx = data.loans.findIndex(l => l.id === loanId);
    if (idx !== -1) {
      const [removed] = data.loans.splice(idx, 1);
      if (removed.status === 'Active' || removed.status === 'Overdue') {
        const eq = data.equipment.find(e => e.id === removed.equipmentId);
        if (eq) {
          eq.availableQuantity = (eq.availableQuantity || 0) + (removed.quantity || 1);
          eq.issuedQuantity = Math.max(0, (eq.issuedQuantity || 0) - (removed.quantity || 1));
        }
      }
      writeFallbackData(data);
      return removed;
    }
    return null;
  }
};

export const dbAttendance = {
  async getSessions() {
    if (isPgConnected) {
      const res = await pool.query(
        `SELECT s.id, s.date, s.sport, s.session_time as "sessionType", s.notes, s.updated_at as "updatedAt",
                COUNT(r.id) as total,
                COUNT(CASE WHEN r.status = 'Present' THEN 1 END) as present,
                COUNT(CASE WHEN r.status = 'Absent' THEN 1 END) as absent,
                COUNT(CASE WHEN r.status = 'Late' THEN 1 END) as late,
                COUNT(CASE WHEN r.status = 'Excused' THEN 1 END) as excused
         FROM attendance_sessions s
         LEFT JOIN attendance_records r ON s.id = r.session_id
         GROUP BY s.id
         ORDER BY s.date DESC;`
      );
      return res.rows.map(r => ({
        ...r,
        total: parseInt(r.total, 10),
        present: parseInt(r.present, 10),
        absent: parseInt(r.absent, 10),
        late: parseInt(r.late, 10),
        excused: parseInt(r.excused, 10)
      }));
    }
    const data = readFallbackData();
    return (data.attendance || []).map(s => {
      const recordList = s.records 
        ? (Array.isArray(s.records) ? s.records : Object.values(s.records)) 
        : [];
      return {
        id: s.id,
        date: s.date,
        sport: s.sport,
        sessionType: s.sessionType,
        total: recordList.length,
        present: recordList.filter(r => r && r.status === 'Present').length,
        absent: recordList.filter(r => r && r.status === 'Absent').length,
        late: recordList.filter(r => r && r.status === 'Late').length,
        excused: recordList.filter(r => r && r.status === 'Excused').length,
        updatedAt: s.updatedAt
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getSession(date, sport) {
    if (isPgConnected) {
      const sessionRes = await pool.query(
        `SELECT * FROM attendance_sessions WHERE date = $1 AND LOWER(sport) = LOWER($2);`,
        [date, sport]
      );
      if (sessionRes.rows.length === 0) return null;
      const s = sessionRes.rows[0];

      const recordsRes = await pool.query(
        `SELECT student_id, status, remark FROM attendance_records WHERE session_id = $1;`,
        [s.id]
      );
      const records = {};
      recordsRes.rows.forEach(r => {
        records[r.student_id] = { status: r.status, notes: r.remark || '' };
      });

      return {
        id: s.id,
        date: s.date,
        sport: s.sport,
        sessionType: s.session_time,
        records
      };
    }
    const data = readFallbackData();
    return data.attendance.find(s => 
      (!date || s.date === date) && 
      (!sport || s.sport.toLowerCase() === sport.toLowerCase())
    ) || null;
  },

  async saveSession(sessionObj) {
    const { id, date, sport, sessionType, records } = sessionObj;
    if (isPgConnected) {
      await pool.query(
        `INSERT INTO attendance_sessions (id, date, sport, session_time, notes, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (date, sport, session_time)
         DO UPDATE SET notes = EXCLUDED.notes, updated_at = NOW();`,
        [id, date, sport, sessionType || 'Evening Practice', '']
      );

      // Insert/update records
      if (records) {
        for (const [studentId, rec] of Object.entries(records)) {
          const recId = `${id}-${studentId}`;
          await pool.query(
            `INSERT INTO attendance_records (id, session_id, student_id, status, remark)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (session_id, student_id)
             DO UPDATE SET status = EXCLUDED.status, remark = EXCLUDED.remark, updated_at = NOW();`,
            [recId, id, studentId, rec.status || 'Present', rec.notes || '']
          );
        }
      }
      return sessionObj;
    }
    const data = readFallbackData();
    const existingIndex = data.attendance.findIndex(s => 
      s.date === date && s.sport.toLowerCase() === sport.toLowerCase()
    );
    if (existingIndex >= 0) {
      data.attendance[existingIndex] = sessionObj;
    } else {
      data.attendance.push(sessionObj);
    }
    writeFallbackData(data);
    return sessionObj;
  },

  async getStudentHistory(studentId) {
    if (isPgConnected) {
      const res = await pool.query(
        `SELECT r.status, r.remark as notes, TO_CHAR(s.date, 'YYYY-MM-DD') as date, s.sport, s.session_time as "sessionType"
         FROM attendance_records r
         JOIN attendance_sessions s ON r.session_id = s.id
         WHERE r.student_id = $1 AND r.status != 'Unmarked'
         ORDER BY s.date DESC;`,
        [studentId]
      );
      return res.rows;
    }
    const data = readFallbackData();
    const history = [];
    (data.attendance || []).forEach(s => {
      if (s.records && s.records[studentId]) {
        const rec = s.records[studentId];
        if (rec && rec.status && rec.status !== 'Unmarked') {
          history.push({
            date: s.date,
            sport: s.sport,
            sessionType: s.sessionType || 'Evening Practice',
            status: rec.status,
            notes: rec.notes || ''
          });
        }
      }
    });
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
};

export const dbGatePasses = {
  async getAll() {
    if (isPgConnected) {
      try {
        const res = await pool.query('SELECT * FROM day_scholar_passes ORDER BY created_at DESC;');
        return res.rows.map(r => ({
          id: r.id || r.pass_code,
          passCode: r.pass_code || r.id,
          gateLocation: r.gate_location || r.gate_number || 'Main Campus Security Gate',
          guardName: r.guard_name || 'Main Gate Security',
          guardPhone: r.guard_phone || '',
          status: r.status || 'Authorized',
          authorizedBy: r.authorized_by || r.issued_by || 'Sports Coach',
          notes: r.notes || '',
          date: r.date || (r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          students: typeof (r.authorized_students || r.students) === 'string'
            ? JSON.parse(r.authorized_students || r.students)
            : (r.authorized_students || r.students || []),
          createdAt: r.created_at || new Date().toISOString()
        }));
      } catch (err) {
        console.warn('PostgreSQL getAll passes error, using fallback:', err.message);
      }
    }
    const data = readFallbackData();
    return (data.gatePasses || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(pass) {
    if (isPgConnected) {
      try {
        // Query information_schema to see which columns actually exist in day_scholar_passes
        const colRes = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'day_scholar_passes';
        `);
        const existingCols = new Set(colRes.rows.map(r => r.column_name));

        const passDataMap = {
          id: pass.id,
          pass_code: pass.id,
          gate_number: pass.gateLocation || 'Main Campus Security Gate',
          gate_location: pass.gateLocation || 'Main Campus Security Gate',
          guard_name: pass.guardName || 'Main Gate Security',
          guard_phone: pass.guardPhone || '',
          status: pass.status || 'Authorized',
          issued_by: pass.authorizedBy || 'Sports Coach',
          authorized_by: pass.authorizedBy || 'Sports Coach',
          authorized_students: JSON.stringify(pass.students || []),
          students: JSON.stringify(pass.students || []),
          notes: pass.notes || '',
          date: pass.date || new Date().toISOString().split('T')[0],
          created_at: pass.createdAt || new Date().toISOString()
        };

        // Filter only columns that physically exist in the database table
        const insertCols = Object.keys(passDataMap).filter(col => existingCols.has(col));
        if (insertCols.length > 0) {
          const insertVals = insertCols.map(col => passDataMap[col]);
          const placeholders = insertCols.map((_, i) => `$${i + 1}`);

          const insertSql = `INSERT INTO day_scholar_passes (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *;`;
          const res = await pool.query(insertSql, insertVals);
          const r = res.rows[0];

          return {
            id: r.id || r.pass_code || pass.id,
            passCode: r.pass_code || r.id || pass.id,
            gateLocation: r.gate_location || r.gate_number || pass.gateLocation,
            guardName: r.guard_name || pass.guardName,
            guardPhone: r.guard_phone || pass.guardPhone,
            status: r.status || pass.status,
            authorizedBy: r.authorized_by || r.issued_by || pass.authorizedBy,
            notes: r.notes || pass.notes,
            date: r.date || pass.date,
            students: typeof (r.authorized_students || r.students) === 'string'
              ? JSON.parse(r.authorized_students || r.students)
              : (r.authorized_students || r.students || pass.students || []),
            createdAt: r.created_at || pass.createdAt
          };
        }
      } catch (err) {
        console.error('PostgreSQL create gate pass error, writing to fallback:', err.message);
      }
    }

    // Fallback JSON persistence (ensures zero downtime even if database query fails)
    const data = readFallbackData();
    if (!data.gatePasses) data.gatePasses = [];
    data.gatePasses.unshift(pass);
    writeFallbackData(data);
    return pass;
  },

  async delete(passId) {
    if (isPgConnected) {
      try {
        await pool.query('DELETE FROM day_scholar_passes WHERE id = $1 OR pass_code = $1;', [passId]);
        return true;
      } catch (err) {
        console.warn('PostgreSQL delete gate pass error, falling back:', err.message);
      }
    }
    const data = readFallbackData();
    const idx = (data.gatePasses || []).findIndex(p => p.id === passId || p.passCode === passId);
    if (idx !== -1) {
      data.gatePasses.splice(idx, 1);
      writeFallbackData(data);
    }
    return true;
  }
};

export const dbHostelPermissions = {
  async getAll() {
    if (isPgConnected) {
      try {
        const res = await pool.query('SELECT * FROM hostel_permissions ORDER BY created_at DESC;');
        return res.rows.map(r => ({
          id: r.id,
          permissionCode: r.permission_code || r.id,
          wardenName: r.warden_name || '',
          wardenPhone: r.warden_phone || '',
          hostelName: r.hostel_name || '',
          fromDate: r.from_date || '',
          toDate: r.to_date || '',
          fromTime: r.from_time || '',
          toTime: r.to_time || '',
          venue: r.venue || '',
          purpose: r.purpose || '',
          authorizedBy: r.authorized_by || 'APEX Sports Officer / Coach',
          notes: r.notes || '',
          players: typeof r.players === 'string' ? JSON.parse(r.players) : (r.players || []),
          status: r.status || 'Approved',
          pdfUrl: r.pdf_url || null,
          createdAt: r.created_at || new Date().toISOString()
        }));
      } catch (err) {
        console.warn('PostgreSQL getAll hostel_permissions error, using fallback:', err.message);
      }
    }
    const data = readFallbackData();
    return (data.hostelPermissions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(permission) {
    if (isPgConnected) {
      try {
        const sql = `
          INSERT INTO hostel_permissions (
            id, permission_code, warden_name, warden_phone, hostel_name, 
            from_date, to_date, from_time, to_time, venue, purpose, 
            authorized_by, notes, players, status, pdf_url, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING *;
        `;
        const vals = [
          permission.id,
          permission.permissionCode || permission.id,
          permission.wardenName || '',
          permission.wardenPhone || '',
          permission.hostelName || '',
          permission.fromDate || '',
          permission.toDate || '',
          permission.fromTime || '',
          permission.toTime || '',
          permission.venue || '',
          permission.purpose || '',
          permission.authorizedBy || 'APEX Sports Officer / Coach',
          permission.notes || '',
          JSON.stringify(permission.players || []),
          permission.status || 'Approved',
          permission.pdfUrl || null,
          permission.createdAt || new Date().toISOString()
        ];
        const res = await pool.query(sql, vals);
        const r = res.rows[0];
        return {
          id: r.id,
          permissionCode: r.permission_code || r.id,
          wardenName: r.warden_name,
          wardenPhone: r.warden_phone,
          hostelName: r.hostel_name,
          fromDate: r.from_date,
          toDate: r.to_date,
          fromTime: r.from_time,
          toTime: r.to_time,
          venue: r.venue,
          purpose: r.purpose,
          authorizedBy: r.authorized_by,
          notes: r.notes,
          players: typeof r.players === 'string' ? JSON.parse(r.players) : (r.players || []),
          status: r.status,
          pdfUrl: r.pdf_url,
          createdAt: r.created_at
        };
      } catch (err) {
        console.error('PostgreSQL create hostel permission error, writing to fallback:', err.message);
      }
    }

    const data = readFallbackData();
    if (!data.hostelPermissions) data.hostelPermissions = [];
    data.hostelPermissions.unshift(permission);
    writeFallbackData(data);
    return permission;
  },

  async delete(permissionId) {
    if (isPgConnected) {
      try {
        await pool.query('DELETE FROM hostel_permissions WHERE id = $1 OR permission_code = $1;', [permissionId]);
        return true;
      } catch (err) {
        console.warn('PostgreSQL delete hostel permission error, falling back:', err.message);
      }
    }
    const data = readFallbackData();
    const idx = (data.hostelPermissions || []).findIndex(p => p.id === permissionId || p.permissionCode === permissionId);
    if (idx !== -1) {
      data.hostelPermissions.splice(idx, 1);
      writeFallbackData(data);
    }
    return true;
  }
};

