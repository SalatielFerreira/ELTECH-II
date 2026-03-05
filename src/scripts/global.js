// ===============================
// VERIFICAÇÃO DE LOGIN
// ===============================

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {
  window.location.href = "login.html";
}

document.getElementById("userName").innerText = loggedUser.name;

if (loggedUser.photo) {
  document.getElementById("userPhoto").src = loggedUser.photo;
}

// ===============================
// TOAST (PADRÃO IGUAL LOGIN)
// ===============================

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===============================
// MODAL CONFIGURAÇÕES
// ===============================

function openSettings() {
  document.getElementById("settingsModal").classList.add("active");
}

function closeSettings() {
  document.getElementById("settingsModal").classList.remove("active");
}

// ===============================
// UPLOAD FOTO
// ===============================

document.getElementById("photoInput").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function() {
    const imageBase64 = reader.result;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.email === loggedUser.email);

    if (index !== -1) {
      users[index].photo = imageBase64;
      localStorage.setItem("users", JSON.stringify(users));

      loggedUser.photo = imageBase64;
      localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

      document.getElementById("userPhoto").src = imageBase64;

      showToast("Foto atualizada com sucesso", "success");
    }
  };

  reader.readAsDataURL(file);
});

// ===============================
// ALTERAR SENHA
// ===============================

function changePassword() {

  const current = document.getElementById("currentPassword").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();

  if (!current || !newPass) {
    showToast("Preencha todos os campos", "error");
    return;
  }

  if (current !== loggedUser.password) {
    showToast("Senha atual incorreta", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.email === loggedUser.email);

  if (index !== -1) {
    users[index].password = newPass;
    localStorage.setItem("users", JSON.stringify(users));

    loggedUser.password = newPass;
    localStorage.setItem("loggedUser", JSON.stringify(loggedUser));

    document.getElementById("currentPassword").value = "";
    document.getElementById("newPassword").value = "";

    showToast("Atualização da senha bem sucedida", "success");
  }
}

// ===============================
// MODAL CONFIRMAÇÃO LOGOUT
// ===============================

function openLogoutModal() {
  document.getElementById("logoutModal").classList.add("active");
}

function closeLogoutModal() {
  document.getElementById("logoutModal").classList.remove("active");
}

function confirmLogout() {
  localStorage.removeItem("loggedUser");
  window.location.href = "login.html";
}