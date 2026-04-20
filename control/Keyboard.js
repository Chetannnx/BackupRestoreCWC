
document.body.classList.add("light-theme");
// =========================
// 🔥 FORMAT VALUE
// =========================
function formatValue(val) {
  if (val === undefined || val === null) return "";

  let num = parseFloat(val);
  if (isNaN(num)) return val.toString();

  // return num.toFixed(2);\
  return Math.round(num).toString();
}


window.showErrorEffect = function (isError) {

  const inputBox = document.querySelector(".display");
  const enterBtn = document.querySelector(".enter"); // ENTER button

  if (!inputBox || !enterBtn) return;

  if (isError) {

    // 🔴 RED + SHAKE
    inputBox.classList.add("error");
    inputBox.classList.add("shake");

    // ⛔ DISABLE ENTER
    enterBtn.disabled = true;
    enterBtn.classList.add("disabled");

  } else {

    // ✅ REMOVE ERROR
    inputBox.classList.remove("error");
    inputBox.classList.remove("shake");

    // ✅ ENABLE ENTER
    enterBtn.disabled = false;
    enterBtn.classList.remove("disabled");
  }

  // remove shake after animation
  setTimeout(() => {
    inputBox.classList.remove("shake");
  }, 300);
};

// =========================
// 🔥 VARIABLES
// =========================
const keyboardDiv = document.getElementById("keyboard");

let currentValue = "";
let cursorPos = 0;

let currentField = "";

let currentUnit = "";
let currentTitle = "";
let oldValue = "";

let currentTag = "";
let currentMin = null;
let currentMax = null;

// =========================
// 🔥 LAYOUT
// =========================
const layout = [
  ["1","2","3","⌫"],
  ["4","5","6","CLEAR"],
  ["7","8","9","ENTER"],
  [".","0","-"]
];

// =========================
// 🔥 INIT KEYBOARD (ONLY ONCE)
// =========================
function initKeyboard(data) {

  currentField = data.field || "";
  currentTitle = data.title || data.field || "";

  currentValue = formatValue(data.value);
  oldValue = formatValue(data.value);

  cursorPos = currentValue.length;

  currentTag = data.tag || "";
  currentUnit = data.unit || "";

  // ✅ SET RANGE ALSO HERE
  currentMin = data.min ?? currentMin;
  currentMax = data.max ?? currentMax;

  buildKeyboard();
}




// =========================
// 🔥 UPDATE RANGE ONLY
// =========================
function updateRange(min, max) {

  currentMin = min ?? currentMin;
  currentMax = max ?? currentMax;

  const rangeDiv = document.querySelector(".range-bar");

  if (rangeDiv) {
    rangeDiv.innerHTML = `
      <span>Min: ${currentMin != null ? formatValue(currentMin) : "-"}</span>
      <span>Max: ${currentMax != null ? formatValue(currentMax) : "-"}</span>
    `;
  }
}

// =========================
// 🔥 SAFE WRITE
// =========================
function sendValue() {

  if (typeof HMIRuntime !== "undefined") {

    if (currentTag) {
      HMIRuntime.Tags.SysFct.SetTagValue(currentTag, currentValue);
    }

  } else {
    console.log("👉 SIM VALUE:", currentTag, currentValue);
  }
}

// =========================
// 🔥 VALIDATION
// =========================
function isValidValue(val) {

  if (
    val === "" ||
    val === "." ||
    val === "-" ||
    val === "-." ||
    val === "0."
  ) return true;

  if ((val.match(/\./g) || []).length > 1) return false;

  return true;
}

// =========================
// 🔥 KEY HANDLER
// =========================
function handleKey(key) {

  let newValue = currentValue.toString();

  switch (key) {

    case "⌫":
      if (cursorPos > 0) {
        newValue =
          newValue.slice(0, cursorPos - 1) +
          newValue.slice(cursorPos);
        cursorPos--;
      }
      break;

    case "CLEAR":
      currentValue = "";
      cursorPos = 0;
      updateDisplay();
      sendValue();
      return;

    case "ENTER":

  // ✅ send value
  if (typeof window.writeValueFromKeyboard === "function") {
    window.writeValueFromKeyboard(currentValue);
  }

  // ✅ CLOSE HTML KEYBOARD
  const kb = document.getElementById("keyboard");
  if (kb) {
    kb.classList.add("hidden");
  }

  return;

    default:

      let char = key;

      if (char === "." && currentValue === "") {
        newValue = "0.";
        cursorPos = 2;
      } else {

        if (char === "." && currentValue.includes(".")) return;

        newValue =
          newValue.slice(0, cursorPos) +
          char +
          newValue.slice(cursorPos);

        cursorPos++;
      }
  }

  if (isValidValue(newValue)) {
  currentValue = newValue;
  updateDisplay();

  // 🔥🔥 ADD THIS HERE (THIS IS THE PLACE YOU ASKED)

  const num = parseFloat(currentValue);

  if (!isNaN(num) && currentMin != null && currentMax != null) {

    if (num < currentMin || num > currentMax) {
      showErrorEffect(true);   // 🔴 red + disable ENTER
    } else {
      showErrorEffect(false);  // ✅ normal + enable ENTER
    }

  } else {
    showErrorEffect(false); // reset when empty / invalid
  }
}
}

