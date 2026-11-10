/**
 * Renders the periodic table grid and handles filtering / searching.
 *
 * The table is a CSS grid; every element is a <button> so it is reachable by
 * keyboard and announced correctly by screen readers.
 */
(function (PT) {
  "use strict";

  const { el, toPersianDigits, formatMass, normalize, describe } = PT;

  const state = { category: null, query: "" };
  /** @type {Map<number, {data: object, node: HTMLElement, haystack: string[]}>} */
  const cells = new Map();
  const placeholders = [];
  let handlers = { onSelect() {}, onPreview() {} };

  const categoryLabel = (key) => PT.CATEGORY_BY_KEY[key].label;

  function createCell(data) {
    const { column, row } = describe(data);
    const node = el(
      "button",
      {
        className: "element",
        dataset: { category: data.category, number: data.number },
        attrs: {
          type: "button",
          "aria-label": `${data.nameFa}، ${data.symbol}، عدد اتمی ${toPersianDigits(
            data.number,
          )}`,
        },
      },
      [
        el("span", {
          className: "element__number",
          text: toPersianDigits(data.number),
        }),
        el("span", {
          className: "element__symbol",
          text: data.symbol,
          attrs: { lang: "en" },
        }),
        el("span", { className: "element__name", text: data.nameFa }),
        el("span", { className: "element__mass", text: formatMass(data.mass) }),
      ],
    );
    node.style.gridColumn = column;
    node.style.gridRow = row;

    node.addEventListener("click", () => handlers.onSelect(data, node));
    node.addEventListener("pointerenter", () => handlers.onPreview(data));
    node.addEventListener("focus", () => handlers.onPreview(data));
    node.addEventListener("pointerleave", () => handlers.onPreview(null));
    node.addEventListener("blur", () => handlers.onPreview(null));

    cells.set(data.number, {
      data,
      node,
      haystack: [data.symbol, data.name, data.nameFa].map(normalize),
    });
    return node;
  }

  function createPlaceholder(category, label, row) {
    const node = el("div", {
      className: "placeholder",
      text: label,
      dataset: { category },
      attrs: { "aria-hidden": "true" },
    });
    node.style.gridColumn = 3;
    node.style.gridRow = row;
    placeholders.push(node);
    return node;
  }

  function matches({ data, haystack }) {
    if (state.category && data.category !== state.category) return false;
    const query = normalize(state.query);
    if (!query) return true;
    if (/^\d+$/.test(query)) return String(data.number) === query;
    return haystack.some((text) => text.includes(query));
  }

  function applyFilters() {
    const isFiltering = Boolean(state.category || state.query.trim());
    cells.forEach((cell) => {
      const visible = matches(cell);
      cell.node.classList.toggle("is-dimmed", !visible);
      cell.node.tabIndex = visible || !isFiltering ? 0 : -1;
    });
    placeholders.forEach((node) => {
      node.classList.toggle(
        "is-dimmed",
        isFiltering && node.dataset.category !== state.category,
      );
    });
  }

  PT.Table = {
    /** Build the grid inside `root` and register callbacks. */
    init(root, callbacks) {
      handlers = { ...handlers, ...callbacks };
      const fragment = document.createDocumentFragment();
      PT.ELEMENTS.forEach((data) => fragment.append(createCell(data)));
      fragment.append(
        createPlaceholder("lanthanoid", "۵۷–۷۱", 6),
        createPlaceholder("actinoid", "۸۹–۱۰۳", 7),
      );
      root.append(fragment);
    },

    setCategory(key) {
      state.category = key;
      applyFilters();
    },

    setQuery(query) {
      state.query = query;
      applyFilters();
    },

    /** Elements that currently match the active filters, ordered by number. */
    matching() {
      return [...cells.values()].filter(matches).map((cell) => cell.data);
    },

    /** Count of elements per category (for the legend badges). */
    countByCategory() {
      const counts = {};
      PT.ELEMENTS.forEach(
        (e) => (counts[e.category] = (counts[e.category] || 0) + 1),
      );
      return counts;
    },

    focusCell(number) {
      const cell = cells.get(number);
      if (cell) cell.node.focus({ preventScroll: false });
    },

    categoryLabel,
  };
})((window.PT = window.PT || {}));
