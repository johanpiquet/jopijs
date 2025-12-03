Contains tools related to pre-processing your source-code.
Mainly for manager the `import` in order to allows Node.js to mimick Vite.js import capacities:

* Importing images / json / ...
* Supporting alias `import "@/mod_shadcn/myItems.ts` where `@/shared` point to a special location.
* Supporting `?raw` and `?inline` modifiers. Ex: `import asDataUrl from "./myImage.png?inline"`.
