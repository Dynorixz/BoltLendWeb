const revealItems = document.querySelectorAll(".reveal");
const form = document.getElementById("applicationForm");
const toast = document.getElementById("toast");
const modal = document.getElementById("paymentModal");
const modalTitle = document.getElementById("modalTitle");
const modalProduct = document.getElementById("modalProduct");
const modalDescription = document.getElementById("modalDescription");
const modalConfirm = document.getElementById("modalConfirm");
const modalTriggers = document.querySelectorAll(".modal-trigger");
const modalCloseElements = document.querySelectorAll("[data-close-modal]");

let toastTimer = null;
let activeProduct = "Проходка";

const productMeta = {
  "Проходка": {
    title: "Оформление проходки",
    description:
      "После оплаты заполненная анкета будет рассмотрена администрацией. Доступ открывается после подтверждения.",
    action: "Перейти к оплате 100₽",
  },
  "Разбан": {
    title: "Оформление разбана",
    description:
      "После оплаты заявка на разбан будет отправлена на рассмотрение администрации. Повторный доступ выдается после решения.",
    action: "Перейти к оплате 500₽",
  },
};

if (revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

function validateTelegram(value) {
  return /^@?[a-zA-Z0-9_]{3,32}$/.test(value.trim());
}

function markFieldState(field, isInvalid) {
  field.classList.toggle("is-invalid", isInvalid);
}

function validateForm() {
  let isValid = true;
  const fields = form.querySelectorAll(".field");

  fields.forEach((field) => {
    const control = field.querySelector("input, textarea");
    if (!control) {
      return;
    }

    let invalid = false;
    const value = control.value.trim();

    if (control.hasAttribute("required") && value === "") {
      invalid = true;
    }

    if (!invalid && control.name === "telegram" && !validateTelegram(value)) {
      invalid = true;
    }

    if (!invalid && control.name === "age") {
      const age = Number(value);
      invalid = !Number.isInteger(age) || age < 10 || age > 99;
    }

    markFieldState(field, invalid);

    if (invalid) {
      isValid = false;
    }
  });

  return isValid;
}

if (form) {
  const inputs = form.querySelectorAll("input, textarea");

  inputs.forEach((control) => {
    control.addEventListener("input", () => {
      const field = control.closest(".field");
      if (!field) {
        return;
      }

      if (control.name === "telegram" && control.value.trim() !== "") {
        markFieldState(field, !validateTelegram(control.value));
        return;
      }

      if (control.name === "age" && control.value.trim() !== "") {
        const age = Number(control.value);
        markFieldState(field, !Number.isInteger(age) || age < 10 || age > 99);
        return;
      }

      markFieldState(field, control.value.trim() === "");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showToast("Заполните форму корректно, чтобы отправить заявку.");
      const firstInvalid = form.querySelector(".is-invalid input, .is-invalid textarea");
      firstInvalid?.focus();
      return;
    }

    form.reset();
    form.querySelectorAll(".field").forEach((field) => markFieldState(field, false));
    showToast("Заявка отправлена");
  });
}

function openModal(product) {
  activeProduct = product;
  const meta = productMeta[product] || productMeta["Проходка"];

  modalTitle.textContent = meta.title;
  modalProduct.textContent = product;
  modalDescription.textContent = meta.description;
  modalConfirm.textContent = meta.action;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

modalTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    openModal(trigger.dataset.product || "Проходка");
  });
});

modalCloseElements.forEach((element) => {
  element.addEventListener("click", closeModal);
});

modalConfirm?.addEventListener("click", () => {
  closeModal();
  showToast(`Переход к оплате: ${activeProduct}`);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});
