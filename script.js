// Calculator State
let currentInput = "0";
let previousInput = "";
let operator = null;
let shouldResetDisplay = false;
let history = [];

// DOM Elements
const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const sciPanel = document.getElementById("scientific-panel");
const historyPanel = document.getElementById("history-panel");
const historyList = document.getElementById("history-list");
const btnStandard = document.getElementById("btn-standard");
const btnScientific = document.getElementById("btn-scientific");
const btnHistoryToggle = document.getElementById("btn-history-toggle");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// Format Display Number
function formatNumber(numStr) {
  if (numStr === "Error" || numStr === "Infinity" || numStr === "NaN") return numStr;
  const num = parseFloat(numStr);
  if (isNaN(num)) return "0";
  if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  return numStr;
}

// Update UI Screen
function updateDisplay() {
  displayEl.textContent = formatNumber(currentInput);
}

// Input Digit / Period
function appendValue(val) {
  if (shouldResetDisplay) {
    currentInput = "";
    shouldResetDisplay = false;
  }
  if (val === "." && currentInput.includes(".")) return;
  if (currentInput === "0" && val !== ".") {
    currentInput = val;
  } else {
    currentInput += val;
  }
  updateDisplay();
}

// Handle Operations
function handleOperator(op) {
  if (operator !== null && !shouldResetDisplay) {
    calculate();
  }
  previousInput = currentInput;
  operator = op;
  shouldResetDisplay = true;
  const symbols = { add: "+", subtract: "−", multiply: "×", divide: "÷", percent: "%" };
  expressionEl.textContent = `${formatNumber(previousInput)} ${symbols[op] || op}`;
}

// Primary Calculation Logic
function calculate() {
  if (operator === null || shouldResetDisplay) return;

  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  let result = 0;

  if (isNaN(prev) || isNaN(curr)) return;

  switch (operator) {
    case "add":
      result = prev + curr;
      break;
    case "subtract":
      result = prev - curr;
      break;
    case "multiply":
      result = prev * curr;
      break;
    case "divide":
      if (curr === 0) {
        currentInput = "Error";
        updateDisplay();
        return;
      }
      result = prev / curr;
      break;
    case "percent":
      result = (prev * curr) / 100;
      break;
    case "pow":
      result = Math.pow(prev, curr);
      break;
    default:
      return;
  }

  const exprText = expressionEl.textContent + ` ${formatNumber(currentInput)} =`;
  const resultStr = String(Number(result.toFixed(10)));

  addHistoryItem(exprText, resultStr);

  currentInput = resultStr;
  operator = null;
  expressionEl.textContent = exprText;
  shouldResetDisplay = true;
  updateDisplay();
}

// Handle Scientific Operations
function handleScientific(action) {
  const val = parseFloat(currentInput);
  if (isNaN(val) && action !== "pi" && action !== "e") return;

  let res = 0;
  let expr = "";

  switch (action) {
    case "sin":
      res = Math.sin((val * Math.PI) / 180);
      expr = `sin(${val}°)`;
      break;
    case "cos":
      res = Math.cos((val * Math.PI) / 180);
      expr = `cos(${val}°)`;
      break;
    case "tan":
      res = Math.tan((val * Math.PI) / 180);
      expr = `tan(${val}°)`;
      break;
    case "ln":
      res = val > 0 ? Math.log(val) : "Error";
      expr = `ln(${val})`;
      break;
    case "log":
      res = val > 0 ? Math.log10(val) : "Error";
      expr = `log(${val})`;
      break;
    case "sqrt":
      res = val >= 0 ? Math.sqrt(val) : "Error";
      expr = `√(${val})`;
      break;
    case "sqr":
      res = val * val;
      expr = `sqr(${val})`;
      break;
    case "pi":
      res = Math.PI;
      expr = "π";
      break;
    case "e":
      res = Math.E;
      expr = "e";
      break;
    default:
      return;
  }

  const resStr = String(typeof res === "number" ? Number(res.toFixed(10)) : res);
  if (expr && resStr !== "Error") {
    addHistoryItem(expr, resStr);
  }
  currentInput = resStr;
  expressionEl.textContent = expr ? `${expr} =` : "";
  shouldResetDisplay = true;
  updateDisplay();
}

// Clear & Utility Actions
function clearAll() {
  currentInput = "0";
  previousInput = "";
  operator = null;
  shouldResetDisplay = false;
  expressionEl.textContent = "";
  updateDisplay();
}

function backspace() {
  if (shouldResetDisplay) return;
  if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith("-"))) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

function toggleNegate() {
  if (currentInput === "0") return;
  currentInput = currentInput.startsWith("-") ? currentInput.slice(1) : "-" + currentInput;
  updateDisplay();
}

// History Functions
function addHistoryItem(expr, res) {
  history.unshift({ expr, res });
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<li class="history-empty">No history yet</li>';
    return;
  }
  historyList.innerHTML = history
    .map(
      (item) => `
    <li class="history-item" onclick="useHistoryResult('${item.res}')">
      <div class="history-expr">${item.expr}</div>
      <div class="history-res">${item.res}</div>
    </li>
  `
    )
    .join("");
}

function useHistoryResult(val) {
  currentInput = val;
  shouldResetDisplay = true;
  updateDisplay();
}

// Event Listeners for Keypad & Scientific Buttons
document.querySelectorAll(".btn").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (value !== undefined) {
      appendValue(value);
    } else if (action) {
      if (["add", "subtract", "multiply", "divide", "percent", "pow"].includes(action)) {
        handleOperator(action);
      } else if (["sin", "cos", "tan", "ln", "log", "sqrt", "sqr", "pi", "e"].includes(action)) {
        handleScientific(action);
      } else if (action === "calculate") {
        calculate();
      } else if (action === "clear") {
        clearAll();
      } else if (action === "backspace") {
        backspace();
      } else if (action === "negate") {
        toggleNegate();
      }
    }
  });
});

// Mode Toggles
btnStandard.addEventListener("click", () => {
  btnStandard.classList.add("active");
  btnScientific.classList.remove("active");
  sciPanel.classList.add("hidden");
});

btnScientific.addEventListener("click", () => {
  btnScientific.classList.add("active");
  btnStandard.classList.remove("active");
  sciPanel.classList.remove("hidden");
});

btnHistoryToggle.addEventListener("click", () => {
  btnHistoryToggle.classList.toggle("active");
  historyPanel.classList.toggle("hidden");
});

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

// Keyboard Support
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") appendValue(e.key);
  if (e.key === ".") appendValue(".");
  if (e.key === "+") handleOperator("add");
  if (e.key === "-") handleOperator("subtract");
  if (e.key === "*") handleOperator("multiply");
  if (e.key === "/") {
    e.preventDefault();
    handleOperator("divide");
  }
  if (e.key === "%") handleOperator("percent");
  if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculate();
  }
  if (e.key === "Backspace") backspace();
  if (e.key === "Escape") clearAll();
});