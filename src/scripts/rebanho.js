const SHEETS_STORAGE_KEY = "herdSheets";

const createSheetBtn = document.getElementById("createSheetBtn");
const sheetListEl = document.getElementById("sheetList");
const sheetListSection = document.getElementById("sheetListSection");

const sheetHeader = document.getElementById("sheetHeader");
const sheetDetailsSection = document.getElementById("sheetDetails");
const sheetTitleEl = document.getElementById("sheetTitle");
const animalListEl = document.getElementById("animalList");
const backToListBtn = document.getElementById("backToListBtn");
const addAnimalBtn = document.getElementById("addAnimalBtn");
const animalSearchInput = document.getElementById("animalSearchInput");

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

const addAnimalModal = document.getElementById("addAnimalModal");
const addAnimalModalTitle = document.getElementById("addAnimalModalTitle");
const closeAddAnimalModalBtn = document.getElementById("closeAddAnimalModal");
const cancelAddAnimalBtn = document.getElementById("cancelAddAnimalBtn");
const submitAnimalBtn = document.getElementById("submitAnimalBtn");
const addAnimalForm = document.getElementById("addAnimalForm");

const animalNumberInput = document.getElementById("animalNumber");
const animalNameInput = document.getElementById("animalName");
const animalSexSelect = document.getElementById("animalSex");
const animalBirthDateInput = document.getElementById("animalBirthDate");
const animalCategorySelect = document.getElementById("animalCategory");
const animalBreedInput = document.getElementById("animalBreed");
const animalWeightInput = document.getElementById("animalWeight");
const animalStatusSelect = document.getElementById("animalStatus");
const animalStatusStartInput = document.getElementById("animalStatusStartDate");

const deleteAnimalModal = document.getElementById("deleteAnimalModal");
const deleteAnimalMessage = document.getElementById("deleteAnimalMessage");
const cancelDeleteAnimalBtn = document.getElementById("cancelDeleteAnimalBtn");
const confirmDeleteAnimalBtn = document.getElementById("confirmDeleteAnimalBtn");

let sheets = [];
let sheetModalMode = "create";
let sheetBeingEdited = null;
let sheetBeingDeleted = null;

let currentSheet = null;

let animalModalMode = "create";
let animalBeingEdited = null;
let animalBeingDeleted = null;

let animalSearchTerm = "";

document.addEventListener("DOMContentLoaded", () => {
  sheets = loadSheets();
  renderSheets();
});

/* -------------------- Local Storage -------------------- */

function loadSheets() {
  const stored = JSON.parse(localStorage.getItem(SHEETS_STORAGE_KEY)) || {};
  return (stored[loggedUser.email] || []).map((sheet) => ({
    ...sheet,
    animals: sheet.animals || [],
  }));
}

function saveSheets(updatedList) {
  const stored = JSON.parse(localStorage.getItem(SHEETS_STORAGE_KEY)) || {};
  stored[loggedUser.email] = updatedList;
  localStorage.setItem(SHEETS_STORAGE_KEY, JSON.stringify(stored));
}

/* -------------------- Funções auxiliares -------------------- */

function sortAnimalsByNumber(animals) {
  return animals
    .slice()
    .sort((a, b) => Number(a.number || 0) - Number(b.number || 0));
}

/* -------------------- Renderização -------------------- */

