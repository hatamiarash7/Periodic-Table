/**
 * Element detail dialog: facts list, animated Bohr model and navigation.
 */
(function (PT) {
  "use strict";

  const { el, svg, toPersianDigits, formatMass, describe } = PT;
  const SHELL_NAMES = ["K", "L", "M", "N", "O", "P", "Q"];
  const BLOCK_NAMES = { s: "s", p: "p", d: "d", f: "f" };

  let dialog;
  let body;
  let current = null;
  let onChange = () => {};

  /** Build the SVG Bohr model: one rotating orbit per electron shell. */
  function createBohrModel(element) {
    const size = 200;
    const centre = size / 2;
    const shells = element.shells;
    const first = 26;
    const step =
      shells.length > 1 ? Math.min(16, (92 - first) / (shells.length - 1)) : 0;

    const root = svg("svg", {
      viewBox: `0 0 ${size} ${size}`,
      class: "bohr",
      role: "img",
      "aria-label": `مدل بور ${element.nameFa}: ${shells
        .map(toPersianDigits)
        .join("، ")} الکترون در لایه‌ها`,
    });

    root.append(
      svg("circle", { class: "bohr__nucleus", cx: centre, cy: centre, r: 12 }),
    );

    shells.forEach((count, index) => {
      const radius = shells.length > 1 ? first + index * step : 50;
      const orbit = svg("g", { class: "bohr__orbit" });
      orbit.style.animationDuration = `${14 + index * 7}s`;
      if (index % 2) orbit.style.animationDirection = "reverse";

      orbit.append(
        svg("circle", {
          class: "bohr__ring",
          cx: centre,
          cy: centre,
          r: radius,
        }),
      );
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        orbit.append(
          svg("circle", {
            class: "bohr__electron",
            cx: (centre + radius * Math.cos(angle)).toFixed(2),
            cy: (centre + radius * Math.sin(angle)).toFixed(2),
            r: 2.6,
          }),
        );
      }
      root.append(orbit);
    });
    return root;
  }

  function fact(label, value, options = {}) {
    return [
      el("dt", { text: label }),
      el("dd", { text: value, attrs: options.ltr ? { dir: "ltr" } : {} }),
    ];
  }

  function render(element) {
    const { block } = describe(element);
    const facts = [
      ...fact("عدد اتمی", toPersianDigits(element.number)),
      ...fact("جرم اتمی", formatMass(element.mass)),
      ...fact("دسته", PT.CATEGORY_BY_KEY[element.category].label),
      ...fact(
        "گروه",
        element.group === null ? "—" : toPersianDigits(element.group),
      ),
      ...fact("تناوب", toPersianDigits(element.period)),
      ...fact("بلوک", BLOCK_NAMES[block]),
      ...fact(
        "لایه‌های الکترونی",
        element.shells.map(toPersianDigits).join(", "),
        { ltr: true },
      ),
    ];

    const shellList = el(
      "ul",
      { className: "shells", attrs: { "aria-label": "الکترون در هر لایه" } },
      element.shells.map((count, index) =>
        el("li", {}, [
          el("span", {
            className: "shells__name",
            text: SHELL_NAMES[index],
            attrs: { lang: "en" },
          }),
          el("span", { text: toPersianDigits(count) }),
        ]),
      ),
    );

    const header = el("header", { className: "detail__header" }, [
      el("div", { className: "detail__tile" }, [
        el("span", {
          className: "detail__number",
          text: toPersianDigits(element.number),
        }),
        el("span", {
          className: "detail__symbol",
          text: element.symbol,
          attrs: { lang: "en" },
        }),
        el("span", {
          className: "detail__mass",
          text: formatMass(element.mass),
        }),
      ]),
      el("div", { className: "detail__titles" }, [
        el("h2", {
          className: "detail__title",
          text: element.nameFa,
          attrs: { id: "detail-title" },
        }),
        el("p", {
          className: "detail__subtitle",
          text: element.name,
          attrs: { lang: "en", dir: "ltr" },
        }),
        el("span", {
          className: "tag",
          text: PT.CATEGORY_BY_KEY[element.category].label,
        }),
      ]),
    ]);

    const closeButton = el("button", {
      className: "icon-button detail__close",
      attrs: { type: "button", "aria-label": "بستن", "data-close": "" },
      text: "✕",
    });

    const nav = el("footer", { className: "detail__nav" }, [
      el("button", {
        className: "button",
        text: "‹ عنصر قبلی",
        attrs: {
          type: "button",
          "data-step": "-1",
          ...(element.number === 1 ? { disabled: "" } : {}),
        },
      }),
      el("button", {
        className: "button",
        text: "عنصر بعدی ›",
        attrs: {
          type: "button",
          "data-step": "1",
          ...(element.number === 118 ? { disabled: "" } : {}),
        },
      }),
    ]);

    body.replaceChildren(
      closeButton,
      header,
      el("div", { className: "detail__content" }, [
        el("div", { className: "detail__model" }, [
          createBohrModel(element),
          shellList,
        ]),
        el("dl", { className: "facts" }, facts),
      ]),
      nav,
    );
    dialog.dataset.category = element.category;
  }

  function step(delta) {
    const target = PT.ELEMENTS.find((e) => e.number === current.number + delta);
    if (target) show(target);
  }

  function show(element) {
    current = element;
    const activeStep = document.activeElement?.dataset?.step;
    render(element);
    if (dialog.open && activeStep !== undefined) {
      // Keep keyboard focus on the navigation button that was just used.
      const next = body.querySelector(
        `[data-step="${activeStep}"]:not([disabled])`,
      );
      (next || dialog).focus();
    }
    if (!dialog.open) dialog.showModal();
    onChange(element);
  }

  PT.Detail = {
    init(dialogNode, callbacks = {}) {
      dialog = dialogNode;
      body = dialog.querySelector(".detail");
      onChange = callbacks.onChange || onChange;

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog || event.target.closest("[data-close]")) {
          dialog.close();
          return;
        }
        const stepButton = event.target.closest("[data-step]");
        if (stepButton) step(Number(stepButton.dataset.step));
      });

      dialog.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") step(1);
        else if (event.key === "ArrowRight") step(-1);
        else return;
        event.preventDefault();
      });

      dialog.addEventListener("close", () => {
        const last = current;
        current = null;
        (callbacks.onClose || (() => {}))(last);
      });
    },

    open: show,
    close: () => dialog.open && dialog.close(),
    get current() {
      return current;
    },
  };
})((window.PT = window.PT || {}));
