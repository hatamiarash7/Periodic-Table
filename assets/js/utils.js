/** Small, dependency-free helpers shared by the other scripts. */
(function (PT) {
  "use strict";

  const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

  /** Convert Latin digits in `value` to Persian digits. */
  PT.toPersianDigits = (value) =>
    String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[digit]);

  /** Format atomic masses such as "(98)" or "1.008" and replace "." with "٫". */
  PT.formatMass = (mass) => PT.toPersianDigits(mass).replace(".", "٫");

  /**
   * Normalise text for searching: lower-case, unify Arabic/Persian letter
   * variants, strip ZWNJ, diacritics and whitespace, map digits to Latin.
   */
  PT.normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[\u064B-\u065F\u200c\u200d\s]/g, "")
      .replace(/[۰-۹]/g, (digit) => PERSIAN_DIGITS.indexOf(digit))
      .replace(/[٠-٩]/g, (digit) => digit.charCodeAt(0) - 0x0660);

  /** Create an element with optional class, text and attributes. */
  PT.el = (tag, options = {}, children = []) => {
    const node = document.createElement(tag);
    const { className, text, attrs, dataset } = options;
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    if (attrs) {
      Object.entries(attrs).forEach(([name, value]) =>
        node.setAttribute(name, value),
      );
    }
    if (dataset) Object.assign(node.dataset, dataset);
    node.append(...children);
    return node;
  };

  /** Create an SVG element in the SVG namespace. */
  PT.svg = (tag, attrs = {}) => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([name, value]) =>
      node.setAttribute(name, value),
    );
    return node;
  };

  /** Derived properties of an element: block and position in the 18-column grid. */
  PT.describe = (element) => {
    const isFBlockRow = element.group === null;
    const isDBlockInFRow = element.symbol === "Lu" || element.symbol === "Lr";
    const firstOfRow = element.number >= 89 ? 89 : 57;

    let block = "d";
    if (isFBlockRow) block = isDBlockInFRow ? "d" : "f";
    else if (element.group <= 2 || element.symbol === "He") block = "s";
    else if (element.group >= 13) block = "p";

    return {
      block,
      // Rows 9-10 hold the lanthanoids / actinoids below the main table.
      column: isFBlockRow ? 4 + element.number - firstOfRow : element.group,
      row: isFBlockRow ? (element.number >= 89 ? 10 : 9) : element.period,
    };
  };
})((window.PT = window.PT || {}));
