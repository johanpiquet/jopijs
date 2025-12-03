# Using fetch and auto-start

Jopi provides facilities for requesting content from a remote server, modifying it, and returning it.
(this was originally the reason for jopijs).

To illustrate these features, we will create a mirror of the `developer.mozilla.org` site where all pages
are accessible from the local URL `http://127.0.0.1:3000`.

To do this, we will start by creating a module named `mod_proxy` with different elements as shown here:

```
|- src/                    < Our source directory
   |- mod_proxy            < Our new module
      |- serverInit.ts     < Will extend the server config
      |- @routes           < We declare routes
         |- [...]          < Allow catching all URLs
            |- onGET.ts    < Catch the GET calls
```

Here we use a catch-all route. Being defined at the root of the site, this route allows us to
define a listener that responds to all GET requests.
The role of the `onGET.ts` file is to expose this listener.

## First version: fetch

The first version directly requests the Mozilla site using a ServerFetch object,
which is a wrapper providing facilities around the standard `fetch` function.

**File onGET.ts**
```typescript
import {JopiRequest, ServerFetch} from "jopijs";

// Mozilla website
const DIST_URL = "https://developer.mozilla.org";
const fetcher = ServerFetch.useOrigin(DIST_URL);

export default async function(req: JopiRequest) {
    // Fetch the server.
    // Here it will automatically calculate the target URL.
    let res = await fetcher.fetchWith(req);

    // Will replace https://developer.mozilla.org by http://127.0.0.1:3000
    // 302: allow forcing 302 redirection if redirecting.
    res = await req.resValue_replaceWebSiteOrigin(res, DIST_URL, 302);

    return res;
}
```

Here the two interesting parts are:
* `fetcher.fetchWith(req)` which fetches resources from the Mozilla site
  while automatically calculating the correct URL to use.
* `req.replaceWebSiteOrigin` which automatically replaces the Mozilla URL
  in case the response is a redirect or HTML page.

## Second version: using a load-balancer

We will now modify the previous example to use a load-balancer.

The role of the load-balancer is to distribute the load across multiple servers: instead of always requesting
the same server, we can request multiple mirror servers.

The load-balancer integrated into Jopi enables several interesting features:
* Distribute load between multiple servers.
* Start a server on the first request to it. For example to start a Docker container exposing a
  WordPress site.
* Automatically stop this server when it has not been requested for n seconds.
* Attempt to automatically restart a server if a failure is detected.

The first step is to define the list of target servers.

**File serverInit.ts**
```typescript
import {JopiEasyWebSite} from "jopijs";

export default async function(webSite: JopiEasyWebSite) {
    webSite.add_sourceServer()
        .useOrigin("https://developer.mozilla.org")

        // Set its weight.
        .set_weight(0.5)

        // Can also be
        // Always called
        //      .set_isMainServer()
        // Called if the main is down
        //      .set_isBackupServer()

        // Optional: Called to start the remote server.
        .do_startServer(async () => {
            console.log("Starting Mozilla Server");

            // Say that it must wait 50 sec of inactivity
            // before stopping the server.
            //
            return 50;
        })

        // Optional: Allow stopping the remote server.
        .do_stopServer(async () => {
            console.log("Stopping Mozilla Server");
        })

        .END_add_sourceServer()

        // We can add other servers.
        //.useOrigin("https://backup.mozilla.org")
}
```

The second step is to modify the calling code.
Here we will replace `await fetcher.fetchWith(req)` with `await req.fetchServer()`.

**New version for file onGET.ts**
```typescript
import {JopiRequest, ServerFetch} from "jopijs";

export default async function(req: JopiRequest) {
    let res = await req.fetchServer();
    res = await req.replaceWebSiteOrigin(res, DIST_URL, 302);
    return res;
}
```