function renderSheets() {
  sheetListEl.innerHTML = "";

  if (!sheets.length) {
    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = "Nenhuma planilha de rebanho criada ainda.";
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
      animals: [],
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

  currentSheet = { ...target };
  currentSheet.animals = sortAnimalsByNumber(currentSheet.animals || []);

  animalSearchTerm = "";
  if (animalSearchInput) {
    animalSearchInput.value = "";
  }

  sheetHeader.classList.add("hidden");
  sheetListSection.classList.add("hidden");
  sheetDetailsSection.classList.remove("hidden");
  renderSheetDetails();
}

function closeSheetDetails() {
  sheetDetailsSection.classList.add("hidden");
  sheetListSection.classList.remove("hidden");
  sheetHeader.classList.remove("hidden");
  currentSheet = null;
  animalSearchTerm = "";
  if (animalSearchInput) {
    animalSearchInput.value = "";
  }
}

backToListBtn.addEventListener("click", closeSheetDetails);

if (animalSearchInput) {
  animalSearchInput.addEventListener("input", (event) => {
    animalSearchTerm = event.target.value || "";
    renderSheetDetails();
  });
}

/* -------------------- Modal Adicionar / Editar Animal -------------------- */

function openAddAnimalModal() {
  if (!currentSheet) {
    showToast("Abra uma planilha para adicionar animais", "error");
    return;
  }
  animalModalMode = "create";
  animalBeingEdited = null;
  addAnimalModalTitle.textContent = "Adicionar Novo Animal";
  submitAnimalBtn.textContent = "Adicionar";
  addAnimalForm.reset();

  addAnimalModal.classList.add("active");
  setTimeout(() => animalNumberInput.focus(), 80);
}

function openEditAnimal(animalId) {
  if (!currentSheet) return;
  const animal = currentSheet.animals.find((a) => a.id === animalId);
  if (!animal) return;

  animalModalMode = "edit";
  animalBeingEdited = animal;

  addAnimalModalTitle.textContent = "Editar Animal";
  submitAnimalBtn.textContent = "Salvar Alterações";

  animalNumberInput.value = animal.number;
  animalNameInput.value = animal.name;
  animalSexSelect.value = animal.sex;
  animalBirthDateInput.value = animal.birthDate || "";
  animalCategorySelect.value = animal.category;
  animalBreedInput.value = animal.breed;
  animalWeightInput.value = animal.weight;
  animalStatusSelect.value = animal.status;
  animalStatusStartInput.value = animal.statusStartDate || "";

  addAnimalModal.classList.add("active");
  setTimeout(() => animalNameInput.focus(), 80);
}

function closeAddAnimalModal() {
  addAnimalModal.classList.remove("active");
  addAnimalForm.reset();
  animalModalMode = "create";
  animalBeingEdited = null;
}

addAnimalBtn.addEventListener("click", openAddAnimalModal);
closeAddAnimalModalBtn.addEventListener("click", closeAddAnimalModal);
cancelAddAnimalBtn.addEventListener("click", closeAddAnimalModal);

addAnimalModal.addEventListener("click", (event) => {
  if (event.target === addAnimalModal) {
    closeAddAnimalModal();
  }
});

addAnimalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentSheet) return;

  const number = animalNumberInput.value.trim();
  const name = animalNameInput.value.trim();
  const sex = animalSexSelect.value;
  const birthDate = animalBirthDateInput.value;
  const category = animalCategorySelect.value;
  const breed = animalBreedInput.value.trim();
  const weight = animalWeightInput.value.trim();
  const status = animalStatusSelect.value;
  const statusStart = animalStatusStartInput.value;

  if (
    !number ||
    !name ||
    !sex ||
    !birthDate ||
    !category ||
    !breed ||
    !weight ||
    !status
  ) {
    showToast("Preencha todos os campos obrigatórios", "error");
    return;
  }

  if (animalModalMode === "edit" && animalBeingEdited) {
    currentSheet.animals = currentSheet.animals.map((animal) => {
      if (animal.id !== animalBeingEdited.id) return animal;

      const updated = {
        ...animal,
        number,
        name,
        sex,
        birthDate,
        category,
        breed,
        weight: Number(weight),
        status,
        statusStartDate: statusStart || null,
        updatedAt: Date.now(),
      };

      delete updated.motherName;
      delete updated.fatherName;

      return updated;
    });

    showToast("Animal atualizado com sucesso", "success");
  } else {
    const newAnimal = {
      id: `animal-${Date.now()}`,
      number,
      name,
      sex,
      birthDate,
      category,
      breed,
      weight: Number(weight),
      status,
      statusStartDate: statusStart || null,
      createdAt: Date.now(),
      updatedAt: null,
    };

    currentSheet.animals = [...(currentSheet.animals || []), newAnimal];
    showToast("Animal adicionado com sucesso", "success");
  }

  currentSheet.animals = sortAnimalsByNumber(currentSheet.animals);

  sheets = sheets.map((sheet) =>
    sheet.id === currentSheet.id ? { ...currentSheet } : sheet
  );

  saveSheets(sheets);
  renderSheetDetails();
  closeAddAnimalModal();
});

/* -------------------- Modal Exclusão Animal -------------------- */

function openDeleteAnimalModal(animal) {
  animalBeingDeleted = animal;
  deleteAnimalMessage.textContent = `O animal "${animal.name}" será removido desta planilha.`;
  deleteAnimalModal.classList.add("active");
}

function closeDeleteAnimalModal() {
  deleteAnimalModal.classList.remove("active");
  animalBeingDeleted = null;
}

