/*
 * Monta o site a partir de data/site.json.
 * Todo texto vem do JSON e é inserido com textContent (nunca innerHTML).
 */
"use strict";

(() => {
  const DATA_URL = "data/site.json";
  const COPY_RESET_MS = 2500;

  const DEFAULT_LABELS = {
    seeCoupons: "Ver cupons",
    contact: "Fale comigo",
    couponLabel: "Cupom",
    copyButton: "Copiar",
    copied: "Copiado!",
    copiedStatus: "Cupom {code} copiado.",
    copyFailed: "Não deu para copiar automaticamente. O código {code} ficou selecionado para você copiar.",
    newTab: "(abre em nova aba)",
  };

  const app = document.getElementById("app");
  const fallbackText = document.getElementById("fallback-text");

  /* ---------- utilitários ---------- */

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value === true ? "" : String(value));
    }
    for (const child of [].concat(children)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child);
    }
    return node;
  }

  function fill(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) =>
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
    );
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function isWebUrl(value) {
    if (!isNonEmptyString(value)) return false;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  // Caminhos de imagem precisam ser relativos (funcionam na raiz e em subpastas).
  function isRelativePath(value) {
    return isNonEmptyString(value) && !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("/");
  }

  function slug(value) {
    return String(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "parceiro";
  }

  function arrowIcon() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "icon");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", "M5 11 11 5M6 5h5v5");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.6");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
  }

  function externalLink(href, label, newTabLabel, className) {
    return el("a", { class: className, href, target: "_blank", rel: "noopener noreferrer" }, [
      el("span", { text: label }),
      arrowIcon(),
      el("span", { class: "visually-hidden", text: " " + newTabLabel }),
    ]);
  }

  /* ---------- validação ---------- */

  function validImage(image) {
    return !!image && isRelativePath(image.src) &&
      Number.isFinite(image.width) && image.width > 0 &&
      Number.isFinite(image.height) && image.height > 0 &&
      typeof image.alt === "string";
  }

  function validate(data) {
    const problems = [];
    if (!data || typeof data !== "object") throw new Error("O arquivo de dados não contém um objeto JSON.");
    const { profile, instagram, partners } = data;
    if (!profile || !isNonEmptyString(profile.name)) throw new Error("Falta profile.name no site.json.");
    if (!instagram || !isWebUrl(instagram.url)) throw new Error("Falta um instagram.url válido no site.json.");
    if (!Array.isArray(partners)) throw new Error("partners precisa ser uma lista no site.json.");

    const seenIds = new Set();
    const activePartners = [];
    partners.forEach((partner, index) => {
      if (!partner || partner.enabled === false) return;
      if (!isNonEmptyString(partner.name)) return problems.push(`partners[${index}]: falta o nome.`);
      if (!isNonEmptyString(partner.coupon)) return problems.push(`${partner.name}: falta o cupom.`);
      if (!isWebUrl(partner.url)) return problems.push(`${partner.name}: o link não é um endereço http(s) válido.`);

      let id = slug(partner.id || partner.name);
      while (seenIds.has(id)) id += "-2";
      seenIds.add(id);

      let image = null;
      if (partner.image) {
        if (validImage(partner.image)) image = partner.image;
        else problems.push(`${partner.name}: a foto foi ignorada (src, width, height ou alt inválidos).`);
      }
      activePartners.push({ ...partner, id, image });
    });

    if (problems.length) console.warn("Ajustes necessários em site.json:\n- " + problems.join("\n- "));
    return { ...data, partners: activePartners, labels: { ...DEFAULT_LABELS, ...(data.labels || {}) } };
  }

  /* ---------- imagens ---------- */

  function picture(image, { sizes, loading = "lazy", priority, className } = {}) {
    const img = el("img", {
      src: image.src,
      width: image.width,
      height: image.height,
      alt: image.alt,
      loading,
      decoding: "async",
      fetchpriority: priority,
    });
    if (isNonEmptyString(image.position)) img.style.objectPosition = image.position;
    const children = [];
    if (isNonEmptyString(image.srcset)) {
      children.push(el("source", { type: "image/webp", srcset: image.srcset, sizes }));
    }
    children.push(img);
    return el("picture", { class: className }, children);
  }

  /* ---------- copiar cupom ---------- */

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* tenta o método antigo abaixo */
      }
    }
    const area = el("textarea", { readonly: true, "aria-hidden": "true", class: "copy-buffer" });
    area.value = text;
    document.body.append(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }

  function selectText(node) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  /* ---------- seções ---------- */

  function renderHero(data) {
    const { profile, instagram, labels } = data;
    return el("header", { class: "hero" }, [
      validImage(profile.portrait)
        ? picture(profile.portrait, { sizes: "120px", loading: "eager", priority: "high", className: "hero__photo" })
        : null,
      el("h1", { class: "hero__name", text: profile.name }),
      isNonEmptyString(profile.handle) ? el("p", { class: "hero__handle", text: profile.handle }) : null,
      isNonEmptyString(profile.tagline) ? el("p", { class: "hero__tagline", text: profile.tagline }) : null,
      isNonEmptyString(profile.intro) ? el("p", { class: "hero__intro", text: profile.intro }) : null,
      el("div", { class: "hero__actions" }, [
        data.partners.length
          ? el("a", { class: "button button--primary", href: "#cupons", text: labels.seeCoupons })
          : null,
        externalLink(instagram.url, labels.contact, labels.newTab, "button button--secondary"),
      ]),
    ]);
  }

  function renderCard(partner, labels) {
    const titleId = `titulo-${partner.id}`;
    const codeId = `cupom-${partner.id}`;

    const code = el("code", { class: "coupon__code", id: codeId, text: partner.coupon });
    const buttonLabel = el("span", { text: labels.copyButton });
    const copyButton = el("button", {
      class: "coupon__copy",
      type: "button",
      "aria-describedby": codeId,
    }, [buttonLabel]);
    const status = el("p", { class: "card__status", role: "status", "aria-live": "polite" });

    let resetTimer;
    copyButton.addEventListener("click", async () => {
      clearTimeout(resetTimer);
      const ok = await copyText(partner.coupon);
      if (ok) {
        buttonLabel.textContent = labels.copied;
        copyButton.classList.add("is-copied");
        status.classList.remove("is-error");
        status.textContent = fill(labels.copiedStatus, { code: partner.coupon });
        resetTimer = setTimeout(() => {
          buttonLabel.textContent = labels.copyButton;
          copyButton.classList.remove("is-copied");
        }, COPY_RESET_MS);
      } else {
        buttonLabel.textContent = labels.copyButton;
        copyButton.classList.remove("is-copied");
        selectText(code);
        status.classList.add("is-error");
        status.textContent = fill(labels.copyFailed, { code: partner.coupon });
      }
    });

    return el("li", { class: "card", id: `parceiro-${partner.id}` }, [
      el("article", { class: "card__inner", "aria-labelledby": titleId }, [
        el("div", { class: "card__head" }, [
          partner.image ? picture(partner.image, { sizes: "84px", className: "card__photo" }) : null,
          el("div", { class: "card__title" }, [
            el("h3", { class: "card__name", id: titleId, text: partner.name }),
            isNonEmptyString(partner.destinationNote)
              ? el("p", { class: "card__note", text: partner.destinationNote })
              : null,
          ]),
        ]),
        el("div", { class: "coupon" }, [
          el("span", { class: "coupon__label", text: labels.couponLabel }),
          code,
          copyButton,
        ]),
        status,
        externalLink(partner.url, partner.ctaLabel || "Visitar a loja", labels.newTab, "button button--primary button--block"),
      ]),
    ]);
  }

  function renderCoupons(data) {
    const section = data.coupons || {};
    const body = data.partners.length
      ? el("ul", { class: "cards" }, data.partners.map((partner) => renderCard(partner, data.labels)))
      : el("p", { class: "notice", text: "Nenhum cupom disponível no momento. Confira as novidades no Instagram." });
    return el("section", { class: "coupons", id: "cupons", "aria-labelledby": "cupons-title", tabindex: "-1" }, [
      el("div", { class: "section-head" }, [
        el("h2", { class: "section-title", id: "cupons-title", text: section.title || "Meus cupons" }),
        isNonEmptyString(section.howTo) ? el("p", { class: "section-howto", text: section.howTo }) : null,
      ]),
      body,
      isNonEmptyString(section.note) ? el("p", { class: "section-note", text: section.note }) : null,
    ]);
  }

  function renderWork(data) {
    const work = data.work;
    if (!work || !isNonEmptyString(work.title)) return null;
    return el("section", { class: "work", "aria-labelledby": "parcerias-title" }, [
      el("h2", { class: "work__title", id: "parcerias-title", text: work.title }),
      isNonEmptyString(work.text) ? el("p", { class: "work__text", text: work.text }) : null,
      externalLink(data.instagram.url, work.ctaLabel || "Falar pelo Instagram", data.labels.newTab, "button button--secondary"),
    ]);
  }

  function renderFooter(data) {
    const { profile, instagram, labels } = data;
    return el("footer", { class: "site-footer" }, [
      el("p", { class: "site-footer__name", text: profile.name }),
      externalLink(instagram.url, instagram.handle || profile.handle || "Instagram", labels.newTab, "site-footer__link"),
    ]);
  }

  /* ---------- inicialização ---------- */

  function showError(message) {
    app.replaceChildren();
    app.removeAttribute("aria-busy");
    document.documentElement.classList.add("has-error");
    const hint = location.protocol === "file:"
      ? " Abra o site por um servidor local (veja o README), e não clicando duas vezes no arquivo."
      : "";
    fallbackText.textContent = `Não foi possível carregar os cupons agora. ${message}${hint}`;
  }

  async function init() {
    let raw;
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`O arquivo de dados respondeu com erro ${response.status}.`);
      raw = await response.json().catch(() => {
        throw new Error("O arquivo site.json tem um erro de formatação (JSON inválido).");
      });
    } catch (error) {
      console.error(error);
      showError(error instanceof TypeError ? "O arquivo de dados não pôde ser lido." : error.message);
      return;
    }

    let data;
    try {
      data = validate(raw);
    } catch (error) {
      console.error(error);
      showError(error.message);
      return;
    }

    app.replaceChildren(...[renderHero(data), renderCoupons(data), renderWork(data)].filter(Boolean));
    app.removeAttribute("aria-busy");
    document.body.append(renderFooter(data));

    // Se a página foi aberta já com âncora (ex.: .../#parceiro-avvi), rola até ela.
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  init();
})();
