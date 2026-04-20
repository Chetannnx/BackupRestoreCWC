// ==========================
// 🔥 API CONFIG
// ==========================
const BACKUP_API  = "http://192.168.1.24:3000/api/backup";
const RESTORE_API = "http://192.168.1.24:3000/api/restore";
const STATUS_API = "http://192.168.1.24:3000/api/status";

//=====================
// ==========================
// 🔥 OPEN KEYBOARD
// ==========================
function openKeyboard(input) {

  const keyboard = document.getElementById("keyboard");

  keyboard.classList.remove("hidden");

  // initialize keyboard
  initKeyboard({
    field: "Backup Interval",
    value: input.value,
    tag: "backupMinutes",
    min: 1,
    max: 1440,
    unit: "min"
  });

  // store reference
  window.currentInput = input;
}

function parseSQLDate(dateStr) {
  if (!dateStr) return null;

  // convert "2026-04-18T15:50:59.000Z" OR SQL format to local
  return new Date(dateStr.replace("Z", ""));
}


let lastRestoreTime = null;

async function fetchStatus() {
  try {
    const res = await fetch(STATUS_API);
    const data = await res.json();

    if (data.auto) lastAutoBackupTime = parseSQLDate(data.auto);
    if (data.manual) lastManualBackupTime = parseSQLDate(data.manual);
    if (data.restore) lastRestoreTime = parseSQLDate(data.restore);

    updateStatusDisplay();

  } catch (err) {
    console.error("❌ Status fetch error:", err);
  }
}
fetchStatus();

// ==========================
// 🔥 RECEIVE VALUE FROM KEYBOARD
// ==========================
window.writeValueFromKeyboard = function (val) {

  if (window.currentInput) {
    window.currentInput.value = val;
  }

  // optional: update your interval variable
  backupIntervalMinutes = parseInt(val) || 0;
};
//=====================


function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    // Hide default content
    document.getElementById("uploadContent").classList.add("hidden");

    // Show file name inside box
    const fileDiv = document.getElementById("selectedFile");
    fileDiv.classList.remove("hidden");
    fileDiv.innerText = file.name;
  }
}

// function showTab(event, tabName) {
//   document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
//   document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

//   event.target.classList.add("active");
//   document.getElementById(tabName + "Tab").classList.add("active");
// }
function showTab(event, tabName) {

  // 🔥 SET CURRENT SECTION (IMPORTANT)
  currentSection = tabName;

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

  if (event) event.target.classList.add("active");

  document.getElementById(tabName + "Tab").classList.add("active");

  // 🔥 FORCE STATUS UPDATE
  updateStatusDisplay();
}

// function openFilePicker() {
//   document.getElementById("filePicker").click();
// }
function closePopup() {
  document.getElementById("filePopup").classList.add("hidden");
}

function selectFile(fileName) {

  const fullPath = "D:\\Chetan\\DBBackup\\" + fileName;

  document.getElementById("restorePath").value = fullPath;

  // UI update
  document.getElementById("uploadContent").classList.add("hidden");

  const fileDiv = document.getElementById("selectedFile");
  fileDiv.classList.remove("hidden");
  fileDiv.innerText = fileName;

  setStatus("restore", "📄 Selected: " + fullPath);

  closePopup();
}

function handleFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    document.getElementById("uploadContent").classList.add("hidden");

    const fileDiv = document.getElementById("selectedFile");
    fileDiv.classList.remove("hidden");
    fileDiv.innerText = file.name;
  }
}

// ==========================
// 🔥 GLOBALS
// ==========================
let lastAutoBackupTime = null;
let lastManualBackupTime = null;
let nextBackupTime = null;
let backupIntervalMinutes = 0;

// let currentSection = "auto";

// ==========================
// 🔥 STATUS HANDLER
// ==========================
// function setStatus(message) {

//   const autoEl = document.getElementById("autoStatus");
//   const backupEl = document.getElementById("backupStatus");
//   const restoreEl = document.getElementById("restoreStatus");

//   if (autoEl) autoEl.classList.add("hidden");
//   if (backupEl) backupEl.classList.add("hidden");
//   if (restoreEl) restoreEl.classList.add("hidden");

//   if (currentSection === "auto" && autoEl) {
//     autoEl.innerText = "Auto Status:\n" + message;
//     autoEl.classList.remove("hidden");
//   }
//   else if (currentSection === "backup" && backupEl) {
//     backupEl.innerText = "Backup Status:\n" + message;
//     backupEl.classList.remove("hidden");
//   }
//   else if (currentSection === "restore" && restoreEl) {
//     restoreEl.innerText = "Restore Status:\n" + message;
//     restoreEl.classList.remove("hidden");
//   }
// }

