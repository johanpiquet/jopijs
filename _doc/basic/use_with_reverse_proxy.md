# Using a reverse-proxy

A reverse-proxy is a server publicly exposed on the internet, whose purpose is to connect an internal server to the public network. It takes each request intended for this server, sends it to it, and then returns the server's response.

The use of a reverse-proxy requires distinguishing between two things:
- The public URL of the site: what visitors type into their browser.
- The technical URL of the server: on which it listens to receive messages.

When a server is directly exposed on the internet, then these two URLs are the same. But when you use a reverse-proxy, they start to differ. The public URL points to the reverse-proxy, which must use the server's technical URL to be able to communicate with it.

The environment variables JOPI_WEBSITE_URL and JOPI_WEBSITE_LISTENING_URL allow you to define these URLs.

* JOPI_WEBSITE_URL: defines the public URL of the server, the one used to form the URLs in the pages and information returned by the server.
* JOPI_WEBSITE_LISTENING_URL: defines the technical URL of the server, the one that the reverse-proxy uses to reach our server.

> If JOPI_WEBSITE_LISTENING_URL is not defined, then Jopi will automatically take JOPI_WEBSITE_URL

**Example for /src/index.ts**
```typescript
import {jopiApp} from "jopijs";  
  
jopiApp.startApp(import.meta, jopiEasy => { 
	// Here I explicitely set the website url. 
    jopiEasy.create_webSiteServer("https://localhost");
     
    // Here I don't set it.
    // It will use process.env.JOPI_WEBSITE_LISTENING_URL.
    // With a fallback to process.env.JOPI_WEBSITE_URL.
    //
    jopiEasy.create_webSiteServer(); 
});
```