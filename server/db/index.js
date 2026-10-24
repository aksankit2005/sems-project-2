import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration from environment variables
const poolConfig = process.env.PGPASSWORD
  ? {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'sems_db'
    }
  : (process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'postgres',
          database: 'sems_db'
        });

export const pool = new Pool(poolConfig);

let isPgConnected = false;

// Fallback JSON store (in case PostgreSQL credentials are still being configured)
const FALLBACK_DATA_FILE = path.join(__dirname, '..', 'data.json');

function readFallbackData() {
  try {
    if (!fs.existsSync(FALLBACK_DATA_FILE)) {
      return { students: [], equipment: [], loans: [], attendance: [], gatePasses: [] };
    }
    const raw = fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.gatePasses) parsed.gatePasses = [];
    return parsed;
  } catch (err) {
    return { students: [], equipment: [], loans: [], attendance: [], gatePasses: [] };
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

    // Check equipment table status
    const eqCount = await pool.query('SELECT COUNT(*) FROM equipment;');
    console.log(`📦 [PostgreSQL] Equipment inventory ready (${eqCount.rows[0].count} items).`);

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
  }
};

export const dbGatePasses = {
  async getAll() {
    if (isPgConnected) {
      const res = await pool.query('SELECT * FROM day_scholar_passes ORDER BY created_at DESC;');
      return res.rows.map(r => ({
        id: r.id,
        passCode: r.pass_code,
        gateLocation: r.gate_number,
        guardPhone: r.guard_phone,
        status: r.status,
        authorizedBy: r.issued_by,
        students: typeof r.authorized_students === 'string' ? JSON.parse(r.authorized_students) : (r.authorized_students || []),
        createdAt: r.created_at,
        date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : ''
      }));
    }
    const data = readFallbackData();
    return (data.gatePasses || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(pass) {
    if (isPgConnected) {
      const res = await pool.query(
        `INSERT INTO day_scholar_passes (id, pass_code, gate_number, guard_phone, status, issued_by, authorized_students)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
        [
          pass.id,
          pass.id,
          pass.gateLocation || 'Main Campus Security Gate',
          pass.guardPhone || '',
          pass.status || 'Authorized',
          pass.authorizedBy || 'Sports Coach',
          JSON.stringify(pass.students || [])
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        gateLocation: r.gate_number,
        guardPhone: r.guard_phone,
        status: r.status,
        authorizedBy: r.issued_by,
        students: typeof r.authorized_students === 'string' ? JSON.parse(r.authorized_students) : (r.authorized_students || []),
        createdAt: r.created_at,
        date: pass.date
      };
    }
    const data = readFallbackData();
    if (!data.gatePasses) data.gatePasses = [];
    data.gatePasses.unshift(pass);
    writeFallbackData(data);
    return pass;
  },

  async delete(passId) {
    if (isPgConnected) {
      await pool.query('DELETE FROM day_scholar_passes WHERE id = $1;', [passId]);
      return true;
    }
    const data = readFallbackData();
    const idx = (data.gatePasses || []).findIndex(p => p.id === passId);
    if (idx !== -1) {
      data.gatePasses.splice(idx, 1);
      writeFallbackData(data);
    }
    return true;
  }
};
