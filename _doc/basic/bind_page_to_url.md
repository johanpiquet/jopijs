# Associate a page with a URL

## The "@routes" folder

Once created, your project looks like this.

```
|- node_modules/
|- package.json
|- tsconfig.json
|- src/
   |- mod_moduleA/
      |- @routes/        < The interesting part is here
   |- mod_moduleB/
	  |- @routes/        < Each module can declare routes
```

Each module (here moduleA and moduleB) has an `@routes` folder whose contents are interpreted to determine which function to associate with a URL. Each directory corresponds to a segment of the URL, while files named `page.tsx` define the content to display.

To understand, here are some examples.
* The file `@routes/welcome/page.tsx` corresponds to the URL `http://mysite/welcome`.
* The file `@routes/products/listing/page.tsx` corresponds to the URL `http://mysite/product/listing`.
* The file `@routes/page.tsx` corresponds to the home page `http://mysite/`.

> **To know**: directories which name starts with an underscore are ignored.  
> Example: `@routes/products/_willBeIgnore/page.tsx` 

## Example route

The following example defines a route while giving an overview of files that may be found in the folder.  
Each item will be explained in more detail below.

```
|- @routes/product/listing
   |- page.tsx                   < Response to GET call
   |- onPOST.ts                  < Reponse to POST call
   |- onPUT.ts                   < Same for PUT/PATCH/OPTIONS/DELETE
   |- postNeedRole_Admin.cond    < Constraint on caller roles
   |- postNeedRole_Writer.cond.  < Add a second constraint.
   |- high.priority              < Set a priority
   |- config.ts                  < Allows others setting (like cache)
   |- cache.disable              < Disable the automatic cache
```

## The "page.tsx" file

The **page.tsx** files allow the URL to respond with the content of a React page. The React content is transformed into HTML by the server and displayed in the browser. Then, once the JavaScript is loaded, all event handling becomes functional: the user can interact with the content.

**Example page.tsx file**

```typescript jsx
import "./my-style.css";
import {usePageTitle} from "jopijs/ui";

export default function() {
	usePageTitle("My title");

    return <div onClick={()=>alert('click')}>
	    Click me!
	</div>
}
```

## The "onPOST.ts" file

The `onPOST.ts` (or onPOST.tsx) file allows you to define the function that responds to a POST call on the URL.

**Example onPOST.ts file**

```typescript jsx
import {JopiRequest, type LoginPassword} from "jopijs";

export default async function(req: JopiRequest) {
    const data = await req.req_getData();
    const authResult = await req.user_tryAuthWithJWT(data as LoginPassword);

    if (!authResult.isOk) console.log("Auth failed");

    // Will automatically set a cookie.
    // It's why we don't care of the details here.
    return req.res_jsonResponse({isOk: authResult && authResult.isOk});
}
```

> You can do the same for other HTTP methods:    
> onPUT.ts, onPATCH.ts, onDELETE.ts, ...

## The "config.ts" file

The `config.ts` file allows you to modify the configuration for a route.

The four most useful elements are:

* Middleware configuration.
* Page caching configuration.
* Roles configuration.
* Binding the page to menus.

```typescript
import {RouteConfig} from "jopijs";

export default function(ctx: RouteConfig) {
    // GET call will need the user to have
    // the roles "admin" and "writer".
    ctx.onGET.addRequiredRole("admin", "writer");
}
```

## Condition files (.cond)

Files with the `.cond` extension allow defining conditions regarding roles.  

The name of these files contains information that will be decoded and corresponds to the following nomenclature: `whatNeedRole_roleName.cond`.

The following examples illustrate:
* **postNeedRole_admin.cond**: means POST API calls require the user to have the "admin" role.
* **getNeedRole_writer.cond**: means GET API calls require the user to have the "writer" role.
* **pageNeedRole_customer.cond**: means rending the page need the user to have the "customer" role.

If multiple constraints apply to the same method, they accumulate. For example if both **getNeedRole_writer.cond** and **getNeedRole_admin.cond** are present, the user will need both the writer and admin roles at the same time (not one or the other).

> There is a distinction between GET and PAGE.   
> GET is for call to the `onGET.ts` file.   
> PAGE is for the `page.tsx` file.

## Priority files (.priority)

Each module can define routes and add new routes. It is also possible for a module to replace an existing route. When that happens, Jopi must be able to know which module should have priority: which route will be used and which will be ignored.

Priority files indicate which module is more prioritized.

Priorities are, from least to most prioritized: `verylow.priority`, `low.priority`, `default.priority`, `high.priority`, `veryhigh.priority`.

> Putting a priority file into a route folder will explicitly set its priority.  
> 
> The default one, if you omit this file, is `default.priority`.  
> This file is automatically added by Jopi if no other priority file is found.

## The "cache.disable" file

By default, React.js pages are cached. The `cache.disable` file disables this automatic cache.

You can also do this from the `config.ts` file and define caching rules there.

> **About automatic cache:**
> When a page is automatically cached, this page is make anonymous.  
> Which mean the users information are removed, doing as-is no user was connected when rendering the page.  
> 
> To disable this behaviors, you have to define a cache rule in the `config.ts` file.  
> 
> This example define a behavior, wich do nothing but disable the default strategy:  
> `ctx.onGET.cache_ifNotInCache(() => {})`.