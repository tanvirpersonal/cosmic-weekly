/**
 * Contact page: the pitch form has no backend. After validation it opens the
 * visitor's email app with a ready-made message (mailto:), and the address can
 * also be copied.
 */
import { h, qs, qsa, append } from "../core/dom.js";
import { getTopics } from "../core/data.js";
import { toast } from "../components/toast.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const RULES = {
  name: (v) => (v.length < 2 ? "Please tell us your name." : ""),
  email: (v) => (!EMAIL_RE.test(v) ? "Please enter a valid email address." : ""),
  title: (v) => (v.length < 4 ? "Give your story a working title." : ""),
  message: (v) => (v.length < 30 ? "Tell us a little more (at least a couple of sentences)." : ""),
};

function setError(form, name, message) {
  const input = form.elements[name];
  const field = input.closest(".field");
  const error = qs(`#pitch-${name}-error`);
  field.classList.toggle("has-error", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message;
}

function validateField(form, name) {
  const message = RULES[name](form.elements[name].value.trim());
  setError(form, name, message);
  return !message;
}

function buildMailto(email, data) {
  const subject = `Pitch: ${data.title}`;
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Topic: ${data.topic}`,
    "",
    data.message,
  ].join("\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Email address copied", { type: "success" });
  } catch {
    toast("Couldn't copy automatically. Please copy it by hand.", { type: "error" });
  }
}

export async function init({ site }) {
  const form = qs("#pitch-form");
  if (!form) return;

  // Contact details
  const emailEl = qs("#contact-email");
  if (emailEl) emailEl.replaceChildren(h("a", { href: `mailto:${site.email}` }, site.email));
  qs("#copy-email")?.addEventListener("click", () => copy(site.email));

  // Topic options come from data/topics.json so they never drift
  try {
    const topics = await getTopics();
    const select = form.elements.topic;
    select.replaceChildren();
    append(select, topics.map((t) => h("option", { value: t.name }, t.name)), h("option", { value: "Other" }, "Other"));
  } catch {
    /* the static "Other" option stays */
  }

  // Validate on blur, and clear an error as soon as the field becomes valid
  for (const name of Object.keys(RULES)) {
    const input = form.elements[name];
    input.addEventListener("blur", () => validateField(form, name));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validateField(form, name);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.keys(RULES).map((name) => validateField(form, name));
    if (!results.every(Boolean)) {
      qsa(".has-error .input, .has-error .textarea", form)[0]?.focus();
      toast("Please fix the highlighted fields.", { type: "error" });
      return;
    }

    const data = Object.fromEntries(
      ["name", "email", "topic", "title", "message"].map((key) => [key, form.elements[key].value.trim()])
    );

    toast("Opening your email app…");
    window.location.href = buildMailto(site.email, data);
  });
}
