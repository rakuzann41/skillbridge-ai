import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import {
  locales,
  validLocale,
  validTheme,
  translate,
  formatDate,
} from "../lib/i18n.ts";
import { messages } from "../lib/messages.ts";
import { skills, levels } from "../lib/skills.ts";
import { skillNames } from "../lib/results-presentation.ts";

const require = createRequire(import.meta.url);
const { parse } = require("next/dist/compiled/babel/bundle").parser();
const placeholders = (value) =>
  [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test("all translations are nonempty and retain the same interpolation fields", () => {
  for (const [key, pair] of Object.entries(messages)) {
    assert.equal(pair.length, 2, key);
    for (const value of pair) {
      assert.ok(value.trim(), key);
      assert.deepEqual(placeholders(value), placeholders(key), key);
    }
  }
});

test("UI message keys, skill descriptions and reviewed roadmap content have translations", () => {
  const keys = new Set();
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (
      node.type === "CallExpression" &&
      node.callee?.name === "t" &&
      node.arguments[0]?.type === "StringLiteral"
    )
      keys.add(node.arguments[0].value);
    for (const [key, value] of Object.entries(node)) {
      if (["loc", "extra"].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  }
  function scan(directory) {
    for (const file of readdirSync(directory, { withFileTypes: true })) {
      const path = new URL(file.name, directory);
      if (file.isDirectory()) scan(new URL(`${file.name}/`, directory));
      else if (/\.tsx?$/.test(file.name))
        visit(
          parse(readFileSync(path, "utf8"), {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
          }),
        );
    }
  }
  scan(new URL("../app/", import.meta.url));
  scan(new URL("../components/", import.meta.url));
  for (const skill of skills)
    [skill.name, skill.description, skill.group].forEach((key) =>
      keys.add(key),
    );
  levels.forEach((level) => keys.add(level.label));
  const catalog = JSON.parse(
    readFileSync(
      new URL("../../backend/data/roadmap_v1.json", import.meta.url),
      "utf8",
    ),
  );
  for (const stage of catalog) {
    [stage.title, stage.description, stage.outcome].forEach((key) =>
      keys.add(key),
    );
    for (const resource of stage.resources)
      [resource.label, resource.note].forEach((key) => keys.add(key));
  }
  const technologyNames = new Set([
    "Python",
    "SQL",
    "Excel",
    "pandas",
    "Power BI",
    "Tableau",
    "Git",
  ]);
  for (const key of keys)
    assert.ok(
      Object.hasOwn(messages, key) || technologyNames.has(key),
      `Missing translation: ${key}`,
    );
});

test("invalid preferences fall back safely and numbers follow the selected language", () => {
  for (const locale of locales) assert.equal(validLocale(locale), locale);
  for (const value of [null, undefined, "fr", "__proto__", {}, "EN"])
    assert.equal(validLocale(value), "en");
  assert.equal(validTheme("dark"), "dark");
  assert.equal(validTheme("light"), "light");
  for (const value of [null, "invalid", "__proto__"])
    assert.equal(validTheme(value), "system");
  for (const locale of locales) {
    const value = translate(locale, "Skills explored: {count} of {total}", {
      count: 2,
      total: 11,
    });
    assert.match(value, /2/);
    assert.doesNotMatch(value, /\{|\}/);
    assert.equal(
      translate(locale, "{count}", { count: 10.5 }),
      new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(10.5),
    );
    assert.equal(
      translate(locale, "Original employer vacancy text"),
      "Original employer vacancy text",
    );
    assert.equal(translate(locale, "__proto__"), "__proto__");
  }
  assert.notEqual(
    translate("ru", "Skipped 2 malformed or duplicate CSV rows."),
    "Skipped 2 malformed or duplicate CSV rows.",
  );
});

test("translated skill labels preserve canonical IDs, order and saved data", () => {
  const ids = Object.freeze(["sql", "data-cleaning"]);
  const demand = Object.freeze([
    { skill_id: "sql", skill_name: "SQL" },
    { skill_id: "data-cleaning", skill_name: "Data cleaning" },
  ]);
  for (const locale of locales) {
    const names = skillNames(ids, demand, (key) => translate(locale, key));
    assert.equal(names, `SQL, ${translate(locale, "Data cleaning")}`);
  }
  assert.deepEqual(ids, ["sql", "data-cleaning"]);
});

test("dates remain readable without relying on localized month-name support", () => {
  for (const locale of locales) {
    const formatted = formatDate("2026-10-19T12:00:00Z", locale, true);
    assert.match(formatted, /2026/);
    assert.match(formatted, /10/);
    assert.doesNotMatch(formatted, /M10|Invalid|undefined/);
  }
});

const css = readFileSync(
  new URL("../app/preferences.css", import.meta.url),
  "utf8",
);
const palette = (selector) =>
  Object.fromEntries(
    [
      ...css.match(selector)[1].matchAll(/--tone-([\w-]+):\s*(#[a-f0-9]{6})/gi),
    ].map((match) => [match[1], match[2]]),
  );
function luminance(hex) {
  const rgb = hex
    .slice(1)
    .match(/../g)
    .map((value) => parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
test("both theme palettes keep normal text at WCAG AA contrast", () => {
  for (const colors of [
    palette(/:root\s*\{([^}]+)\}/),
    palette(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/),
  ]) {
    for (const surface of ["page", "panel", "soft", "raised"]) {
      for (const text of ["ink", "muted", "accent", "danger"])
        assert.ok(
          contrast(colors[text], colors[surface]) >= 4.5,
          `${text} on ${surface}: ${contrast(colors[text], colors[surface])}`,
        );
      assert.ok(contrast(colors.focus, colors[surface]) >= 3);
    }
    assert.ok(contrast(colors.warning, colors["warning-surface"]) >= 4.5);
    assert.ok(contrast(colors["line-strong"], colors.panel) >= 3);
    assert.ok(contrast(colors["on-accent"], colors.accent) >= 4.5);
    assert.ok(contrast(colors["on-accent"], colors["accent-hover"]) >= 4.5);
  }
});