function setStatus(type, message) {

  const autoEl = document.getElementById("autoStatus");
  const backupEl = document.getElementById("backupStatus");
  const restoreEl = document.getElementById("restoreStatus");

  if (type === "auto" && autoEl) {
    autoEl.innerText = "Auto Status:\n" + message;
  }

  if (type === "backup" && backupEl) {
    backupEl.innerText = "Backup Status:\n" + message;
  }

  if (type === "restore" && restoreEl) {
    restoreEl.innerText = "Restore Status:\n" + message;
  }
}

// ==========================
// 🔥 LOAD STATE
// ==========================
// window.addEventListener("DOMContentLoaded", function () {
//   loadBackupState();

//   // ✅ Always running checker (PLC style)
//   setInterval(checkAutoBackup, 1000);
// });

window.addEventListener("DOMContentLoaded", function () {

  fetchStatus(); // first load

  setInterval(fetchStatus, 3000);   // 🔥 LIVE SQL DATA
  setInterval(checkAutoBackup, 1000);

});


// function loadBackupState() {

//   const auto = localStorage.getItem("lastAutoBackupTime");
//   const manual = localStorage.getItem("lastManualBackupTime");
//   const next = localStorage.getItem("nextBackupTime");
//   const interval = localStorage.getItem("backupInterval");

//   if (auto) lastAutoBackupTime = new Date(auto);
//   if (manual) lastManualBackupTime = new Date(manual);
//   if (next) nextBackupTime = new Date(next);
//   if (interval) backupIntervalMinutes = parseInt(interval);

//   updateStatusDisplay();
// }

// ==========================
// 🔥 SAVE STATE
// ==========================
// function saveBackupState() {

//   if (lastAutoBackupTime)
//     localStorage.setItem("lastAutoBackupTime", lastAutoBackupTime.toISOString());

//   if (lastManualBackupTime)
//     localStorage.setItem("lastManualBackupTime", lastManualBackupTime.toISOString());

//   if (nextBackupTime)
//     localStorage.setItem("nextBackupTime", nextBackupTime.toISOString());

//   if (backupIntervalMinutes)
//     localStorage.setItem("backupInterval", backupIntervalMinutes.toString());
// }

// ==========================
// 🔥 STATUS DISPLAY
// ==========================
function updateStatusDisplay() {

  // ===== AUTO =====
  const autoEl = document.getElementById("autoStatus");
  if (autoEl) {
    let msg = "";

    if (lastAutoBackupTime) {
      msg += "🕒 Last Auto Backup: " + lastAutoBackupTime.toLocaleString() + "\n";
    }

    if (nextBackupTime) {
      msg += "⏭ Next Backup: " + nextBackupTime.toLocaleString() + "\n";
    }

    if (backupIntervalMinutes) {
      msg += "⏱ Interval: " + backupIntervalMinutes + " min";
    }

    if (!msg) msg = "No auto backup yet";

    autoEl.innerText = "Auto Status:\n" + msg;
  }

  // ===== MANUAL BACKUP =====
  const backupEl = document.getElementById("backupStatus");
  if (backupEl) {
    if (lastManualBackupTime) {
      backupEl.innerText =
        "Backup Status:\n🕒 Last Backup: " +
        lastManualBackupTime.toLocaleString();
    } else {
      backupEl.innerText = "Backup Status: No manual backup yet";
    }
  }

  // ===== RESTORE =====
  const restoreEl = document.getElementById("restoreStatus");
  if (restoreEl) {
    // const lastRestore = localStorage.getItem("lastRestoreTime");


   if (lastRestoreTime) {
  restoreEl.innerText =
    "Restore Status:\n♻ Last Restore: " +
    lastRestoreTime.toLocaleString();
} else {
  restoreEl.innerText = "Restore Status: No restore yet";
}
  }
}

// ==========================
// 🔥 SECTION TOGGLE
// ==========================
// function toggleAutoSection() {
//   currentSection = "auto";
//   document.getElementById("autoSection").classList.remove("hidden");
//   document.getElementById("backupSection").classList.add("hidden");
//   document.getElementById("restoreSection").classList.add("hidden");
//   updateStatusDisplay();
// }

// function toggleBackupSection() {
//   currentSection = "backup";
//   document.getElementById("backupSection").classList.remove("hidden");
//   document.getElementById("autoSection").classList.add("hidden");
//   document.getElementById("restoreSection").classList.add("hidden");
//   updateStatusDisplay();
// }

