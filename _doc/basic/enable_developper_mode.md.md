# Enable developer mode

## What is developer mode?

Developer mode enables two things:
* Automatically restart the server (JOPI_DEV option).
* Or automatically refresh the browser content (JOPI_DEV_UI option).

The behavior of the JOPI_DEV_UI option differs depending on whether you use Node.js or Bun.js.

* With Node.js: the browser reloads the entire page.
* With Bun.js: it uses a hybrid method called React HMR where the current state of your React components (states and stores) is not lost. This gives the impression of magic where only what changed is instantly updated in your code, without the rest changing.

## How to enable it?

When you use a project template to create your Jopi project (npx jopi init) the `package.json` file exposes two scripts:

```json
{
	"script": {
	  "start": "JOPI_DEV=0 JOPI_DEV_UI=0 npx jopib src/index.ts",
	  "startNode": "JOPI_DEV=0 JOPI_DEV_UI=0 npx jopin dist/index.js",
	}
}
```

These lines have a particular appearance:
* `JOPI_DEV=0 JOPI_DEV_UI=0` sets the environment variables JOPI_DEV and JOPI_DEV_UI to the value 0 (disabled).
* `npx` is a Node.js tool that runs the jopib tool present in `node_modules/.bin` or downloads it if not present (bunx with bun.js).
* `jopib` starts the Bun.js version of the application, while its equivalent `jopin` starts the Node.js version. These two tools simply avoid typing `--preload jopijs/loader --preload jopijs` in the Node/Bun execution parameters.

The two environment variables, JOPI_DEV and JOPI_DEV_UI, enable development mode:

* JOPI_DEV=1 enables automatic server restart when sources change.
* JOPI_DEV_UI=1 enables automatic refresh when one of the browser-related files changes (React HMR for Bun.js or a simple refresh for Node.js).

## Issues related to UI Watch

Some behaviors are to consider when using UI Watch, du to the fact that the server doesn't update his content.

The implications are:
* When adding a new page, this new page is can be accessed until the server is restarted.
* When changing role constraints on a page, these constraints are not updated until the server is restarted.

Also, the server-side version of the page is not updated.

This is not bug, but behaviors that are expected.

## Issues related to UI Watch with Bun.js

Bun.js use React HMR to update the browser content when a file changes. Some unfixable issues relate to the use of React HMR and apply only to pages (see `page.tsx`).

* Security: roles cannot be verified.
* Middleware: middlewares cannot be executed.
* Cache: caching cannot be used.

* React shared components and UI composites are not updated.