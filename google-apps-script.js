// ─────────────────────────────────────────────────────────────────
// The Sales Floor — Google Apps Script
//
// HOW TO DEPLOY:
// 1. Open Google Sheets → Extensions → Apps Script
// 2. Delete any existing code and paste this entire file
// 3. Click Deploy → New deployment
//    - Type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Click Deploy, copy the Web App URL
// 5. Paste that URL into script.js where it says SHEETS_URL
// ─────────────────────────────────────────────────────────────────

const HEADERS = [
  'Timestamp',
  'Name',
  'Email',
  'Phone',
  'LinkedIn',
  'Current Company',
  'Current Title',
  'Years in B2B Sales',
  '% to Quota',
  'Current Base Salary',
  'Current OTE',
  'Desired OTE',
  'Open to Relocation',
  'Preferred Location(s)',
  'Industries Interested In',
  'CRM / Tool Experience',
  "President's Club / Awards",
  'Resume Filename',
];

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write headers on first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.linkedin || '',
      data.company || '',
      data.title || '',
      data.years || '',
      data.quota || '',
      data.base || '',
      data.ote || '',
      data.desired_ote || '',
      data.relocation || '',
      (data.location || []).join(', '),
      (data.industry || []).join(', '),
      (data.crm || []).join(', '),
      data.awards || '',
      data.resume_filename || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test this by running doGet — visits the URL in a browser
function doGet() {
  return ContentService
    .createTextOutput('The Sales Floor intake endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