cancelDeleteAnimalBtn.addEventListener("click", closeDeleteAnimalModal);
confirmDeleteAnimalBtn.addEventListener("click", () => {
  if (!animalBeingDeleted || !currentSheet) return;

  currentSheet.animals = currentSheet.animals.filter(
    (animal) => animal.id !== animalBeingDeleted.id
  );

  currentSheet.animals = sortAnimalsByNumber(currentSheet.animals);

  sheets = sheets.map((sheet) =>
    sheet.id === currentSheet.id ? { ...currentSheet } : sheet
  );

  saveSheets(sheets);
  renderSheetDetails();
  showToast("Animal excluído com sucesso", "danger");

  closeDeleteAnimalModal();
});

deleteAnimalModal.addEventListener("click", (event) => {
  if (event.target === deleteAnimalModal) {
    closeDeleteAnimalModal();
  }
});

/* -------------------- Renderização dos animais -------------------- */

function getFilteredAnimals() {
  if (!currentSheet) return [];

  const animals = sortAnimalsByNumber(currentSheet.animals || []);
  const term = animalSearchTerm.trim().toLowerCase();

  if (!term) return animals;

  return animals.filter((animal) => {
    const numberMatch = String(animal.number || "")
      .toLowerCase()
      .includes(term);
    const nameMatch = String(animal.name || "")
      .toLowerCase()
      .includes(term);
    return numberMatch || nameMatch;
  });
}

function renderSheetDetails() {
  if (!currentSheet) return;

  sheetTitleEl.textContent = currentSheet.name;
  const filteredAnimals = getFilteredAnimals();
  renderAnimalList(filteredAnimals);
}

function renderAnimalList(animals) {
  animalListEl.innerHTML = "";

  if (!animals.length) {
    const empty = document.createElement("p");
    empty.classList.add("empty-state");
    empty.textContent = animalSearchTerm.trim()
      ? "Nenhum animal encontrado para a busca."
      : "Nenhum animal cadastrado nesta planilha.";
    animalListEl.appendChild(empty);
    return;
  }

  animals.forEach((animal) => {
    const card = document.createElement("article");
    card.classList.add("animal-card");

    const header = document.createElement("div");
    header.classList.add("animal-card__header");

    const title = document.createElement("h4");
    title.textContent = `${animal.number} - ${animal.name}`;

    const badge = document.createElement("span");
    badge.classList.add("animal-badge");
    badge.textContent = animal.category;

    header.append(title, badge);

    const grid = document.createElement("div");
    grid.classList.add("animal-grid");

    const fields = [
      { label: "Sexo", value: animal.sex },
      { label: "Nascimento", value: formatDateShort(animal.birthDate) },
      { label: "Raça", value: animal.breed },
      { label: "Peso (Kg)", value: `${animal.weight.toFixed(1)} kg` },
      { label: "Status", value: animal.status },
      {
        label: "Início do Status",
        value: animal.statusStartDate
          ? `${formatDateShort(animal.statusStartDate)} (${daysSince(animal.statusStartDate)} dias)`
          : "—",
      },
    ];

    fields.forEach(({ label, value }) => {
      const field = document.createElement("div");
      field.classList.add("animal-field");

      const labelEl = document.createElement("span");
      labelEl.textContent = label;

      const valueEl = document.createElement("strong");
      valueEl.textContent = value;

      field.append(labelEl, valueEl);
      grid.appendChild(field);
    });

    const actionsRow = document.createElement("div");
    actionsRow.classList.add("animal-card__actions");

    const actions = document.createElement("div");
    actions.classList.add("animal-actions");

    const editBtn = document.createElement("button");
    editBtn.classList.add("animal-action-btn", "edit");
    editBtn.innerHTML = '<i class="fas fa-pen"></i> Editar';
    editBtn.title = "Editar animal";
    editBtn.addEventListener("click", () => openEditAnimal(animal.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("animal-action-btn", "delete");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir';
    deleteBtn.title = "Excluir animal";
    deleteBtn.addEventListener("click", () => openDeleteAnimalModal(animal));

    actions.append(editBtn, deleteBtn);
    actionsRow.append(actions);

    card.append(header, grid, actionsRow);
    animalListEl.appendChild(card);
  });
}

/* -------------------- Utilidades -------------------- */

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function formatDateShort(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date)) return "—";
  return date.toLocaleDateString("pt-BR");
}

function daysSince(value) {
  if (!value) return 0;
  const start = new Date(value);
  if (Number.isNaN(start)) return 0;

  const now = new Date();
  const diff = now.getTime() - start.getTime();

  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
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

  const toast = document.createElement("div");
  const normalizedType = ["success", "danger", "error", "info"].includes(type)
    ? type
    : "default";

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

