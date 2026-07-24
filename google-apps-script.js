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
//
// Resumes are saved to a "Sales Floor Resumes" folder in your Google
// Drive. The sheet stores a direct link to each file.
// ─────────────────────────────────────────────────────────────────

const RESUME_FOLDER_NAME = 'Sales Floor Resumes';

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
  'Current Base Salary [USD]',
  'Current OTE (Base + Commission)',
  'Desired OTE',
  'Open to Relocation',
  'Preferred Location(s)',
  'Industries Interested In',
  'CRM / Tool Experience',
  "President's Club / Awards",
  'Resume',
];

function getOrCreateFolder(name) {
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    var data = JSON.parse(e.postData.contents);

    // Save resume to Drive and get a shareable link
    var resumeLink = '';
    if (data.resume_data && data.resume_filename) {
      try {
        var folder = getOrCreateFolder(RESUME_FOLDER_NAME);
        var blob = Utilities.newBlob(
          Utilities.base64Decode(data.resume_data),
          data.resume_type || 'application/octet-stream',
          data.resume_filename
        );
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        resumeLink = file.getUrl();
      } catch (driveErr) {
        resumeLink = 'DRIVE ERROR: ' + driveErr.toString();
      }
    } else {
      resumeLink = 'NO FILE DATA RECEIVED (filename=' + (data.resume_filename || 'none') + ')';
    }

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
      resumeLink,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', resume: resumeLink }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('The Sales Floor intake endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
