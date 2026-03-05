/* global loggedUser */
const reportTypeSelect = document.getElementById("reportTypeSelect");
const sheetSelect = document.getElementById("sheetSelect");
const excelBtn = document.getElementById("excelBtn");
const pdfBtn = document.getElementById("pdfBtn");
const helperText = document.getElementById("reportHint");

const REPORT_SOURCES = {
  rebanho: {
    label: "Rebanho",
    storageKey: "herdSheets",
    emptyMessage: "Nenhuma planilha de rebanho encontrada.",
    columns: [
      { key: "number", header: "Número" },
      { key: "name", header: "Nome" },
      { key: "sex", header: "Sexo" },
      { key: "birthDate", header: "Nascimento" },
      { key: "category", header: "Categoria" },
      { key: "breed", header: "Raça" },
      { key: "weight", header: "Peso (Kg)" },
      { key: "status", header: "Status" },
      { key: "statusStartDate", header: "Início Status" }
    ],
    normalizeRow(animal) {
      return {
        number: animal.number,
        name: animal.name,
        sex: animal.sex,
        birthDate: formatDate(animal.birthDate),
        category: animal.category,
        breed: animal.breed,
        weight: animal.weight,
        status: animal.status,
        statusStartDate: formatDate(animal.statusStartDate)
      };
    }
  },

  inseminacao: {
    label: "Inseminação",
    storageKey: "inseminationSheets",
    emptyMessage: "Nenhuma planilha de inseminação encontrada.",
    columns: [
      { key: "number", header: "Número" },
      { key: "name", header: "Nome do Animal" },
      { key: "minutes", header: "Minutos" },
      { key: "seconds", header: "Segundos" },
      { key: "bull", header: "Touro Utilizado" },
      { key: "mucus", header: "Muco" },
      { key: "registrationDate", header: "Data Registro" },
      { key: "observation", header: "Observação" }
    ],
    normalizeRow(proc) {
      return {
        number: proc.number,
        name: proc.name,
        minutes: `${proc.minutes}'`,
        seconds: `${proc.seconds}"`,
        bull: proc.bull,
        mucus: proc.mucus,
        registrationDate: formatDate(proc.registrationDate),
        observation: proc.observation || ""
      };
    }
  },

  // Quando tiver novos módulos, é só acrescentar:
  // alimentacao: { ... },
  // vacinacao: { ... }
};

let cache = {
  sheets: [],
  selectedSource: null,
  selectedSheet: null
};

document.addEventListener("DOMContentLoaded", () => {
  populateReportTypeOptions();
  setupListeners();
});

function populateReportTypeOptions() {
  Object.entries(REPORT_SOURCES).forEach(([value, cfg]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = cfg.label;
    reportTypeSelect.appendChild(option);
  });
}

function setupListeners() {
  reportTypeSelect.addEventListener("change", handleReportTypeChange);
  sheetSelect.addEventListener("change", handleSheetChange);
  excelBtn.addEventListener("click", exportExcel);
  pdfBtn.addEventListener("click", exportPdf);
}

function handleReportTypeChange(event) {
  const selected = event.target.value;
  resetSheetSelect();

  if (!selected) {
    cache.selectedSource = null;
    helperText.textContent = "Escolha o tipo de relatório para listar as planilhas disponíveis.";
    toggleActionButtons(false);
    return;
  }

  const source = REPORT_SOURCES[selected];
  cache.selectedSource = source;

  cache.sheets = loadSheetsFromStorage(source.storageKey);
  if (!cache.sheets.length) {
    helperText.textContent = source.emptyMessage;
    showToast(source.emptyMessage, "info");
    toggleActionButtons(false);
    return;
  }

  helperText.textContent = `${source.label}: selecione a planilha que deseja exportar.`;
  fillSheetSelect(cache.sheets);
  sheetSelect.disabled = false;
}

function handleSheetChange() {
  const sheetId = sheetSelect.value;
  if (!sheetId) {
    cache.selectedSheet = null;
    toggleActionButtons(false);
    return;
  }

  cache.selectedSheet = cache.sheets.find((sheet) => sheet.id === sheetId);
  toggleActionButtons(Boolean(cache.selectedSheet));
}

