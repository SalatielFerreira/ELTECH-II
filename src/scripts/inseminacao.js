const SHEETS_STORAGE_KEY = "inseminationSheets";

const createSheetBtn = document.getElementById("createSheetBtn");
const sheetListEl = document.getElementById("sheetList");
const sheetListSection = document.getElementById("sheetListSection");

const sheetHeader = document.getElementById("sheetHeader");
const sheetDetailsSection = document.getElementById("sheetDetails");
const sheetTitleEl = document.getElementById("sheetTitle");
const procedureListEl = document.getElementById("procedureList");
const backToListBtn = document.getElementById("backToListBtn");
const addProcedureBtn = document.getElementById("addProcedureBtn");

const procedureSearchInput = document.getElementById("procedureSearchInput");

const sheetModal = document.getElementById("sheetModal");
const sheetModalTitle = document.getElementById("sheetModalTitle");
const sheetForm = document.getElementById("sheetForm");
const sheetNameInput = document.getElementById("sheetName");
const closeSheetModalBtn = document.getElementById("closeSheetModal");
const cancelSheetBtn = document.getElementById("cancelSheetBtn");

const deleteSheetModal = document.getElementById("deleteSheetModal");
const deleteSheetMessage = document.getElementById("deleteSheetMessage");
const cancelDeleteSheetBtn = document.getElementById("cancelDeleteSheetBtn");
const confirmDeleteSheetBtn = document.getElementById("confirmDeleteSheetBtn");

const addProcedureModal = document.getElementById("addProcedureModal");
const addProcedureModalTitle = document.getElementById("addProcedureModalTitle");
const closeAddProcedureModalBtn = document.getElementById("closeAddProcedureModal");
const cancelAddProcedureBtn = document.getElementById("cancelAddProcedureBtn");
const submitProcedureBtn = document.getElementById("submitProcedureBtn");
const addProcedureForm = document.getElementById("addProcedureForm");

const procedureNumberInput = document.getElementById("procedureNumber");
const procedureNameInput = document.getElementById("procedureName");
const procedureMinutesInput = document.getElementById("procedureMinutes");
const procedureSecondsInput = document.getElementById("procedureSeconds");
const procedureBullInput = document.getElementById("procedureBull");
const procedureMucusSelect = document.getElementById("procedureMucus");
const procedureObservationInput = document.getElementById("procedureObservation");

const deleteProcedureModal = document.getElementById("deleteProcedureModal");
const deleteProcedureMessage = document.getElementById("deleteProcedureMessage");
const cancelDeleteProcedureBtn = document.getElementById("cancelDeleteProcedureBtn");
const confirmDeleteProcedureBtn = document.getElementById("confirmDeleteProcedureBtn");

let sheets = [];
let sheetModalMode = "create";
let sheetBeingEdited = null;
let sheetBeingDeleted = null;

let currentSheet = null;

let procedureModalMode = "create";
let procedureBeingEdited = null;
let procedureBeingDeleted = null;

let procedureSearchTerm = "";

/* -------------------- Inicialização -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  sheets = loadSheets();
  renderSheets();
});

/* -------------------- Local Storage -------------------- */

function loadSheets() {
  const stored = JSON.parse(localStorage.getItem(SHEETS_STORAGE_KEY)) || {};
  return (stored[loggedUser.email] || []).map((sheet) => ({
    ...sheet,
    procedures: sortProceduresByNumber(sheet.procedures || []),
  }));
}

function saveSheets(updatedList) {
  const stored = JSON.parse(localStorage.getItem(SHEETS_STORAGE_KEY)) || {};
  stored[loggedUser.email] = updatedList;
  localStorage.setItem(SHEETS_STORAGE_KEY, JSON.stringify(stored));
}

/* -------------------- Utilidades -------------------- */

function sortProceduresByNumber(list) {
  return (list || [])
    .slice()
    .sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
}