// function toggleRestoreSection() {
//   currentSection = "restore";
//   document.getElementById("restoreSection").classList.remove("hidden");
//   document.getElementById("autoSection").classList.add("hidden");
//   document.getElementById("backupSection").classList.add("hidden");
//   updateStatusDisplay();
// }

// ==========================
// 🔥 MANUAL BACKUP
// ==========================
async function manualBackup() {

  if (!confirm("Take backup now?")) return;

  setStatus("Taking backup...");

  try {
    const res = await fetch(BACKUP_API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "MANUAL" })
});

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // lastManualBackupTime = new Date();

    saveBackupState();
    updateStatusDisplay();

  } catch (err) {
    console.error(err);
    setStatus("❌ Backup Failed");
  }
}

// ==========================
// 🔥 AUTO BACKUP CHECK (CORE LOGIC)
// ==========================
function checkAutoBackup() {

  if (!backupIntervalMinutes || !nextBackupTime) return;

  const now = new Date();

  if (now >= nextBackupTime) {

    runAutoBackup();

    // schedule next
    nextBackupTime = new Date(now.getTime() + backupIntervalMinutes * 60000);

    saveBackupState();
  }

  updateStatusDisplay();
}

// ==========================
// 🔥 RUN AUTO BACKUP
// ==========================
async function runAutoBackup() {

  try {
    const res = await fetch(BACKUP_API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "AUTO" })
});
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    // lastAutoBackupTime = new Date();

    saveBackupState();

  } catch (err) {
    console.error(err);
    setStatus("❌ Auto Backup Failed");
  }
}

// ==========================
// 🔥 START AUTO BACKUP
// ==========================
function startAutoBackup() {

  const minutes = parseInt(document.getElementById("backupMinutes").value);

  if (!minutes || minutes <= 0) {
    alert("Enter valid minutes");
    return;
  }

  backupIntervalMinutes = minutes;

  nextBackupTime = new Date(Date.now() + minutes * 60000);

  saveBackupState();
  updateStatusDisplay();

  setStatus(`⏱ Auto Backup started (${minutes} min)`);
}

// ==========================
// 🔥 RESTORE
// ==========================
async function restoreFromPath() {

  const path = document.getElementById("restorePath").value;

  if (!path) {
    alert("Enter backup file path");
    return;
  }

  setStatus("Restoring from file...");

  try {
    const res = await fetch(RESTORE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // localStorage.setItem("lastRestoreTime", new Date().toISOString());

    setStatus("✅ Restore Success");
    updateStatusDisplay();

  } catch (err) {
    console.error(err);
    setStatus("❌ Restore Failed");
  }
}


// function openFilePicker() {
//   document.getElementById("filePicker").click();
// }
async function openFilePicker() {

  const popup = document.getElementById("filePopup");
  const fileList = document.getElementById("fileList");

  popup.classList.remove("hidden");
  fileList.innerHTML = "Loading...";

  try {
    const res = await fetch("http://192.168.1.24:3000/api/backups");
    const files = await res.json();

    fileList.innerHTML = "";

    files.forEach(f => {
      const div = document.createElement("div");
      div.className = "file-item";

      // show name + date
      div.innerText = f.name + " (" + new Date(f.time).toLocaleString() + ")";

      div.onclick = () => selectFile(f.name);

      fileList.appendChild(div);
    });

  } catch (err) {
    fileList.innerHTML = "❌ Failed to load files";
  }
}

document.getElementById("filePicker").addEventListener("change", function (e) {

  const file = e.target.files[0];

  if (file) {
    const fullPath = "D:\\Chetan\\DBBackup\\" + file.name;

    document.getElementById("restorePath").value = fullPath;

    setStatus("📄 File selected: " + fullPath);
  }
});

// ==========================
// 🔥 WEBCC START
// ==========================
WebCC.start(
  function (result) {
    if (result) {
      console.log("✅ CWC Backup UI Started");
      setStatus("Ready");
    } else {
      console.error("❌ WebCC Failed");
    }
  },
  {
    methods: {
      startBackup: function () {
        manualBackup();
      },
      startAutoBackup: function () {
        startAutoBackup();
      },
      stopAutoBackup: function () {
        stopAutoBackup();
      },
      restoreBackup: function () {
        restoreFromPath();
      }
    },

    events: [
      "onBackupComplete",
      "onRestoreComplete"
    ],

    properties: {
      BackupPath: "D:\\Chetan\\DBBackup",
      LastBackupFile: "",
      Status: "Idle",
      AutoBackupInterval: 1
    }
  }
);