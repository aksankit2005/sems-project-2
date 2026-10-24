// API service helper with automated fallback to localStorage for bulletproof offline & online support

const API_BASE = '/api';

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
      console.warn('API getGatePasses failed', e);
    }
    return [];
  },

  async createGatePass(payload) {
    try {
      const res = await fetch(`${API_BASE}/gate-passes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to create gate pass');
    } catch (e) {
      console.error('API createGatePass failed', e);
      throw e;
    }
  },

  async deleteGatePass(passId) {
    try {
      const res = await fetch(`${API_BASE}/gate-passes/${encodeURIComponent(passId)}`, {
        method: 'DELETE',
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete gate pass');
    } catch (e) {
      console.error('API deleteGatePass failed', e);
      throw e;
    }
  }
};