function formatProcedureTime(procedure) {
  // Alterado para 'minutes' e 'seconds'
  const min = Number(procedure.minutes || 0);
  const sec = Number(procedure.seconds || 0);
  const formattedMin = String(min).padStart(2, "0");
  const formattedSec = String(sec).padStart(2, "0");
  return `${formattedMin}' ${formattedSec}''`;
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const existing = container.querySelector(".toast");
  if (existing) {
    existing.remove();
  }

  const normalizedType = ["success", "danger", "error", "info"].includes(type)
    ? type
    : "default";

  const toast = document.createElement("div");
  toast.className = `toast ${normalizedType}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3600);

  toast.addEventListener("transitionend", () => {
    if (!toast.classList.contains("show")) {
      toast.remove();
    }
    if (!container.children.length) {
      container.remove();
    }
  });
}

/* -------------------- Renderização das planilhas -------------------- */

function renderSheets() {
  sheetListEl.innerHTML = "";

  if (!sheets.length) {
    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = "Nenhuma planilha de inseminação criada ainda.";
    sheetListEl.appendChild(empty);
    return;
  }

  sheets
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((sheet) => {
      const item = document.createElement("article");
      item.classList.add("sheet-item");

      const info = document.createElement("div");
      info.classList.add("sheet-info");

      const title = document.createElement("h4");
      title.textContent = sheet.name;

      const meta = document.createElement("span");
      meta.classList.add("sheet-date");
      meta.textContent = `Criada em ${formatDate(sheet.createdAt)}`;

      info.append(title, meta);

      const actions = document.createElement("div");
      actions.classList.add("sheet-actions");

      const openBtn = document.createElement("button");
      openBtn.classList.add("sheet-action-btn", "open");
      openBtn.innerHTML = '<i class="fas fa-folder-open"></i> Abrir';
      openBtn.title = "Abrir planilha";
      openBtn.addEventListener("click", () => openSheet(sheet.id));

      const editBtn = document.createElement("button");
      editBtn.classList.add("sheet-action-btn", "edit");
      editBtn.innerHTML = '<i class="fas fa-pen"></i> Editar';
      editBtn.title = "Editar nome da planilha";
      editBtn.addEventListener("click", () => openSheetModal("edit", sheet));

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("sheet-action-btn", "delete");
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
      deleteBtn.title = "Excluir planilha";
      deleteBtn.addEventListener("click", () => openDeleteSheetModal(sheet));

      actions.append(openBtn, editBtn, deleteBtn);
      item.append(info, actions);

      sheetListEl.appendChild(item);
    });
}

/* -------------------- Modal Criar/Editar Planilha -------------------- */

function openSheetModal(mode, sheet = null) {
  sheetModalMode = mode;
  sheetBeingEdited = sheet;

  if (mode === "edit" && sheet) {
    sheetModalTitle.textContent = "Editar Planilha";
    sheetNameInput.value = sheet.name;
  } else {
    sheetModalTitle.textContent = "Nova Planilha";
    sheetNameInput.value = "";
  }

  sheetModal.classList.add("active");
  setTimeout(() => sheetNameInput.focus(), 50);
}

function closeSheetModal() {
  sheetModal.classList.remove("active");
  sheetForm.reset();
  sheetModalMode = "create";
  sheetBeingEdited = null;
}

createSheetBtn.addEventListener("click", () => openSheetModal("create"));
closeSheetModalBtn.addEventListener("click", closeSheetModal);
cancelSheetBtn.addEventListener("click", closeSheetModal);

sheetModal.addEventListener("click", (event) => {
  if (event.target === sheetModal) {
    closeSheetModal();
  }
});

sheetForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = sheetNameInput.value.trim();

  if (!name) {
    showToast("Informe um nome para a planilha", "error");
    return;
  }

  if (sheetModalMode === "edit" && sheetBeingEdited) {
    sheets = sheets.map((sheet) =>
      sheet.id === sheetBeingEdited.id ? { ...sheet, name } : sheet
    );

    if (currentSheet && currentSheet.id === sheetBeingEdited.id) {
      currentSheet = { ...currentSheet, name };
      renderSheetDetails();
    }

    showToast("Planilha atualizada com sucesso", "success");
  } else {
    const newSheet = {
      id: `sheet-${Date.now()}`,
      name,
      createdAt: Date.now(),
      procedures: [],
    };
    sheets.push(newSheet);
    showToast("Planilha criada com sucesso", "success");
  }

  saveSheets(sheets);
  renderSheets();
  closeSheetModal();
});

/* -------------------- Modal Exclusão Planilha -------------------- */

function openDeleteSheetModal(sheet) {
  sheetBeingDeleted = sheet;
  deleteSheetMessage.textContent = `A planilha "${sheet.name}" será removida definitivamente.`;
  deleteSheetModal.classList.add("active");
}

function closeDeleteSheetModal() {
  deleteSheetModal.classList.remove("active");
  sheetBeingDeleted = null;
}

cancelDeleteSheetBtn.addEventListener("click", closeDeleteSheetModal);
confirmDeleteSheetBtn.addEventListener("click", () => {
  if (!sheetBeingDeleted) return;

  sheets = sheets.filter((sheet) => sheet.id !== sheetBeingDeleted.id);
  saveSheets(sheets);
  renderSheets();

  if (currentSheet && currentSheet.id === sheetBeingDeleted.id) {
    closeSheetDetails();
  }

  showToast("Planilha excluída com sucesso", "danger");
  closeDeleteSheetModal();
});

deleteSheetModal.addEventListener("click", (event) => {
  if (event.target === deleteSheetModal) {
    closeDeleteSheetModal();
  }
});

/* -------------------- Detalhes da Planilha -------------------- */

function openSheet(sheetId) {
  const target = sheets.find((sheet) => sheet.id === sheetId);
  if (!target) return;

  currentSheet = {
    ...target,
    procedures: sortProceduresByNumber(target.procedures || []),
  };

  procedureSearchTerm = "";
  if (procedureSearchInput) {
    procedureSearchInput.value = "";
  }

  renderSheetDetails();

  sheetHeader.classList.add("hidden");
  sheetListSection.classList.add("hidden");
  sheetDetailsSection.classList.remove("hidden");
}

function closeSheetDetails() {
  sheetDetailsSection.classList.add("hidden");
  sheetListSection.classList.remove("hidden");
  sheetHeader.classList.remove("hidden");
  currentSheet = null;
  procedureSearchTerm = "";
  if (procedureSearchInput) {
    procedureSearchInput.value = "";
  }
}

backToListBtn.addEventListener("click", closeSheetDetails);

/* -------------------- Busca -------------------- */

if (procedureSearchInput) {
  procedureSearchInput.addEventListener("input", (event) => {
    procedureSearchTerm = event.target.value || "";
    renderSheetDetails();
  });
}

function getFilteredProcedures() {
  if (!currentSheet) return [];

  const procedures = sortProceduresByNumber(currentSheet.procedures || []);
  const term = procedureSearchTerm.trim().toLowerCase();

  if (!term) return procedures;

  return procedures.filter((procedure) => {
    const numberMatch = String(procedure.number || "")
      .toLowerCase()
      .includes(term);
    const nameMatch = String(procedure.name || "")
      .toLowerCase()
      .includes(term);
    const bullMatch = String(procedure.bull || "")
      .toLowerCase()
      .includes(term);

    return numberMatch || nameMatch || bullMatch;
  });
}

/* -------------------- Modal Registrar / Editar Procedimento -------------------- */

function openAddProcedureModal() {
  if (!currentSheet) {
    showToast("Abra uma planilha para adicionar registros", "error");
    return;
  }
  procedureModalMode = "create";
  procedureBeingEdited = null;
  addProcedureModalTitle.textContent = "Registrar Inseminação";
  submitProcedureBtn.textContent = "Registrar";
  addProcedureForm.reset();

  addProcedureModal.classList.add("active");
  setTimeout(() => procedureNumberInput.focus(), 80);
}

function openEditProcedure(procedureId) {
  if (!currentSheet) return;
  const procedure = currentSheet.procedures.find((p) => p.id === procedureId);
  if (!procedure) return;

  procedureModalMode = "edit";
  procedureBeingEdited = procedure;

  addProcedureModalTitle.textContent = "Editar Registro";
  submitProcedureBtn.textContent = "Salvar Alterações";

  procedureNumberInput.value = procedure.number;
  procedureNameInput.value = procedure.name;
  // CORREÇÃO: Usar 'minutes' e 'seconds' ao invés de 'timeMinutes' e 'timeSeconds'
  procedureMinutesInput.value = procedure.minutes;
  procedureSecondsInput.value = procedure.seconds;
  procedureBullInput.value = procedure.bull;
  procedureMucusSelect.value = procedure.mucus;
  procedureObservationInput.value = procedure.observation || "";

  addProcedureModal.classList.add("active");
  setTimeout(() => procedureNameInput.focus(), 80);
}

function closeAddProcedureModal() {
  addProcedureModal.classList.remove("active");
  addProcedureForm.reset();
  procedureModalMode = "create";
  procedureBeingEdited = null;
}

addProcedureBtn.addEventListener("click", openAddProcedureModal);
closeAddProcedureModalBtn.addEventListener("click", closeAddProcedureModal);
cancelAddProcedureBtn.addEventListener("click", closeAddProcedureModal);

addProcedureModal.addEventListener("click", (event) => {
  if (event.target === addProcedureModal) {
    closeAddProcedureModal();
  }
});

addProcedureForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentSheet) return;

  const number = procedureNumberInput.value.trim();
  const name = procedureNameInput.value.trim();
  const minutes = procedureMinutesInput.value.trim();
  const seconds = procedureSecondsInput.value.trim();
  const bull = procedureBullInput.value.trim();
  const mucus = procedureMucusSelect.value;
  const observation = procedureObservationInput.value.trim();

  if (
    !number ||
    !name ||
    minutes === "" ||
    seconds === "" ||
    !bull ||
    !mucus
  ) {
    showToast("Preencha todos os campos obrigatórios", "error");
    return;
  }

  const minutesValue = Math.max(0, Number(minutes));
  let secondsValue = Math.max(0, Number(seconds));
  if (secondsValue > 59) secondsValue = 59;

  if (procedureModalMode === "edit" && procedureBeingEdited) {
    currentSheet.procedures = currentSheet.procedures.map((procedure) => {
      if (procedure.id !== procedureBeingEdited.id) return procedure;

      return {
        ...procedure,
        number,
        name,
        // CORREÇÃO: Salvar como 'minutes' e 'seconds'
        minutes: minutesValue,
        seconds: secondsValue,
        bull,
        mucus,
        observation,
        updatedAt: Date.now(),
        // 'registrationDate' não é atualizada na edição
      };
    });

    currentSheet.procedures = sortProceduresByNumber(currentSheet.procedures);

    sheets = sheets.map((sheet) =>
      sheet.id === currentSheet.id ? { ...currentSheet } : sheet
    );

    saveSheets(sheets);
    renderSheetDetails();
    showToast("Registro atualizado com sucesso", "success");
  } else {
    const newProcedure = {
      id: `procedure-${Date.now()}`,
      number,
      name,
      // CORREÇÃO: Salvar como 'minutes' e 'seconds'
      minutes: minutesValue,
      seconds: secondsValue,
      bull,
      mucus,
      observation,
      createdAt: Date.now(),
      updatedAt: null,
      // CORREÇÃO: Adicionar a data de registro aqui
      registrationDate: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    };

    currentSheet.procedures = sortProceduresByNumber([
      ...(currentSheet.procedures || []),
      newProcedure,
    ]);

    sheets = sheets.map((sheet) =>
      sheet.id === currentSheet.id ? { ...currentSheet } : sheet
    );

    saveSheets(sheets);
    renderSheetDetails();
    showToast("Registro adicionado com sucesso", "success");
  }

  closeAddProcedureModal();
});

/* -------------------- Modal Exclusão Procedimento -------------------- */

function openDeleteProcedureModal(procedure) {
  procedureBeingDeleted = procedure;
  deleteProcedureMessage.textContent = `O registro do animal "${procedure.name}" será removido desta planilha.`;
  deleteProcedureModal.classList.add("active");
}

function closeDeleteProcedureModal() {
  deleteProcedureModal.classList.remove("active");
  procedureBeingDeleted = null;
}

cancelDeleteProcedureBtn.addEventListener("click", closeDeleteProcedureModal);
confirmDeleteProcedureBtn.addEventListener("click", () => {
  if (!procedureBeingDeleted || !currentSheet) return;

  currentSheet.procedures = currentSheet.procedures.filter(
    (procedure) => procedure.id !== procedureBeingDeleted.id
  );

  currentSheet.procedures = sortProceduresByNumber(currentSheet.procedures);

  sheets = sheets.map((sheet) =>
    sheet.id === currentSheet.id ? { ...currentSheet } : sheet
  );

  saveSheets(sheets);
  renderSheetDetails();
  showToast("Registro excluído com sucesso", "danger");

  closeDeleteProcedureModal();
});

deleteProcedureModal.addEventListener("click", (event) => {
  if (event.target === deleteProcedureModal) {
    closeDeleteProcedureModal();
  }
});

/* -------------------- Renderização dos procedimentos -------------------- */

function renderSheetDetails() {
  if (!currentSheet) return;

  sheetTitleEl.textContent = currentSheet.name;
  const filteredProcedures = getFilteredProcedures();
  renderProcedureList(filteredProcedures);
}

function renderProcedureList(procedures) {
  procedureListEl.innerHTML = "";

  if (!procedures.length) {
    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = procedureSearchTerm.trim()
      ? "Nenhum registro encontrado para a busca."
      : "Nenhum procedimento cadastrado nesta planilha.";
    procedureListEl.appendChild(empty);
    return;
  }

  procedures.forEach((procedure) => {
    const card = document.createElement("article");
    card.classList.add("procedure-card");

    const header = document.createElement("div");
    header.classList.add("procedure-card__header");

    const title = document.createElement("h4");
    title.textContent = `${procedure.number} - ${procedure.name}`;

    const badge = document.createElement("span");
    badge.classList.add("procedure-badge");
    badge.textContent = `Muco: ${procedure.mucus}`;

    header.append(title, badge);

    const grid = document.createElement("div");
    grid.classList.add("procedure-grid");

    const fields = [
      { label: "Tempo", value: formatProcedureTime(procedure) },
      { label: "Touro Utilizado", value: procedure.bull },
      {
        label: "Observação",
        value: procedure.observation ? procedure.observation : "—",
      },
    ];

    fields.forEach(({ label, value }) => {
      const field = document.createElement("div");
      field.classList.add("procedure-field");

      const labelEl = document.createElement("span");
      labelEl.textContent = label;

      const valueEl = document.createElement("strong");
      valueEl.textContent = value;

      field.append(labelEl, valueEl);
      grid.appendChild(field);
    });

    const actionsRow = document.createElement("div");
    actionsRow.classList.add("procedure-card__actions");

    const actions = document.createElement("div");
    actions.classList.add("procedure-actions");

    const editBtn = document.createElement("button");
    editBtn.classList.add("procedure-action-btn", "edit");
    editBtn.innerHTML = '<i class="fas fa-pen"></i> Editar';
    editBtn.title = "Editar registro";
    editBtn.addEventListener("click", () => openEditProcedure(procedure.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("procedure-action-btn", "delete");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir'; 
    deleteBtn.title = "Excluir registro";
    deleteBtn.addEventListener("click", () =>
      openDeleteProcedureModal(procedure)
    );

    actions.append(editBtn, deleteBtn);
    actionsRow.append(actions);

    card.append(header, grid, actionsRow);
    procedureListEl.appendChild(card);
  });
}