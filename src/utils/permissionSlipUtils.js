// Utility for generating official printable & shareable Hostel Sports Permission Slips and WhatsApp messages

export function formatWardenWhatsAppMessage(pass) {
  const players = pass.players || [];
  const playerListText = players.map((p, idx) => 
    `  ${idx + 1}. *${p.name}* | ${p.year} | ${p.hostelName || pass.hostelName || 'Hostel'}, Room: ${p.roomNumber || 'N/A'}`
  ).join('\n');

  return `🏛️ *MAHARANA PRATAP GROUP OF INSTITUTIONS (MPGI)*
🏆 *APEX SPORTS FESTIVAL 2026 - HOSTEL OUTING PERMISSION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Pass Reference:* ${pass.permissionCode || pass.id}
👮 *To Respected Warden:* ${pass.wardenName || 'Hostel Warden'} (${pass.hostelName || 'Hostel'})

The following *${players.length} Hosteller Player(s)* are officially authorized by the APEX Sports Department for match/training duty:

📅 *Permission Date(s):* ${pass.fromDate} ${pass.toDate && pass.toDate !== pass.fromDate ? `to ${pass.toDate}` : ''}
⏰ *Permitted Timings:* ${pass.fromTime} - ${pass.toTime}
📍 *Match / Venue:* ${pass.venue}
🎯 *Event / Purpose:* ${pass.purpose || 'Official Sports Practice / Tournament'}

*AUTHORIZED PLAYERS ROSTER:*
${playerListText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Authorized By:* ${pass.authorizedBy || 'APEX Sports Officer / Coach'}
📞 *Sports Control Room:* +91 98765 43210
⚠️ *Note to Warden & Guard:* Players must report back to hostel premises immediately after the match timing.`;
}

