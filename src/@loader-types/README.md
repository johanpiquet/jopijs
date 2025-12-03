It contains type declaration for TypesScript `tsconfig.json` which allows support for custom imports.

If you do `import imgUrl from "./myImage.png"` then TypeScript send an error (with node.js) because he don't know
how to transform this import.

To resolve that, add a `types` section into your `tsconfig.json`.

**Sample**
```json
{
  "compilerOptions": {
    "types": ["jopijs/types"]
  }
}
```