/**
 * Element categories, in legend order.
 * `key` is also the value of the `data-category` attribute used by the CSS
 * (see `assets/css/tokens.css` for the colours).
 */
(function (PT) {
  "use strict";

  PT.CATEGORIES = [
    { key: "alkali-metal", label: "فلزهای قلیایی" },
    { key: "alkaline-earth-metal", label: "فلزهای قلیایی خاکی" },
    { key: "lanthanoid", label: "لانتانیدها" },
    { key: "actinoid", label: "آکتینیدها" },
    { key: "transition-metal", label: "فلزهای واسطه" },
    { key: "post-transition-metal", label: "فلزهای پس‌واسطه" },
    { key: "metalloid", label: "شبه‌فلزها" },
    { key: "other-nonmetal", label: "نافلزها" },
    { key: "noble-gas", label: "گازهای نجیب" },
    { key: "unknown", label: "ناشناخته" },
  ];

  PT.CATEGORY_BY_KEY = Object.fromEntries(
    PT.CATEGORIES.map((category) => [category.key, category]),
  );
})((window.PT = window.PT || {}));
