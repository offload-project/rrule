import "./demo.css";
import * as rruleExports from "@offload-project/rrule";
import { type Options, RRule, type Weekday } from "@offload-project/rrule";

// Make library accessible to browser debuggers
Object.assign(window, rruleExports);

const getDay = (i: number) => [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU][i];

const makeArray = (s: string | string[]) => (Array.isArray(s) ? s : [s]);

const getFormValues = (form: HTMLFormElement) => {
  const paramObj: { [K in keyof Partial<Options>]: string | string[] } = {};
  const formData = new FormData(form);

  for (const [name, value] of formData.entries()) {
    const k = name as keyof Options;
    const v = value as string;
    if (Object.hasOwn(paramObj, k)) {
      const arr = makeArray(paramObj[k]!);
      arr.push(v);
      paramObj[k] = arr;
    } else {
      paramObj[k] = v;
    }
  }

  return paramObj;
};

const getOptionsCode = (options: Partial<Options>) => {
  const days = ["RRule.MO", "RRule.TU", "RRule.WE", "RRule.TH", "RRule.FR", "RRule.SA", "RRule.SU"];

  const items = (Object.keys(options) as (keyof Options)[]).map((k) => {
    let v: unknown = options[k];
    if (v === null) {
      v = "null";
    } else if (k === "freq") {
      v = `RRule.${RRule.FREQUENCIES[v as number]}`;
    } else if (k === "dtstart" || k === "until") {
      const d = v as Date;
      v =
        "new Date(Date.UTC(" +
        [
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
          d.getUTCHours(),
          d.getUTCMinutes(),
          d.getUTCSeconds(),
        ].join(", ") +
        "))";
    } else if (k === "byweekday") {
      if (Array.isArray(v)) {
        v = (v as Weekday[]).map((wday) => {
          const s = days[wday.weekday];
          if (wday.n) {
            return `${s}.nth(${wday.n})`;
          }
          return s;
        });
      } else {
        const w = v as Weekday;
        v = days[w.weekday];
      }
    } else if (k === "wkst") {
      if (v === RRule.MO) {
        return "";
      }
      const w = v as Weekday;
      v = days[w.weekday];
    }

    if (Array.isArray(v)) {
      v = `[${v.join(", ")}]`;
    }

    return `${k}: ${v}`;
  });

  return `{\n  ${items.filter((v) => !!v).join(",\n  ")}\n}`;
};

const makeRows = (dates: Date[]) => {
  let prevParts: string[] = [];
  let prevStates: boolean[] = [];

  const rows = dates.map((date, index) => {
    const states: boolean[] = [];
    const parts = date.toUTCString().split(" ");

    const cells = parts.map((part, i) => {
      if (part !== prevParts[i]) {
        states[i] = !prevStates[i];
      } else {
        states[i] = prevStates[i];
      }
      const cls = states[i] ? "a" : "b";
      return `<td class='${cls}'>${part}</td>`;
    });

    prevParts = parts;
    prevStates = states;

    return `<tr><td>${index + 1}</td>${cells.join("\n")}</tr>`;
  });

  return rows.join("\n\n");
};

const $ = <T extends HTMLElement>(selector: string): T => document.querySelector<T>(selector)!;
const $$ = <T extends HTMLElement>(selector: string): T[] => Array.from(document.querySelectorAll<T>(selector));

