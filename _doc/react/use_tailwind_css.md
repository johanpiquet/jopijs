# Using Tailwind CSS

## What is Tailwind CSS?

Tailwind CSS is a set of utility CSS classes, the use of which avoids the use of CSS styles. The particularity of Tailwind is that it offers a very large number of utility CSS classes, but it only includes the ones you use.

This feature allows the generated style sheets to remain small and optimized. The trade-off is that Tailwind must scan your code and analyze what it uses, which implies a sometimes tedious configuration step: which is not the case with Jopi, because **Tailwind is already configured and enabled by default**.

## Disable Tailwind CSS

Tailwind CSS is already configured and enabled. If its use is not suitable for your project, then here is how to disable it from the **index.ts** file at the root of your project:

**Disabling Tailwind**
```typescript
jopiEasy
	   .configure_tailwindProcessor()
	   .disableTailwind();
```

## Define the "global.css"

The Tailwind engine needs a `global.css` file to work, which it will look for on startup. It is possible to define it in several ways, which we indicate here in order of priority.

1. By programmatically indicating where it is located, or its content.
2. If you use **ShadCN** then the configuration of the `components.json` file will be used.
3. If a `global.css` file is found at the root of the project then it will be used (next to `package.json`).
4. Otherwise, it will directly use the content `@import "tailwindcss";`

Here is an example showing how to programmatically define the location of this file (option 1).

```typescript
jopiEasy 
    .configure_tailwindProcessor()  
    .setGlobalCssFilePath("./global2.css");
```