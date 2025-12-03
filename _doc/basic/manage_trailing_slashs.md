# Manage trailing slash

The default behavior of Jopi is to remove trailing slashes from URLs.
Thus the URL `http://mysite.com/` becomes `http://mysite.com`, which results in:
* The generation of URLs without the slash.
* An automatic redirection in the browser to the URL without the slash.

This behavior can be configured to force the addition of trailing slashes.

```typescript
import {jopiApp} from "jopijs";

jopiApp.startApp(import.meta, jopiEasy => {
    jopiEasy.create_webSiteServer()
        .configure_behaviors()
            // Now we will have / at the end of each url.
            .removeTrailingSlashes(false)
            .DONE_configure_behaviors()
    });
```