// =========================
// 🔥 UPDATE DISPLAY
// =========================
// function updateDisplay() {
//   const display = document.querySelector(".display");
//   if (display) display.innerText = currentValue;
// }

// function updateDisplay() {
//   const display = document.querySelector(".display");

//   if (display) {
//     display.innerText = currentUnit
//       ? `${currentValue} ${currentUnit}`
//       : currentValue;
//   }
// }

function updateDisplay() {
  const display = document.querySelector(".display");

  if (display) {
    display.innerHTML = currentUnit
      ? `${currentValue} <span class="unit">${currentUnit}</span>`
      : currentValue;
  }
}



// =========================
// 🔥 BUILD UI
// =========================
function toggleTheme(btn) {
  document.body.classList.toggle("light-theme");

  if (document.body.classList.contains("light-theme")) {
    btn.innerText = "☀️";
  } else {
    btn.innerText = "🌙";
  }
}

function buildKeyboard() {

  keyboardDiv.innerHTML = "";

  // =========================
  // 🔥 HEADER (TITLE + TOGGLE)
  // =========================
  const header = document.createElement("div");
  header.className = "header";

  // 🔹 TITLE
  const fieldBox = document.createElement("div");
  fieldBox.className = "field-box";
  fieldBox.innerText = currentTitle || "-";

  // 🌙 TOGGLE BUTTON
  const themeBtn = document.createElement("div");
  themeBtn.className = "theme-btn";

  // set correct icon
  themeBtn.innerText = document.body.classList.contains("light-theme") ? "☀️" : "🌙";

  // toggle with reference
  themeBtn.onclick = () => toggleTheme(themeBtn);

  // append inside header
  header.appendChild(fieldBox);
  header.appendChild(themeBtn);

  keyboardDiv.appendChild(header);

  // =========================
  // 🔥 DISPLAY
  // =========================
  const displayDiv = document.createElement("div");
  displayDiv.className = "display";

  displayDiv.innerHTML = currentUnit
    ? `${currentValue} <span class="unit">${currentUnit}</span>`
    : currentValue || "";

  keyboardDiv.appendChild(displayDiv);

  // =========================
  // 🔥 INFO ROW
  // =========================
  // const infoRow = document.createElement("div");
  // infoRow.className = "info-row";

  // const oldValueDiv = document.createElement("div");
  // oldValueDiv.className = "old-value";
  // oldValueDiv.innerText = "Old Value: " + (oldValue || "-");

  // const rangeDiv = document.createElement("div");
  // rangeDiv.className = "range-bar";
  // rangeDiv.innerHTML = `
  //   <span>Min: ${currentMin != null ? formatValue(currentMin) : "-"}</span>
  //   <span>Max: ${currentMax != null ? formatValue(currentMax) : "-"}</span>
  // `;

  // infoRow.appendChild(oldValueDiv);
  // infoRow.appendChild(rangeDiv);

  // keyboardDiv.appendChild(infoRow);

  // =========================
  // 🔥 KEYS GRID
  // =========================
  const keysGrid = document.createElement("div");
  keysGrid.className = "keys-grid";

  layout.flat().forEach(key => {

    const keyDiv = document.createElement("div");
    keyDiv.className = "key";

    if (key === "ENTER") keyDiv.classList.add("enter");
    if (key === "⌫") keyDiv.classList.add("backspace");
    if (key === "CLEAR") keyDiv.classList.add("clear");

    keyDiv.innerText = key;
    keyDiv.onclick = () => handleKey(key);

    keysGrid.appendChild(keyDiv);
  });

  keyboardDiv.appendChild(keysGrid);
}

// =========================
// 🔥 DRAG KEYBOARD
// =========================
const keyboard = document.getElementById("keyboard");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

keyboard.addEventListener("mousedown", (e) => {
  isDragging = true;

  offsetX = e.clientX - keyboard.offsetLeft;
  offsetY = e.clientY - keyboard.offsetTop;

  keyboard.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const kbWidth = keyboard.offsetWidth;
  const kbHeight = keyboard.offsetHeight;

  let newLeft = e.clientX - offsetX;
  let newTop  = e.clientY - offsetY;

  // 🔥 HORIZONTAL LIMIT
  if (newLeft < 0) newLeft = 0;
  if (newLeft + kbWidth > screenWidth) {
    newLeft = screenWidth - kbWidth;
  }

  // 🔥 VERTICAL LIMIT
  if (newTop < 0) newTop = 0;
  if (newTop + kbHeight > screenHeight) {
    newTop = screenHeight - kbHeight;
  }

  keyboard.style.left = newLeft + "px";
  keyboard.style.top  = newTop + "px";

  keyboard.style.transform = "none";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  keyboard.style.cursor = "grab";
});

// =========================
// 🔥 INIT EMPTY
// =========================
// buildKeyboard();