// ==========================
// 🔥 API CONFIG
// ==========================
// const BACKUP_API = "http://localhost:3000/api/backup";
// const RESTORE_API = "http://localhost:3000/api/restore";
const BACKUP_API  = "http://192.168.1.24:3000/api/backup";
const RESTORE_API = "http://192.168.1.24:3000/api/restore";

// ==========================
// 🔥 GLOBALS
// ==========================
let autoInterval = null;

// ==========================
// 🔥 STATUS HANDLER
// ==========================
function setStatus(message) {
  const el = document.getElementById("status");
  if (el) el.innerText = "Status: " + message;
}

// ==========================
// 🔥 SECTION TOGGLE
// ==========================
// function toggleAutoSection() {
//   const auto = document.getElementById("autoSection");
//   const restore = document.getElementById("restoreSection");

//   auto.classList.toggle("hidden");
//   restore.classList.add("hidden");
// }

// function toggleRestoreSection() {
//   const auto = document.getElementById("autoSection");
//   const restore = document.getElementById("restoreSection");

//   restore.classList.toggle("hidden");
//   auto.classList.add("hidden");
// }

// function toggleBackupSection() {
//   const auto = document.getElementById("autoSection");
//   const restore = document.getElementById("restoreSection");
//   const backup = document.getElementById("backupSection");

//   backup.classList.toggle("hidden");
//   auto.classList.add("hidden");
//   restore.classList.add("hidden");
// }

function toggleAutoSection() {
  document.getElementById("autoSection").classList.remove("hidden");
  document.getElementById("backupSection").classList.add("hidden");
  document.getElementById("restoreSection").classList.add("hidden");
}

function toggleBackupSection() {
  document.getElementById("backupSection").classList.remove("hidden");
  document.getElementById("autoSection").classList.add("hidden");
  document.getElementById("restoreSection").classList.add("hidden");
}

function toggleRestoreSection() {
  document.getElementById("restoreSection").classList.remove("hidden");
  document.getElementById("autoSection").classList.add("hidden");
  document.getElementById("backupSection").classList.add("hidden");
}

// ==========================
// 🔥 MANUAL BACKUP
// ==========================
async function manualBackup() {

  const path = document.getElementById("backupPath")?.value || "";

  if (!confirm("Take backup now?")) return;

  setStatus("Taking backup...");

  try {
    const res = await fetch(BACKUP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ path })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setStatus("✅ Backup Created: " + (data.file || ""));

  } catch (err) {
    console.error(err);
    setStatus("❌ Backup Failed");
  }
}

// ==========================
// 🔥 RESTORE (LATEST)
// ==========================
async function manualRestore() {

  if (!confirm("⚠ Restore will overwrite DB. Continue?")) return;

  setStatus("Restoring latest backup...");

  try {
    const res = await fetch(RESTORE_API, { method: "POST" });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    setStatus("✅ Restored: " + (data.file || ""));

  } catch (err) {
    console.error(err);
    setStatus("❌ Restore Failed");
  }
}

// ==========================
// 🔥 RESTORE FROM PATH
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ path })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setStatus("✅ Restore Success");

  } catch (err) {
    console.error(err);
    setStatus("❌ Restore Failed");
  }
}

// ==========================
// 🔥 AUTO BACKUP (DAYS)
// ==========================
function startAutoBackup() {

  const minutes = parseInt(document.getElementById("backupMinutes").value);

  if (!minutes || minutes <= 0) {
    alert("Enter valid minutes");
    return;
  }

  const intervalMs = minutes * 60 * 1000;

  if (autoInterval) {
    clearInterval(autoInterval);
  }

  autoInterval = setInterval(async () => {

    console.log("⏱ Auto Backup Triggered");

    try {
      const res = await fetch(BACKUP_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus("✅ Auto Backup Completed: " + (data.file || ""));

    } catch (err) {
      console.error(err);
      setStatus("❌ Auto Backup Failed");
    }

  }, intervalMs);

  setStatus(`⏱ Auto Backup every ${minutes} minute(s)`);
}

// ==========================
// 🔥 STOP AUTO BACKUP
// ==========================
function stopAutoBackup() {

  if (autoInterval) {
    clearInterval(autoInterval);
    autoInterval = null;
    setStatus("⏹ Auto Backup Stopped");
  }
}

// function openFolderPicker() {
//   document.getElementById("folderPicker").click();
// }

// document.getElementById("folderPicker").addEventListener("change", function (e) {

//   const files = e.target.files;

//   if (files.length > 0) {
//     // Get folder path (approx)
//     const fullPath = files[0].webkitRelativePath;
//     const folder = fullPath.split("/")[0];

//     document.getElementById("backupPath").value = folder;

//     setStatus("📁 Folder selected: " + folder);
//   }
// });


function openFilePicker() {
  document.getElementById("filePicker").click();
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