import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [app, index, serviceWorker] = await Promise.all([
  readFile(new URL("../app.js", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../service-worker.js", import.meta.url), "utf8"),
]);

test("the browser app has no external module dependency before rendering", () => {
  assert.doesNotMatch(app, /^\s*import\s/m);
  assert.match(index, /<script src="app\.js" defer><\/script>/);
});

test("community and building controls are present", () => {
  assert.match(index, /id="communitySelect"/);
  assert.match(index, /id="buildingSelect"/);
  assert.match(app, /const communities = \{/);
  assert.match(app, /"Fish\/Baker": \["Fish A", "Fish B", "Fish C", "Baker A", "Baker B"\]/);
});

test("native issue categories are present in static HTML and app catalog", () => {
  const categories = [...index.matchAll(/<details class="issue-card" data-issue="([^"]+)">/g)].map((match) => match[1]);
  assert.deepEqual(categories, ["Windows", "Paint/Wall", "HVAC", "Furniture", "Common Work Orders", "Carpet/Floor", "Bathroom"]);
  assert.ok((index.match(/class="subcategory-row"/g) || []).length >= 34);
  assert.match(app, /Windows: \["Window Limiter", "Window Push Bar", "Window Screen", "Window Blinds", "Other"\]/);
  assert.match(app, /Bathroom: \["Mold\/Mildew", "Shower Curtain Needs Replaced", "Needs Cleaning", "Shower Leaking", "Sink Leaking", "Toilet Clogged", "Other"\]/);
  assert.match(app, /"Common Work Orders": \["Lights Out", "Vacuuming\/Mopping Needed", "Door Not Securing", "Malfunctioning Strobe", "Missing Signage", "Other"\]/);
});

test("the self-contained app still includes data and enhancement helpers", () => {
  assert.match(app, /const buildings = \[\.\.\.new Set/);
  assert.match(app, /const buildingNumbers = \{/);
  assert.match(app, /Ellingson: "50A"/);
  assert.match(app, /DSP: "43"/);
  assert.match(app, /function buildingLabel/);
  assert.match(app, /function buildingFilenameLabel/);
  assert.match(app, /const issueCatalog = \{/);
  assert.match(app, /function sortCategoriesDescending/);
  assert.match(app, /function collectDraftIssues/);
  assert.match(app, /querySelectorAll\("\.issue-card\[data-issue\]"\)/);
});


test("inspected space dropdown and export controls are present", () => {
  assert.match(index, /id="roomNumber"[^>]+inputmode="numeric"[^>]+pattern="\[0-9\]\*"/);
  assert.match(index, /id="roomType"/);
  assert.match(index, /<option value="Lounge" selected>Lounge<\/option>/);
  assert.match(index, /<option value="Bathroom">Bathroom<\/option>/);
  assert.match(index, /<option value="Elevator">Elevator<\/option>/);
  assert.match(index, /<option value="Hallway">Hallway<\/option>/);
  assert.match(index, /<option value="Stairwell">Stairwell<\/option>/);
  assert.match(index, /<option value="Exterior">Exterior<\/option>/);
  assert.match(index, /id="numberNotApplicable"/);
  assert.match(index, /id="locationDetails"/);
  assert.match(app, /roomType: "Lounge"/);
  assert.match(app, /numberNotApplicable\.addEventListener/);
  assert.match(app, /"Carpet\/Floor": \["Holes & Tears", "Stains", "Other"\]/);
  assert.match(app, /Furniture: \["Abandoned Furniture Present", "Lounge Furniture Missing", "Needs Repair", "Overly-Worn\/Damaged", "Other"\]/);
  assert.match(app, /HVAC: \["Displaced A\/C Panel", "Needs Servicing", "Other"\]/);
  assert.match(app, /"Paint\/Wall": \["Crack", "Peeling", "Patch Needed", "Mold\/Mildew", "Cleaning Needed", "Other"\]/);
  assert.match(app, /"Building Name", "Room Number", "Room Type", "Categories and Subcategories", "Additional Notes", "Partner Summary"/);
  assert.match(index, /RIT RC Community Walkthroughs/);
  assert.match(index, /Community Walkthrough Form/);
  assert.match(index, /id="downloadReportButton"/);
  assert.match(index, /id="downloadAllContentsButton"/);
  assert.match(index, /id="downloadCsvButton"/);
  assert.match(index, /id="savedPhotos"/);
  assert.match(index, /id="downloadAllPhotosButton"/);
  assert.match(index, /Download CSV File/);
  assert.match(index, /Download All Photos as ZIP/);
  assert.match(app, /async function labelPhoto/);
  assert.match(app, /function buildCsvText/);
  assert.match(app, /function formatPartnerSummary/);
  assert.match(app, /buildingLabel\(entry\.building\)/);
  assert.match(app, /function uniqueDownloadId/);
  assert.match(app, /function reportHtml/);
  assert.match(app, /function downloadAllContents/);
  assert.match(index, /Other Issues Not Listed Above/);
  assert.match(app, /customSubcategories/);
  assert.match(app, /function createZip/);
});

test("photos are compressed before being saved to browser storage", () => {
  assert.match(app, /PHOTO_DIMENSION_STEPS = \[1000, 850, 700\]/);
  assert.match(app, /PHOTO_TARGET_BYTES = 180 \* 1024/);
  assert.match(app, /async function compressImageForStorage/);
  assert.match(app, /async function compressCanvasForStorage/);
  assert.match(app, /dataUrlSizeInBytes/);
  assert.match(app, /PHOTO_DB_NAME = "rit-room-checks-photos-v1"/);
  assert.match(app, /function openPhotoDb/);
  assert.match(app, /async function saveStoredPhoto/);
  assert.match(app, /async function migrateDraftPhotos/);
  assert.match(app, /Compressed from/);
});

test("photo-free submissions require the requested confirmation", () => {
  assert.match(app, /title: "Submit without photos\?"/);
  assert.match(app, /Including photos is strongly recommended\. Are you sure you want to submit without photos\?/);
  assert.match(app, /confirmLabel: "Submit"/);
});


test("photo issue logging, submit heading, and copy button feedback are present", () => {
  assert.doesNotMatch(index, />Step 2</);
  assert.match(index, /<h2 id="submit-heading">Submit<\/h2>/);
  assert.match(index, /id="photoIssueDialog"/);
  assert.match(index, /id="photoIssueOptions"/);
  assert.match(index, /Select categories to add them to images/);
  assert.doesNotMatch(index, /id="copyToast"/);
  assert.match(index, /class="collected-data-divider"/);
  assert.match(app, /logButton\.textContent = "Log Issue"/);
  assert.match(app, /button\.textContent = "Download"/);
  assert.match(app, /photo\.associatedIssues/);
  assert.match(app, /showCopyButtonSuccess\(\)/);
  assert.match(app, /copyTextButton\.textContent = "Copied!"/);
  assert.match(app, /copyTextButton\.classList\.add\("copy-success"\)/);
  assert.match(app, /globalThis\.isSecureContext/);
  assert.match(app, /document\.execCommand\("copy"\)/);
  assert.match(app, /}, 3000\)/);
});

test("issue selections are cleared only through the current-room reset flow", () => {
  assert.doesNotMatch(index, /Clear issue selections/);
  assert.doesNotMatch(index, /id="clearIssuesButton"/);
  assert.doesNotMatch(app, /clearIssuesButton/);
  assert.doesNotMatch(app, /function clearIssueSelections/);
  assert.match(index, /id="resetCurrentButton"/);
});

test("legacy offline caches are removed instead of serving stale app files", () => {
  assert.match(app, /getRegistrations\(\)/);
  assert.match(app, /name\.startsWith\("room-checks-"\)/);
  assert.match(serviceWorker, /registration\.unregister\(\)/);
  assert.doesNotMatch(serviceWorker, /respondWith/);
});
