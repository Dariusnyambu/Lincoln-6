/**
 * ═══════════════════════════════════════════════════════════════════
 *  Lincoln's 6th Birthday RSVP — Google Apps Script Backend
 * ═══════════════════════════════════════════════════════════════════
 *
 *  IMPORTANT — after ANY code change you must create a NEW deployment:
 *  Deploy > Manage Deployments > (pencil icon) > New Version > Deploy
 *  The URL stays the same; only a new version picks up code changes.
 *
 *  SHEET COLUMNS:
 *  Timestamp | Parent Name | Phone | Email | Child Name |
 *  Adults | Children | Attendance | Notes
 * ═══════════════════════════════════════════════════════════════════
 */

const SHEET_NAME = 'RSVPs';

// ─── doGet — returns all RSVPs as JSON ───────────────────────────────────────
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || '';

    if (action === 'getRSVPs') {
      const sheet    = getOrCreateSheet();
      const lastRow  = sheet.getLastRow();

      if (lastRow <= 1) {
        return jsonResponse({ success: true, rsvps: [], stats: { total: 0, attending: 0, notAttending: 0, totalAdults: 0, totalChildren: 0 } });
      }

      const rows  = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
      const rsvps = rows
        .filter(r => r[1]) // skip empty rows (col B = Parent Name)
        .map(r => ({
          // Timestamps from Sheets can be Date objects — convert to ISO string
          timestamp:  r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ''),
          parentName: String(r[1] || ''),
          phone:      String(r[2] || ''),
          email:      String(r[3] || ''),
          childName:  String(r[4] || ''),
          adults:     Number(r[5]) || 0,
          children:   Number(r[6]) || 0,
          attendance: String(r[7] || ''),
          notes:      String(r[8] || ''),
        }));

      const attending = rsvps.filter(r => r.attendance === 'attending');
      const stats = {
        total:         rsvps.length,
        attending:     attending.length,
        notAttending:  rsvps.length - attending.length,
        totalAdults:   attending.reduce((s, r) => s + r.adults, 0),
        totalChildren: attending.reduce((s, r) => s + r.children, 0),
      };

      return jsonResponse({ success: true, rsvps, stats });
    }

    // Health-check ping
    return jsonResponse({ success: true, message: 'Lincoln RSVP API running 🎂' });

  } catch (err) {
    return jsonResponse({ success: false, error: String(err.message) });
  }
}

// ─── doPost — save new RSVP or delete a row ──────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ── Delete row ────────────────────────────────────────────────────────────
    if (data.action === 'deleteRow') {
      const sheet    = getOrCreateSheet();
      const rowIndex = parseInt(data.rowIndex, 10); // 0-based data index
      const sheetRow = rowIndex + 2;                // +1 header, +1 1-based
      if (isNaN(rowIndex) || sheetRow < 2 || sheetRow > sheet.getLastRow()) {
        return jsonResponse({ success: false, error: 'Invalid row index' });
      }
      sheet.deleteRow(sheetRow);
      return jsonResponse({ success: true, message: 'Row deleted' });
    }

    // ── New RSVP ──────────────────────────────────────────────────────────────
    if (!data.parentName || !data.phone || !data.childName) {
      return jsonResponse({ success: false, error: 'Missing required fields' });
    }

    const sheet = getOrCreateSheet();

    // Create header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp','Parent Name','Phone','Email','Child Name','Adults','Children','Attendance','Notes']);
      const hdr = sheet.getRange(1, 1, 1, 9);
      hdr.setBackground('#0F172A');
      hdr.setFontColor('#F59E0B');
      hdr.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      sanitize(data.parentName),
      sanitize(data.phone),
      sanitize(data.email   || '—'),
      sanitize(data.childName),
      parseInt(data.adults,   10) || 0,
      parseInt(data.children, 10) || 0,
      sanitize(data.attendance),
      sanitize(data.notes   || '—'),
    ]);

    sheet.autoResizeColumns(1, 9);

    return jsonResponse({ success: true, message: 'RSVP saved', row: sheet.getLastRow() });

  } catch (err) {
    return jsonResponse({ success: false, error: String(err.message) });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function sanitize(value) {
  if (typeof value !== 'string') return String(value != null ? value : '');
  return value.replace(/^[=+\-@]/, "'$&").trim().substring(0, 500);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
