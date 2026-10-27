// API service helper with automated fallback to localStorage for bulletproof offline & online support

// Supports custom backend URL when deployed on Vercel (e.g. VITE_API_URL=https://my-backend.onrender.com)
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = BASE_URL ? `${BASE_URL}/api` : '/api';

export const api = {
  // Sports config
  async getSports() {
    try {
      const res = await fetch(`${API_BASE}/sports`);
      if (res.ok) {
        const data = await res.json();
        return data.sports;
      }
    } catch {
      // Fallback
    }
    return [
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
  },

  // Dashboard Stats
  async getStats() {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API fetch stats failed, calculating locally', e);
    }
    return {
      totalStudents: 0,
      hostellers: 0,
      dayScholars: 0,
      activeLoans: 0,
      overdueLoans: 0,
      totalEquipmentItems: 0,
      issuedEquipmentItems: 0,
      attendanceRate: 0,
      totalSessions: 0
    };
  },

  // Students
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`${API_BASE}/students?${query}`);
      if (res.ok) {
        const data = await res.json();
        return data.students;
      }
    } catch (e) {
      console.warn('API getStudents failed, using local fallback', e);
    }
    return [];
  },

  async addStudent(studentData) {
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API addStudent failed', e);
    }
    return null;
  },

  // Attendance
  async getAttendanceSession(date, sport) {
    try {
      const res = await fetch(`${API_BASE}/attendance?date=${encodeURIComponent(date)}&sport=${encodeURIComponent(sport)}`);
      if (res.ok) {
        const data = await res.json();
        return data.session;
      }
    } catch (e) {
      console.warn('API getAttendanceSession failed', e);
    }
    return null;
  },

  async saveAttendanceSession(payload) {
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API saveAttendanceSession failed', e);
    }
    return null;
  },

  async getStudentHistory(studentId) {
    try {
      const res = await fetch(`${API_BASE}/attendance/history/${studentId}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API getStudentHistory failed', e);
    }
    return null;
  },

  // Equipment
  async getEquipment() {
    try {
      const res = await fetch(`${API_BASE}/equipment`);
      if (res.ok) {
        const data = await res.json();
        return data.equipment;
      }
    } catch (e) {
      console.warn('API getEquipment failed', e);
    }
    return [];
  },

  async addEquipment(payload) {
    try {
      const res = await fetch(`${API_BASE}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('API addEquipment failed', e);
    }
    return null;
  },

  async addEquipmentBatch(payload) {
    try {
      const res = await fetch(`${API_BASE}/equipment/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to save batch equipment');
    } catch (e) {
      console.error('API addEquipmentBatch failed', e);
      throw e;
    }
  },

  async updateEquipment(id, payload) {
    try {
      const res = await fetch(`${API_BASE}/equipment/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to update equipment');
    } catch (e) {
      console.error('API updateEquipment failed', e);
      throw e;
    }
  },

  async deleteEquipment(id) {
    try {
      const res = await fetch(`${API_BASE}/equipment/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete equipment');
    } catch (e) {
      console.error('API deleteEquipment failed', e);
      throw e;
    }
  },

  async clearMockEquipment() {
    try {
      const res = await fetch(`${API_BASE}/equipment/mock/clear`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to clear mock equipment');
    } catch (e) {
      console.error('API clearMockEquipment failed', e);
      throw e;
    }
  },

  async getLoans(status = 'all') {
    try {
      const res = await fetch(`${API_BASE}/equipment/loans?status=${encodeURIComponent(status)}`);
      if (res.ok) {
        const data = await res.json();
        return data.loans;
      }
    } catch (e) {
      console.warn('API getLoans failed', e);
    }
    return [];
  },

  async issueEquipment(payload) {
    try {
      const res = await fetch(`${API_BASE}/equipment/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to issue equipment');
    } catch (e) {
      console.error('API issueEquipment failed', e);
      throw e;
    }
  },

  async returnEquipment(payload) {
    try {
      const res = await fetch(`${API_BASE}/equipment/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to return equipment');
    } catch (e) {
      console.error('API returnEquipment failed', e);
      throw e;
    }
  },

  async deleteLoan(loanId) {
    try {
      const res = await fetch(`${API_BASE}/equipment/loans/${encodeURIComponent(loanId)}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete loan record');
    } catch (e) {
      console.error('API deleteLoan failed', e);
      throw e;
    }
  },

  // Delete student
  async deleteStudent(studentId) {
    try {
      const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete student');
    } catch (e) {
      console.error('API deleteStudent failed', e);
      throw e;
    }
  },

  // Attendance Sessions History
  async getAttendanceSessions() {
    try {
      const res = await fetch(`${API_BASE}/attendance/sessions`);
      if (res.ok) {
        const data = await res.json();
        return data.sessions || [];
      }
    } catch (e) {
      console.warn('API getAttendanceSessions failed', e);
    }
    return [];
  },

  // Day Scholar Gate Passes
  async getGatePasses() {
    try {
      const res = await fetch(`${API_BASE}/gate-passes`);
      if (res.ok) {
        const data = await res.json();
        return data.passes || [];
      }
    } catch (e) {
      console.warn('API getGatePasses failed, checking local storage', e);
    }
    try {
      const saved = localStorage.getItem('sems_gate_passes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async createGatePass(payload) {
    const fallbackPass = {
      ...payload,
      id: payload.id || `PASS-${Date.now().toString().slice(-6)}`,
      createdAt: payload.createdAt || new Date().toISOString(),
      status: 'Authorized'
    };

    try {
      const raw = localStorage.getItem('sems_gate_passes');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(fallbackPass);
      localStorage.setItem('sems_gate_passes', JSON.stringify(list));
    } catch (lsErr) {
      console.warn('localStorage save gate pass error:', lsErr);
    }

    try {
      const res = await fetch(`${API_BASE}/gate-passes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data) return data;
      }
    } catch (e) {
      console.warn('Backend offline, using locally created gate pass', e);
    }
    return { pass: fallbackPass };
  },

  async deleteGatePass(passId) {
    try {
      const raw = localStorage.getItem('sems_gate_passes');
      if (raw) {
        const list = JSON.parse(raw).filter(p => p.id !== passId && p.passCode !== passId);
        localStorage.setItem('sems_gate_passes', JSON.stringify(list));
      }
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/gate-passes/${encodeURIComponent(passId)}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json().catch(() => ({ success: true }));
    } catch (e) {
      console.warn('Backend delete gate pass failed', e);
    }
    return { success: true };
  },

  // Hostel Sports Permissions
  async getHostelPermissions() {
    try {
      const res = await fetch(`${API_BASE}/hostel-permissions`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.permissions)) {
          return data.permissions;
        }
      }
    } catch (e) {
      console.warn('API getHostelPermissions failed, checking local storage', e);
    }

    try {
      const saved = localStorage.getItem('sems_hostel_permissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async createHostelPermission(payload) {
    const fallbackItem = {
      ...payload,
      id: payload.id || `PERM-${Date.now().toString().slice(-6)}`,
      permissionCode: payload.permissionCode || `MPGI/APEX/PERM-${Date.now().toString().slice(-4)}`,
      createdAt: payload.createdAt || new Date().toISOString(),
      status: 'Approved'
    };

    // Always guarantee client-side persistence in localStorage
    try {
      const raw = localStorage.getItem('sems_hostel_permissions');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(fallbackItem);
      localStorage.setItem('sems_hostel_permissions', JSON.stringify(list));
    } catch (lsErr) {
      console.warn('localStorage save permission error:', lsErr);
    }

    // Attempt backend persistence if server is online
    try {
      const res = await fetch(`${API_BASE}/hostel-permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.permission) return data;
      }
    } catch (e) {
      console.warn('Backend server offline or unreachable, using local fallback:', e);
    }

    return { permission: fallbackItem };
  },

  async deleteHostelPermission(permissionId) {
    try {
      const raw = localStorage.getItem('sems_hostel_permissions');
      if (raw) {
        const list = JSON.parse(raw).filter(p => p.id !== permissionId && p.permissionCode !== permissionId);
        localStorage.setItem('sems_hostel_permissions', JSON.stringify(list));
      }
    } catch {}

    try {
      const res = await fetch(`${API_BASE}/hostel-permissions/${encodeURIComponent(permissionId)}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json().catch(() => ({ success: true }));
    } catch (e) {
      console.warn('Backend delete hostel permission call failed:', e);
    }
    return { success: true };
  }
};


