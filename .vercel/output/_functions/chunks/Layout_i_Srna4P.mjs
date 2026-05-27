import { c as createComponent } from './astro-component_BaUWcwXf.mjs';
import 'piccolore';
import { k as addAttribute, t as renderHead, u as renderSlot, v as renderTemplate } from './entrypoint_Dvglin5i.mjs';
import 'clsx';

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>Premios CTA 2026</title>${renderHead()}</head> <body> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/home/adriajofre/Documentos/astro-projects/premioscta2/premioscta2/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