function fillSheetSelect(sheets) {
  sheetSelect.innerHTML = '<option value="">-- Selecione a planilha --</option>';
  sheets
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((sheet) => {
      const option = document.createElement("option");
      option.value = sheet.id;
      option.textContent = `${sheet.name} — criada em ${formatDateTime(sheet.createdAt)}`;
      sheetSelect.appendChild(option);
    });
}

function resetSheetSelect() {
  sheetSelect.innerHTML = '<option value="">Selecione o tipo primeiro</option>';
  sheetSelect.disabled = true;
  cache.selectedSheet = null;
  toggleActionButtons(false);
}

function toggleActionButtons(enable) {
  excelBtn.disabled = !enable;
  pdfBtn.disabled = !enable;
}

function loadSheetsFromStorage(storageKey) {
  const stored = JSON.parse(localStorage.getItem(storageKey)) || {};
  const userSheets = stored[loggedUser?.email] || [];

  return userSheets.map((sheet) => ({
    ...sheet,
    animals: sheet.animals || [],
    procedures: sheet.procedures || []
  }));
}

/* ---------- EXPORTAÇÃO ---------- */

function exportExcel() {
  if (!validateSelection()) return;

  const { selectedSource, selectedSheet } = cache;
  const rows = extractRows(selectedSource, selectedSheet);
  if (!rows.length) {
    showToast("A planilha está vazia. Nada para exportar.", "info");
    return;
  }

  const worksheetData = [
    selectedSource.columns.map((col) => col.header),
    ...rows.map((row) =>
      selectedSource.columns.map((col) => row[col.key] ?? "")
    )
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  const sheetName = sanitizeSheetName(selectedSheet.name);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const filename = `${sheetName}-${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, filename);
  showToast("Relatório em Excel gerado com sucesso!", "success");
}

function exportPdf() {
  if (!validateSelection()) return;

  const { selectedSource, selectedSheet } = cache;
  const rows = extractRows(selectedSource, selectedSheet);
  if (!rows.length) {
    showToast("A planilha está vazia. Nada para exportar.", "info");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`${selectedSource.label} - ${selectedSheet.name}`, 14, 18);

  doc.autoTable({
    head: [selectedSource.columns.map((col) => col.header)],
    body: rows.map((row) =>
      selectedSource.columns.map((col) => String(row[col.key] ?? ""))
    ),
    startY: 26,
    styles: {
      fontSize: 10,
      halign: "left",
      valign: "middle"
    },
    headStyles: {
      fillColor: [30, 127, 79],
      textColor: 255
    },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });

  const filename = `${sanitizeSheetName(selectedSheet.name)}-${Date.now()}.pdf`;
  doc.save(filename);
  showToast("Relatório em PDF gerado com sucesso!", "success");
}

function validateSelection() {
  if (!cache.selectedSource || !cache.selectedSheet) {
    showToast("Selecione o tipo de relatório e a planilha.", "error");
    return false;
  }
  return true;
}

function extractRows(source, sheet) {
  let rawData = [];

  if (source.storageKey === "herdSheets") {
    rawData = sheet.animals || [];
  } else if (source.storageKey === "inseminationSheets") {
    rawData = sheet.procedures || [];
  } else {
    rawData = sheet.items || [];
  }

  return rawData.map((item) => source.normalizeRow(item));
}

/* ---------- FUNÇÕES UTILITÁRIAS ---------- */

function sanitizeSheetName(name) {
  return (name || "relatorio")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 30) || "relatorio";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date)) return "";
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(timestamp) {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp);
}

/* ---------- Toast reutilizado ---------- */
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const existing = container.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  const normalizedType = ["success", "danger", "error", "info"].includes(type)
    ? type
    : "default";

  toast.className = `toast ${normalizedType}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => toast.classList.remove("show"), 3600);

  toast.addEventListener("transitionend", () => {
    if (!toast.classList.contains("show")) {
      toast.remove();
    }
    if (!container.children.length) {
      container.remove();
    }
  });
}