/**
 * ═══════════════════════════════════════════════════════════════════
 *  Lincoln's 6th Birthday RSVP — Google Apps Script Backend
 * ═══════════════════════════════════════════════════════════════════
 *
 *  SETUP INSTRUCTIONS:
 *  1. Go to https://script.google.com and create a new project
 *  2. Paste this entire file into the editor
 *  3. Update SHEET_NAME below if needed
 *  4. Click Deploy > New Deployment
 *     - Type: Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Authorize the app when prompted
 *  6. Copy the Web App URL into your .env.local file
 *
 *  SHEET COLUMNS (auto-created on first submission):
 *  Timestamp | Parent Name | Phone | Email | Child Name |
 *  Adults | Children | Attendance | Notes
 * ═══════════════════════════════════════════════════════════════════
 */

const SHEET_NAME = 'RSVPs';
const ALLOWED_ORIGIN = '*'; // Restrict to your domain in production

// ─── Handle POST (new RSVP submission) ───────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.parentName || !data.phone || !data.childName) {
      return jsonResponse({ success: false, error: 'Missing required fields' }, 400);
    }

    const sheet = getOrCreateSheet();

    // Auto-create header row on first use
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Parent Name',
        'Phone',
        'Email',
        'Child Name',
        'Adults',
        'Children',
        'Attendance',
        'Notes'
      ]);
      // Style the header row
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground('#0F172A');
      headerRange.setFontColor('#F59E0B');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    // Append the new RSVP row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      sanitize(data.parentName),
      sanitize(data.phone),
      sanitize(data.email || '—'),
      sanitize(data.childName),
      parseInt(data.adults) || 0,
      parseInt(data.children) || 0,
      sanitize(data.attendance),
      sanitize(data.notes || '—')
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 9);

    return jsonResponse({
      success: true,
      message: 'RSVP saved successfully',
      row: sheet.getLastRow()
    });

  } catch (err) {
    console.error('doPost error:', err.message);
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// ─── Handle GET (fetch all RSVPs for admin dashboard) ────────────────────────
function doGet(e) {
  try {
    const action = e.parameter && e.parameter.action;

    if (action === 'getRSVPs') {
      const sheet = getOrCreateSheet();
      const lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return jsonResponse({ success: true, rsvps: [], total: 0 });
      }

      // Get all data rows (skip header)
      const rows = sheet.getRange(2, 1, lastRow - 1, 9).getValues();

      const rsvps = rows.map(r => ({
        timestamp:   r[0],
        parentName:  r[1],
        phone:       r[2],
        email:       r[3],
        childName:   r[4],
        adults:      r[5],
        children:    r[6],
        attendance:  r[7],
        notes:       r[8]
      })).filter(r => r.parentName); // Filter out empty rows

      // Compute summary stats
      const attending = rsvps.filter(r => r.attendance === 'attending');
      const stats = {
        total:         rsvps.length,
        attending:     attending.length,
        notAttending:  rsvps.length - attending.length,
        totalAdults:   attending.reduce((s, r) => s + Number(r.adults), 0),
        totalChildren: attending.reduce((s, r) => s + Number(r.children), 0),
      };

      return jsonResponse({ success: true, rsvps, stats });
    }

    // Health check
    return jsonResponse({ success: true, message: 'Lincoln RSVP API is running 🎂' });

  } catch (err) {
    console.error('doGet error:', err.message);
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function sanitize(value) {
  if (typeof value !== 'string') return String(value || '');
  // Strip potential formula injection
  return value.replace(/^[=+\-@]/, "'$&").trim().substring(0, 500);
}

function jsonResponse(data, statusCode) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
