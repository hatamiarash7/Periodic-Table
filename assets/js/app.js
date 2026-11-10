/** Entry point: wires the table, legend, search, theme toggle and dialog. */
(function (PT) {
  "use strict";

  const { el, toPersianDigits, formatMass } = PT;
  const THEME_KEY = "periodic-table-theme";

  const $ = (selector) => document.querySelector(selector);

  /* ---------- Legend (category filters) ---------- */

  function initLegend() {
    const list = $("#legend");
    const counts = PT.Table.countByCategory();
    const buttons = PT.CATEGORIES.map((category) => {
      const button = el(
        "button",
        {
          className: "chip",
          dataset: { category: category.key },
          attrs: { type: "button", "aria-pressed": "false" },
        },
        [
          el("span", {
            className: "chip__dot",
            attrs: { "aria-hidden": "true" },
          }),
          el("span", { text: category.label }),
          el("span", {
            className: "chip__count",
            text: toPersianDigits(counts[category.key]),
          }),
        ],
      );
      list.append(el("li", {}, [button]));
      return button;
    });

    function select(key) {
      PT.Table.setCategory(key);
      buttons.forEach((button) => {
        const active = button.dataset.category === key;
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("is-inactive", Boolean(key) && !active);
      });
      $("#reset").hidden = !key && !$("#search").value;
    }

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".chip");
      if (!button) return;
      const isActive = button.getAttribute("aria-pressed") === "true";
      select(isActive ? null : button.dataset.category);
    });

    return select;
  }

  /* ---------- Hover / focus preview card ---------- */

  function initPreview() {
    const card = $("#preview");
    const idle = card.innerHTML;

    return (element) => {
      if (!element) {
        card.innerHTML = idle;
        card.removeAttribute("data-category");
        return;
      }
      card.dataset.category = element.category;
      card.replaceChildren(
        el("div", {
          className: "preview__symbol",
          text: element.symbol,
          attrs: { lang: "en" },
        }),
        el("div", { className: "preview__info" }, [
          el("strong", { text: element.nameFa }),
          el("span", { text: element.name, attrs: { lang: "en", dir: "ltr" } }),
          el("span", {
            text: `${PT.CATEGORY_BY_KEY[element.category].label} · عدد اتمی ${toPersianDigits(
              element.number,
            )} · جرم ${formatMass(element.mass)}`,
          }),
        ]),
      );
    };
  }

  /* ---------- Theme ---------- */

  function initTheme() {
    const root = document.documentElement;
    const button = $("#theme-toggle");

    const current = () =>
      root.dataset.theme ||
      (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

    const sync = () => {
      const isDark = current() === "dark";
      button.setAttribute("aria-pressed", String(isDark));
      button.setAttribute(
        "aria-label",
        isDark ? "تغییر به پوستهٔ روشن" : "تغییر به پوستهٔ تیره",
      );
      button.textContent = isDark ? "☀" : "☾";
    };

    button.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (_) {
        /* storage may be unavailable (private mode); the choice just won't persist */
      }
      sync();
    });
    sync();
  }

  /* ---------- URL hash (#Fe opens iron) ---------- */

  function elementFromHash() {
    const symbol = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    return PT.ELEMENTS.find((e) => e.symbol.toLowerCase() === symbol) || null;
  }

  function setHash(hash) {
    history.replaceState(
      null,
      "",
      hash ? `#${hash}` : location.pathname + location.search,
    );
  }

  /* ---------- Boot ---------- */

  function init() {
    const updatePreview = initPreview();

    PT.Table.init($("#table"), {
      onSelect: (element) => PT.Detail.open(element),
      onPreview: updatePreview,
    });

    PT.Detail.init($("#detail"), {
      onChange: (element) => setHash(element.symbol),
      onClose: (element) => {
        setHash("");
        if (element) PT.Table.focusCell(element.number);
      },
    });

    const selectCategory = initLegend();
    const search = $("#search");
    const reset = $("#reset");

    search.addEventListener("input", () => {
      PT.Table.setQuery(search.value);
      reset.hidden = !search.value && !$("#legend [aria-pressed='true']");
    });
    search.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const [first] = PT.Table.matching();
        if (first && PT.Table.matching().length < PT.ELEMENTS.length)
          PT.Detail.open(first);
      } else if (event.key === "Escape") {
        search.value = "";
        search.dispatchEvent(new Event("input"));
      }
    });
    reset.addEventListener("click", () => {
      search.value = "";
      search.dispatchEvent(new Event("input"));
      selectCategory(null);
    });

    // "/" focuses the search box, like many modern sites.
    document.addEventListener("keydown", (event) => {
      const typing = /^(input|textarea|select)$/i.test(event.target.tagName);
      if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        search.focus();
      }
    });

    const openFromHash = () => {
      const element = elementFromHash();
      if (element) PT.Detail.open(element);
      else PT.Detail.close();
    };
    window.addEventListener("hashchange", () => {
      const element = elementFromHash();
      if (element && element !== PT.Detail.current) PT.Detail.open(element);
    });

    initTheme();
    openFromHash();
    document.documentElement.classList.add("is-ready");
  }

  init();
})((window.PT = window.PT || {}));
