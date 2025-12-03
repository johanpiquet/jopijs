# Enable CORS protection

## What is CORS?

For security, when you access a server resource the browser checks that the current site is allowed to access the server.

This is important to reduce the possibility that a malicious website communicates with a site where you are authenticated, without your knowledge.

* This does not reduce attacks by a hacker against your server.
* It reduces impersonation-type attacks.

Enabling CORS is therefore a way to protect visitors to your site. That is why **CORS is enabled by default**.

## Modify CORS

CORS can be modified from the central configuration file `src/index.ts`.

```typescript
import {jopiApp} from "jopijs";

jopiApp.startApp(import.meta, jopiEasy => {
    jopiEasy.create_webSiteServer()
        // Tips: you can also use 'fastConfigure_cors' for a one line configuration.

        .configure_cors()
	        // The current website is always added automatically.
	        // Here it's a second allowed website.
            .add_allowedHost("http://mywebsiteB")

            // If you want to disable automatic CORS activation.
			.disable_cors()

            .DONE_configure_cors();
    });
```
