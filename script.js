let income = 0;
let spendingLimit = 0;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const incomeInput = document.getElementById("incomeInput");
const limitInput = document.getElementById("limitInput");
const categoryInput = document.getElementById("categoryInput");
const expenseInput = document.getElementById("expenseInput");
const addBtn = document.getElementById("addBtn");
const downloadBtn = document.getElementById("downloadBtn");

income = Number(localStorage.getItem("income")) || 0;
spendingLimit = Number(localStorage.getItem("limit")) || 0;

incomeInput.value = income;
limitInput.value = spendingLimit;

incomeInput.addEventListener("input", () => {
  income = Number(incomeInput.value);
  localStorage.setItem("income", income);
  updateUI();
});

limitInput.addEventListener("input", () => {
  spendingLimit = Number(limitInput.value);
  localStorage.setItem("limit", spendingLimit);
  updateUI();
});

addBtn.addEventListener("click", addExpense);
downloadBtn.addEventListener("click", downloadReport);

function addExpense() {
  const cat = categoryInput.value.trim();
  const amt = Number(expenseInput.value);
  if (!cat || amt <= 0) return;

  expenses.push({ category: cat, amount: amt });
  localStorage.setItem("expenses", JSON.stringify(expenses));

  categoryInput.value = "";
  expenseInput.value = "";
  updateUI();
}

function editExpense(i) {
  const newAmt = prompt("Enter new amount:", expenses[i].amount);
  if (newAmt === null) return;
  const num = Number(newAmt);
  if (num <= 0) return;

  expenses[i].amount = num;
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
}

function removeExpense(i) {
  expenses.splice(i, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
}

function downloadReport() {
  let csv = "Category,Amount\n";
  expenses.forEach(e => {
    csv += `${e.category},${e.amount}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expense_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function updateUI() {
  document.getElementById("incomeCard").innerText = `Income: ₹${income}`;
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  document.getElementById("expenseCard").innerText = `Total Expense: ₹${totalExp}`;
  document.getElementById("savingsCard").innerText = `Savings: ₹${income - totalExp}`;

  let map = {};
  expenses.forEach(e => (map[e.category] = (map[e.category] || 0) + e.amount));
  let highest = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
  document.getElementById("highestCard").innerText = highest ? `Highest: ${highest[0]} (₹${highest[1]})` : "Highest: -";

  document.getElementById("limitWarn").style.display = spendingLimit && totalExp > spendingLimit ? "block" : "none";

  document.getElementById("expenseList").innerHTML = expenses
    .map(
      (e, i) => `
      <div class="expense-item">
        <span>${e.category}</span>
        <span>₹${e.amount}
          <button onclick="editExpense(${i})">Edit</button>
          <button onclick="removeExpense(${i})">X</button>
        </span>
      </div>`
    )
    .join("");

  renderChart(map);
}

function renderChart(map) {
  const max = Math.max(...Object.values(map), 0);
  const barContainer = document.getElementById("barContainer");
  const barLabels = document.getElementById("barLabels");

  barContainer.innerHTML = "";
  barLabels.innerHTML = "";

  Object.entries(map).forEach(([cat, val]) => {
    const h = max ? (val / max) * 200 : 0;
    barContainer.innerHTML += `<div class="bar" style="height:${h}px">${val}</div>`;
    barLabels.innerHTML += `<div>${cat}</div>`;
  });
}

updateUI();