export function openWardenWhatsApp(pass) {
  const cleanPhone = (pass.wardenPhone || '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    throw new Error('Please provide a valid 10-digit Warden WhatsApp phone number');
  }
  const fullNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = formatWardenWhatsAppMessage(pass);
  const url = `https://api.whatsapp.com/send?phone=${fullNumber}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

export function generateHostelPermissionSlipHTML(pass) {
  const players = pass.players || [];
  const issuedDateStr = new Date(pass.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const playerRows = players.map((p, idx) => `
    <tr>
      <td style="padding: 9px 12px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; width: 45px;">${idx + 1}</td>
      <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 700; color: #0f172a;">${p.name}</td>
      <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #334155; text-align: center;">${p.year || '—'}</td>
      <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #334155;">${p.hostelName || pass.hostelName || 'Hostel'}</td>
      <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700; text-align: center;">${p.roomNumber || '—'}</td>
      <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #64748b; text-align: center; font-size: 11px;">[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hostel Sports Permission Slip - ${pass.permissionCode || pass.id}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.4;
    }
    .slip-container {
      border: 2px solid #7156a5;
      border-radius: 14px;
      padding: 24px 28px;
      position: relative;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .slip-container::before {
      content: "";
      position: absolute;
      inset: 4px;
      border: 1px dashed #d8b4fe;
      border-radius: 10px;
      pointer-events: none;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #7156a5;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-badge {
      width: 54px;
      height: 54px;
      background: linear-gradient(135deg, #7156a5, #d97706);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 24px;
      box-shadow: 0 4px 10px rgba(113,86,165,0.3);
    }
    .title-area h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .title-area h2 {
      margin: 2px 0 0;
      font-size: 13px;
      font-weight: 700;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .title-area p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #64748b;
    }
    .pass-tag {
      text-align: right;
    }
    .pass-tag .code {
      display: inline-block;
      background: #f3e8ff;
      color: #6b21a8;
      border: 1.5px solid #c084fc;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .pass-tag .timestamp {
      margin-top: 4px;
      font-size: 10px;
      color: #64748b;
    }
    .banner-title {
      background: linear-gradient(90deg, #7156a5, #9333ea);
      color: #ffffff;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .grid-details {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 18px;
      font-size: 12px;
    }
    .detail-item {
      display: flex;
      margin-bottom: 6px;
    }
    .detail-item:last-child {
      margin-bottom: 0;
    }
    .detail-label {
      font-weight: 700;
      color: #475569;
      width: 130px;
      flex-shrink: 0;
    }
    .detail-value {
      color: #0f172a;
      font-weight: 600;
    }
    .table-title {
      font-size: 12px;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 18px;
    }
    thead th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      padding: 9px 12px;
      border: 1px solid #cbd5e1;
    }
    .rules-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 11px;
      color: #92400e;
      margin-bottom: 24px;
      line-height: 1.45;
    }
    .signatures-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-top: 30px;
      padding-top: 10px;
    }
    .sign-block {
      text-align: center;
      border-top: 1.5px dashed #94a3b8;
      padding-top: 8px;
    }
    .sign-title {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
    }
    .sign-subtitle {
      font-size: 10px;
      color: #64748b;
    }
    .footer-stamp {
      margin-top: 18px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <div class="slip-container">
    
    <!-- Header -->
    <div class="header">
      <div class="logo-area">
        <div class="logo-badge">APEX</div>
        <div class="title-area">
          <h1>Maharana Pratap Group of Institutions</h1>
          <h2>Sports Council & Hostel Administration</h2>
          <p>Official Sports Practice & Tournament Outing Authorization</p>
        </div>
      </div>
      <div class="pass-tag">
        <div class="code">${pass.permissionCode || pass.id}</div>
        <div class="timestamp">Issued: ${issuedDateStr}</div>
      </div>
    </div>

    <!-- Banner -->
    <div class="banner-title">
      Hosteller Player Outing & Sports Permission Slip
    </div>

    <!-- Key Event & Authority Details -->
    <div class="grid-details">
      <div>
        <div class="detail-item">
          <span class="detail-label">Permission Date(s):</span>
          <span class="detail-value" style="color: #6b21a8; font-weight: 800;">
            ${pass.fromDate} ${pass.toDate && pass.toDate !== pass.fromDate ? `to ${pass.toDate}` : ''}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Permitted Hours:</span>
          <span class="detail-value" style="color: #b45309; font-weight: 800;">
            ${pass.fromTime} - ${pass.toTime}
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Designated Venue:</span>
          <span class="detail-value">${pass.venue || 'Campus Sports Ground'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Purpose / Event:</span>
          <span class="detail-value">${pass.purpose || 'Official Sports Training / Tournament'}</span>
        </div>
      </div>
      <div>
        <div class="detail-item">
          <span class="detail-label">To Warden:</span>
          <span class="detail-value">${pass.wardenName || 'Hostel Warden'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Hostel Name:</span>
          <span class="detail-value">${pass.hostelName || 'Hostel'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Warden Phone:</span>
          <span class="detail-value">${pass.wardenPhone || '—'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Authorized By:</span>
          <span class="detail-value" style="color: #047857; font-weight: 800;">${pass.authorizedBy || 'Sports Coordinator'}</span>
        </div>
      </div>
    </div>

    <!-- Players Table -->
    <div class="table-title">
      <span>Authorized Hosteller Players (${players.length} Total)</span>
      <span style="font-size: 10px; color: #64748b; font-weight: normal;">*Mandatory photo ID required at security post</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th style="text-align: left;">Player Name</th>
          <th>Year / Batch</th>
          <th style="text-align: left;">Hostel</th>
          <th>Room No.</th>
          <th>Hostel In-Check</th>
        </tr>
      </thead>
      <tbody>
        ${playerRows}
      </tbody>
    </table>

    <!-- Rules & Conditions -->
    <div class="rules-box">
      <strong>⚠️ Guidelines & Terms for Hosteller Players:</strong><br/>
      1. All listed players are authorized for the specified sports activity only and must adhere to campus timings.<br/>
      2. Players must carry their official college student identity card along with this pass.<br/>
      3. All players must report back to their respective hostel rooms strictly before <strong>${pass.toTime}</strong>.
    </div>

    <!-- Official Signatures -->
    <div class="signatures-row">
      <div class="sign-block">
        <div style="height: 32px;"></div>
        <div class="sign-title">APEX Sports Officer</div>
        <div class="sign-subtitle">Issuing Sports Authority</div>
      </div>
      <div class="sign-block">
        <div style="height: 32px;"></div>
        <div class="sign-title">Main Gate Security</div>
        <div class="sign-subtitle">Out/In Gate Stamp</div>
      </div>
      <div class="sign-block">
        <div style="height: 32px;"></div>
        <div class="sign-title">Hostel Warden / In-Charge</div>
        <div class="sign-subtitle">Reporting Verification Sign</div>
      </div>
    </div>

    <div class="footer-stamp">
      Generated via MPGI APEX Sports Management System (SEMS) • Official Verification Code: ${pass.permissionCode || pass.id}
    </div>

  </div>
</body>
</html>`;
}

// Print & Direct Save-as-PDF handler
export function printPermissionSlip(pass) {
  const html = generateHostelPermissionSlipHTML(pass);
  const printWindow = window.open('', '_blank', 'width=840,height=960');
  if (!printWindow) {
    alert('Please allow popups to open and print the permission slip');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

// Share PDF/Document directly via Web Share API
export async function sharePermissionSlipFile(pass) {
  const html = generateHostelPermissionSlipHTML(pass);
  const fileName = `MPGI_Sports_Permission_${(pass.permissionCode || pass.id).replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  const file = new File([html], fileName, { type: 'text/html' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Hostel Sports Permission Slip - ${pass.permissionCode || pass.id}`,
        text: formatWardenWhatsAppMessage(pass)
      });
      return { success: true, method: 'native-share' };
    } catch (err) {
      if (err.name === 'AbortError') return { cancelled: true };
      console.warn('Native share error, falling back:', err);
    }
  }

  // Fallback: Trigger download of slip and open WhatsApp
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Also open WhatsApp with summary text
  try {
    openWardenWhatsApp(pass);
  } catch {
    // ignore if warden phone was missing
  }

  return { success: true, method: 'download-and-whatsapp' };
}
