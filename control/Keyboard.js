// ==========================
// 🔥 LOCAL DATA (TEMP DB)
// ==========================
let cards = [];

// ==========================
// 🔥 LOAD + SEARCH
// ==========================
function loadCards() {
  const search = document.getElementById("search")?.value?.toLowerCase() || "";

  let filtered = cards.filter(c =>
    c.CARD_NO.toLowerCase().includes(search)
  );

  renderTable(filtered);
}

// ==========================
// 🔥 RENDER TABLE
// ==========================
function renderTable(data) {

  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3">❌ No Data</td></tr>`;
    return;
  }

  data.forEach(row => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.CARD_NO}</td>
      <td style="color:${row.CARD_STATUS == 1 ? 'lightgreen' : 'red'}">
        ${row.CARD_STATUS == 1 ? "Active" : "Block"}
      </td>
      <td>
        <button onclick="editCard('${row.CARD_NO}')">Edit</button>
        <button onclick="deleteCard('${row.CARD_NO}')">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ==========================
// 🔥 INSERT
// ==========================
function insertCardUI() {

  const cardNo = document.getElementById("cardNo").value.trim();
  const status = document.getElementById("status").value;

  if (!cardNo) {
    alert("Enter Card No");
    return;
  }

  // Duplicate check
  const exists = cards.some(c => c.CARD_NO === cardNo);

  if (exists) {
    alert("❌ Card already exists");
    return;
  }

  // CALL API
  window.CWC_API.insert({
    CARD_NO: cardNo,
    CARD_STATUS: parseInt(status)
  });

  closeAddPopup();
}

// ==========================
// 🔥 EDIT
// ==========================
function editCard(cardNo) {

  const card = cards.find(c => c.CARD_NO === cardNo);

  if (!card) return;

  const newStatus = prompt("Enter Status (1=Active, 0=Block):", card.CARD_STATUS);

  if (newStatus === null) return;

  window.CWC_API.update({
    CARD_NO: cardNo,
    CARD_STATUS: parseInt(newStatus)
  });
}

// ==========================
// 🔥 DELETE
// ==========================
function deleteCard(cardNo) {

  if (!confirm("Delete " + cardNo + "?")) return;

  window.CWC_API.delete(cardNo);
}

// ==========================
// 🔥 POPUP
// ==========================
function openAddPopup() {
  document.getElementById("addPopup").style.display = "flex";
}

function closeAddPopup() {
  document.getElementById("addPopup").style.display = "none";
}

// ==========================
// 🔥 CWC API (MAIN CORE)
// ==========================
window.CWC_API = {

  insert: function(data) {

    console.log("📤 Insert:", data);

    cards.push({
      CARD_NO: data.CARD_NO,
      CARD_STATUS: data.CARD_STATUS
    });

    // 🔥 WRITE TO HMI TAG (optional)
    if (typeof HMIRuntime !== "undefined") {
      HMIRuntime.Tags.SysFct.SetTagValue("CARD_NO", data.CARD_NO);
      HMIRuntime.Tags.SysFct.SetTagValue("CARD_STATUS", data.CARD_STATUS);
    }

    loadCards();
  },

  update: function(data) {

    console.log("✏️ Update:", data);

    let card = cards.find(c => c.CARD_NO === data.CARD_NO);

    if (card) {
      card.CARD_STATUS = data.CARD_STATUS;
    }

    loadCards();
  },

  delete: function(cardNo) {

    console.log("🗑 Delete:", cardNo);

    cards = cards.filter(c => c.CARD_NO !== cardNo);

    loadCards();
  },

  load: function() {
    return cards;
  }
};

// ==========================
// 🔥 KEYBOARD CONNECT
// ==========================
window.writeValueFromKeyboard = function(value) {

  console.log("⌨️ Keyboard Input:", value);

  const input = document.getElementById("cardNo");

  if (input) {
    input.value = value;
  }
};

// ==========================
// 🔥 INIT
// ==========================
window.onload = loadCards;