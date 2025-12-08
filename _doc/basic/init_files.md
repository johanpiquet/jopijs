# The three initialization files

Jopi offers four ways to initialize a project.

```
|- package.json
|- src/
   |- index.ts            < (A) First init file
   |- mod_moduleA
   |- mod_moduleB
      |- serverInit.ts    < (B) Per module init file
      |- uiInit.tsx       < (C) Browser & React SSR init file
      |- @routes/
         |- products/
            |- page.tsx
            |- config.ts  < (D) Allow configuring the route.
```

The `index.ts` file (A) is the program entry point. This is where the server is created.

**Example configuration file**
```typescript
import {jopiApp} from "jopijs";
import myUsers from "./myUsers.json" with { type: "json" };

jopiApp.startApp(import.meta, jopiEasy => {
    jopiEasy.create_webSiteServer()

        .configure_cache()
	        // ...
            .END_configure_cache()

        .enable_cors()
		    // ...
            .DONE_enableCors()

        .enable_jwtTokenAuth()
            // ...
            .DONE_enable_jwtTokenAuth()
    });
```

Each module has a `serverInit.ts` file which is automatically called after evaluating the `index.ts` file. It exports a default function that receives the value returned by `jopiEasy.create_webSiteServer()`.

**Example serverInit.ts file**
```typescript
import {JopiEasyWebSite} from "jopijs";

export default async function(webSite: JopiEasyWebSite) {
    // webSite is the result of "jopiEasy.create_webSiteServer()".
    webSite.configure_cache()
		// ...
		.END_configure_cache()
}
```

Each module can also have a `uiInit.ts` file. It is called each time the server renders a React page (corresponding to an `page.tsx` file). It is also executed in the browser on each load. Therefore it runs multiple times on the server side, and only once on the browser side.

**Example uiInit.tsx file**
```typescript
import {UiKitModule, MenuName} from "jopijs/uikit";
import {isBrowser} from "jopi-toolkit/jk_what";

// Note: the default class received is "ModuleInitContext"
// but ui-kit overrides the creation step to provide an
// instance of UiKitModule.
//
export default function(myModule: UiKitModule) {
}
```
