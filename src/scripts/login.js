// ===============================
// TOAST NOTIFICATION
// ===============================

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.innerText = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===============================
// TROCA DE FORM
// ===============================

function showForm(type) {
  const forms = document.querySelectorAll(".form");
  forms.forEach(form => form.classList.remove("active"));
  document.getElementById(type + "Form").classList.add("active");
}

// ===============================
// LOCAL STORAGE
// ===============================

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// ===============================
// LOGIN
// ===============================

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = this.querySelector("input[type='email']").value.trim();
  const password = this.querySelector("input[type='password']").value.trim();

  if (!email || !password) {
    showToast("Por favor preencher todos os campos", "error");
    this.reset();
    return;
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    showToast("Login bem Sucedido", "success");

    localStorage.setItem("loggedUser", JSON.stringify(user));

    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);
  } else {
    showToast("Usuário ou Senha esta incorreto", "error");
  }

  this.reset();
});

// ===============================
// CADASTRO
// ===============================

document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = this.querySelector("input[type='text']").value.trim();
    const email = this.querySelector("input[type='email']").value.trim();
    const password = this.querySelector("input[type='password']").value.trim();

    if (!name || !email || !password) {
      showToast("Por favor preencher todos os campos", "error");
      this.reset();
      return;
    }

    const users = getUsers();
    const emailExists = users.some((u) => u.email === email);

    if (emailExists) {
      showToast("E-mail já existe", "error");
      this.reset();
      return;
    }

    users.push({ name, email, password });
    saveUsers(users);

    showToast("Cadastro Bem Sucedido", "success");
    this.reset();
    showForm("login");
  });

// ===============================
// RECUPERAR SENHA
// ===============================

document
  .getElementById("recoverForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const email = this.querySelector("input[type='email']").value.trim();

    if (!email) {
      showToast("Por favor preencher todos os campos", "error");
      this.reset();
      return;
    }

    const users = getUsers();
    const userExists = users.some((u) => u.email === email);

    if (userExists) {
      showToast("Senha enviada no seu E-mail", "success");
      showForm("login");
    } else {
      showToast("E-mail não cadastrado", "error");
    }

    this.reset();
  });