document.addEventListener("DOMContentLoaded", () => {
  const tabs = $("#tabs");

  const activateTab = (a: HTMLAnchorElement) => {
    const id = a.getAttribute("href")?.split("#")[1];

    for (const link of $$<HTMLAnchorElement>("#tabs a")) {
      link.classList.remove("active");
    }
    a.classList.add("active");

    for (const section of $$<HTMLElement>("#input-types section")) {
      section.style.display = "none";
    }

    const section = $<HTMLElement>(`#input-types #${id}`);
    section.style.display = "";

    const firstInput = section.querySelector<HTMLInputElement>("input");
    if (firstInput) {
      firstInput.focus();
      firstInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  // Build tabs from section headings
  for (const section of $$<HTMLElement>("#input-types section")) {
    section.style.display = "none";
    const h3 = section.querySelector("h3")!;
    const text = h3.textContent!;
    h3.style.display = "none";

    const a = document.createElement("a");
    a.href = `#${section.id}`;
    a.textContent = text;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      activateTab(a);
    });
    tabs.appendChild(a);
  }

  // Clickable examples
  for (const code of $$<HTMLElement>(".examples code")) {
    code.addEventListener("click", () => {
      const section = code.closest("section")!;
      const input = section.querySelector<HTMLInputElement>("input")!;
      input.value = code.textContent!;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  let init: string;
  let makeRule: () => RRule;

  // Handle input changes
  const handleChange = (e: Event) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement;
    const section = el.closest("section")!;
    const inputMethod = section.id.split("-")[0];

    switch (inputMethod) {
      case "text":
        makeRule = () => RRule.fromText(el.value);
        init = `RRule.fromText("${el.value}")`;
        break;
      case "rfc":
        makeRule = () => RRule.fromString(el.value);
        init = `RRule.fromString("${el.value}")`;
        break;
      case "options": {
        const form = el.closest("form") as HTMLFormElement;
        const values = getFormValues(form);
        const options: Partial<Options> = {};

        for (const k in values) {
          const key = k as keyof Options;
          let value = values[key];
          if (!value) continue;

          switch (key) {
            case "dtstart":
            case "until": {
              options[key] = new Date(Date.parse(`${value}Z`));
              continue;
            }
            case "byweekday":
              if (Array.isArray(value)) {
                options[key] = value.map((i) => getDay(parseInt(i, 10)));
              } else {
                options[key] = getDay(parseInt(value, 10));
              }
              continue;
            case "wkst":
              options[key] = getDay(parseInt(value as string, 10));
              continue;
            case "interval": {
              const i = parseInt(value as string, 10);
              if (i === 1 || !value) continue;
              options[key] = i;
              continue;
            }
            case "tzid":
              options[key] = value as string;
              continue;
            case "byweekno":
            case "byhour":
            case "byminute":
            case "bysecond":
            case "byyearday":
            case "bymonth":
            case "bymonthday":
            case "bysetpos":
            case "bynmonthday":
              if (!Array.isArray(value)) {
                value = value.split(/[,\s]+/);
              }
              value = value.filter((v) => v);
              options[key] = value.map((n) => parseInt(n, 10));
              continue;
            case "bynweekday":
              if (!Array.isArray(value)) {
                value = value.split(/[,\s]+/);
              }
              value = value.filter((v) => v);
              options[key] = [value.map((n) => parseInt(n, 10)) as [number, number]];
              continue;
            case "byeaster":
              options[key] = parseInt(value as string, 10);
              continue;
            case "freq":
            case "count":
              options[key] = parseInt(value as string, 10);
              continue;
            default:
              continue;
          }
        }

        makeRule = () => new RRule(options);
        init = `new RRule(${getOptionsCode(options)})`;
        break;
      }
    }

    $("#init").innerHTML = init;
    $<HTMLAnchorElement>("#rfc-output a").innerHTML = "";
    $<HTMLAnchorElement>("#text-output a").innerHTML = "";
    $("#options-output").innerHTML = "";
    $("#dates").innerHTML = "";

    let rule: RRule;
    try {
      rule = makeRule();
    } catch (e) {
      const pre = document.createElement("pre");
      pre.className = "error";
      pre.textContent = `=> ${String(e || null)}`;
      $("#init").appendChild(pre);
      return;
    }

    const rfc = rule.toString();
    const text = rule.toText();

    const rfcLink = $<HTMLAnchorElement>("#rfc-output a");
    rfcLink.textContent = rfc;
    rfcLink.href = `#/rfc/${rfc}`;

    const textLink = $<HTMLAnchorElement>("#text-output a");
    textLink.textContent = text;
    textLink.href = `#/text/${text}`;

    $("#options-output").textContent = getOptionsCode(rule.origOptions);

    const optionsRow = $("#options-output").closest("tr") as HTMLElement;
    if (inputMethod === "options") {
      optionsRow.style.display = "none";
    } else {
      optionsRow.style.display = "";
    }

    const max = 500;
    const dates = rule.all((_date, i) => {
      return !(!rule.options.count && i === max);
    });

    let html = makeRows(dates);
    if (!rule.options.count) {
      html += `<tr><td colspan='7'><em>Showing first ${max} dates, set <code>count</code> to see more.</em></td></tr>`;
    }
    $("#dates").innerHTML = html;
  };

  for (const el of $$<HTMLInputElement | HTMLSelectElement>("input, select")) {
    el.addEventListener("keyup", handleChange);
    el.addEventListener("change", handleChange);
  }

  // Activate first tab
  const firstTab = tabs.querySelector<HTMLAnchorElement>("a");
  if (firstTab) activateTab(firstTab);

  // Hash-based routing
  const processHash = () => {
    const hash = location.hash.substring(1);
    if (hash) {
      const match = /^\/(rfc|text)\/(.+)$/.exec(hash);
      if (match) {
        const method = match[1];
        const arg = match[2];
        const tab = $<HTMLAnchorElement>(`a[href='#${method}-input']`);
        activateTab(tab);
        const input = $<HTMLInputElement>(`#${method}-input input`);
        input.value = arg;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  processHash();
  window.addEventListener("hashchange", processHash);
});
