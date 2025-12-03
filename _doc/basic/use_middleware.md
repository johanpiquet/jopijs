# Using middleware

## What is a middleware?

A middleware is a function that is called before the normal processing of a request. For example, to filter the caller's IP and allow only certain IPs.

With Jopi, you have three ways to define a middleware:
* Have a middleware apply to all URLs.
* Have a middleware whose regular expression is tested, to filter the URLs it applies to.
* Have a middleware associated with a specific route.

## What is a post-middleware?

A post-middleware is a middleware that runs after the request:
* Middleware: runs before the normal processing of the request. It can block the request.
* Post-middleware: runs after and can modify the response.

## Defining a global middleware

Global middlewares are defined in the module's `serverInit.ts` file. This file exports a function that is called just before the server starts. This is where you can configure the server by adding features and modifying options.

```typescript
import {JopiEasyWebSite} from "jopijs";
import {JopiRequest} from "jopijs";

async function ipMiddleware(req: JopiRequest) {
    let ip = req.requestIP?.address;
    console.log("Caller IP is", ip);

    // null means it will continue to the next middleware.
    if (ip?.endsWith("127.0.0.1")) return null;

    // Returning a response stops request processing.
    return req.res_returnError401_Unauthorized();
}

export default async function(webSite: JopiEasyWebSite) {
    webSite.configure_middlewares()
        .add_middleware(
            // Apply to GET method only
            // You can also use "*" or undefined
            // if you want to apply to all methods.
            "GET",

            // Our function.
            ipMiddleware, {
                // Only URLs starting with "/tests/".
                regExp: /^\/tests\//
            }
        );
}
```

## Defining a local middleware

Local middlewares are defined in a route's `config.ts` file.

```typescript
import {JopiRequest, RouteConfig} from "jopijs";

async function ipMiddleware(req: JopiRequest) {
    let ip = req.requestIP?.address;
    console.log("Caller IP is", ip);
    if (ip==="127.0.0.1") return null;
    return req.returnError401_Unauthorized();
}

export default function (config: RouteConfig) {
    config.onGET.add_middleware(ipMiddleware);
}
```
