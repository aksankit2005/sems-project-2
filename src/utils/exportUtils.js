// Universal Data Exporter utility for CSV, Excel-ready tables, and Print

export function downloadCSV(filename, headers, rows) {
  // Format headers
  const headerLine = headers.map(h => `"${(h || '').replace(/"/g, '""')}"`).join(',');
  
  // Format rows
  const rowLines = rows.map(row => 
    row.map(val => {
      const strVal = val === null || val === undefined ? '' : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Attendance Session
export function exportAttendanceCSV(sessionDate, sport, sessionType, students, attendanceRecords) {
  const headers = [
    'Date',
    'Sport Discipline',
    'Session Timing',
    'Student Name',
    'Roll Number',
    'Residency',
    'Hostel Name',
    'Room Number',
    'Gender',
    'Attendance Status',
    'Arrival Time',
    'Excuse Reason / Notes',
    'Lifetime Attendance %'
  ];

  const rows = students.map(student => {
    const rec = attendanceRecords[student.id] || { status: 'Present' };
    const stats = student.attendanceStats || { attendancePct: 100 };
    return [
      sessionDate,
      sport,
      sessionType,
      student.name,
      student.rollNumber,
      student.residency,
      student.hostelName || 'N/A',
      student.roomNumber || 'N/A',
      student.gender,
      rec.status || 'Present',
      rec.arrivalTime || (rec.status === 'Present' ? 'On Time' : '—'),
      rec.excuseReason || rec.notes || '—',
      `${stats.attendancePct}%`
    ];
  });

  downloadCSV(`MPGI_Attendance_${sport.replace(/\s+/g, '_')}_${sessionDate}`, headers, rows);
}

// Export Issued Equipment Ledger
export function exportLoansCSV(loans) {
  const headers = [
    'Loan ID',
    'Equipment Item(s)',
    'Total Units',
    'Borrower Full Name',
    'Student / Roll ID',
    'Residency',
    'Hostel Name',
    'Room Number',
    'Phone Contact',
    'Issued Timestamp',
    'Expected Return Deadline',
    'Loan Status',
    'Returned At',
    'Verified Condition',
    'Notes / Remarks'
  ];

  const rows = loans.map(loan => [
    loan.id,
    loan.equipmentName,
    loan.quantity,
    loan.studentName,
    loan.studentId,
    loan.residency || 'Hosteller',
    loan.hostelName || 'Hostel',
    loan.roomNumber || 'N/A',
    loan.phone ? `+91 ${loan.phone}` : 'N/A',
    new Date(loan.issuedAt).toLocaleString('en-IN'),
    loan.isFlexibleReturn || loan.expectedReturn === 'Open / Flexible' 
      ? 'Open / Flexible (जब मन हो)' 
      : new Date(loan.expectedReturn).toLocaleString('en-IN'),
    loan.status,
    loan.returnedAt ? new Date(loan.returnedAt).toLocaleString('en-IN') : 'Not Returned',
    loan.returnCondition || 'Pending Return',
    loan.notes || '—'
  ]);

  downloadCSV('MPGI_Sports_Equipment_Issued_Ledger', headers, rows);
}

// Export Inventory Stock Catalog
export function exportInventoryCSV(equipmentList) {
  const headers = [
    'Equipment ID',
    'Equipment Name',
    'Sport Discipline',
    'Category',
    'Total Stock Units',
    'Available in Store',
    'Currently Issued',
    'Availability %',
    'Physical Condition',
    'Store Location / Locker'
  ];

  const rows = equipmentList.map(item => {
    const availPct = Math.round(((item.availableQuantity || 0) / (item.totalQuantity || 1)) * 100);
    return [
      item.id,
      item.name,
      item.sport,
      item.category,
      item.totalQuantity,
      item.availableQuantity,
      item.issuedQuantity,
      `${availPct}%`,
      item.condition,
      item.location || 'Sports Store Room'
    ];
  });

  downloadCSV('MPGI_Sports_Equipment_Master_Inventory', headers, rows);
}

// Export Students Directory
export function exportStudentsCSV(students) {
  const headers = [
    'Student ID',
    'Student Name',
    'Roll Number',
    'College / Institute',
    'Residency Type',
    'Hostel Block / Bhavan',
    'Room Number',
    'Gender',
    'Phone Contact',
    'Sports Participated',
    'Total Sessions Recorded',
    'Sessions Attended',
    'Days Absent',
    'Days Late',
    'Days Excused',
    'Overall Attendance %'
  ];

  const rows = students.map(s => {
    const stats = s.attendanceStats || { total: 0, attended: 0, absent: 0, late: 0, excused: 0, attendancePct: 100 };
    return [
      s.id,
      s.name,
      s.rollNumber,
      s.college || 'MPGI',
      s.residency,
      s.hostelName || 'N/A',
      s.roomNumber || 'N/A',
      s.gender,
      s.phone ? `+91 ${s.phone}` : 'N/A',
      (s.sports || []).join('; '),
      stats.total,
      stats.attended,
      stats.absent,
      stats.late,
      stats.excused,
      `${stats.attendancePct}%`
    ];
  });

  downloadCSV('MPGI_Hostel_Sports_Students_Roster', headers, rows);
}
