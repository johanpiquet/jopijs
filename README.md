## What is Jopi ?

Jopi is a Bun.js framework, with Node.js compatibility, for building ultra-fast websites using React.js.

Its operating principle is very similar to Next.js:
* On the server side, React.js is used to generate the HTML of pages, which are search-engine friendly (Google, Bing, ...). On the browser side, the generated HTML is automatically replaced by its fully interactive equivalent.
* Pages and APIs (GET/POST/...) are defined by placing files in directories whose names correspond directly to the URL structure.

The goal of Jopi is simplicity: to be able to create an application without drowning in technical details. That's why Jopi is not just a server, but also a framework. It is minimalist, but with very useful additions:

* **Tailwind already configured and enabled**. As well as **React HMR integration** so that any UI code change is instantly reflected in the browser.
* Inclusion of a **Docker script** to quickly convert your project into a very lightweight Docker VM.
* Built-in **JWT authentication** with the ability to easily create a user directory: a minimalist system that is easy to understand and extend for your own needs.
* **User role-based security** is included. It allows limiting access to certain resources and customizing behavior according to user roles.
* A **cache system** that makes your site as fast as a static site. You have full control over this cache, which can be global, per-user, distinguish desktop/mobile, ...
* Creating an SSL certificate (for https) is trivial: Jopi **generates development certificates** (local machine) and also handles **Let's Encrypt**: with automatic renewal and no connection loss.
* Simple but powerful **module system** to organize your application and reuse module between your apps.

## Application organization

### Application structure

A typical application looks like this in terms of folders.

**Example Jopi project**
```
|- node_modules/
|- package.json
|- tsconfig.json                       < If you use node.js / typescript
|- src/
   |- mod_moduleA                      < Code is always divided into modules
   |- mod_moduleB
      |- @alias                        < Allows sharing between modules
      |- @routes/admin                 < Define items bound to urls
         |- page.tsx                   < Bound to http://mysite/admin
         |- onPOST.ts                  < Catch all POST call to this url
         |- config.ts                  < If you want to configure some options
         |- pageNeedRole_admin.cond    < You can also use special file names
         |- postNeedRole_write.cond    < to avoid using config.ts
```

As noted in the comments, there are two particularities: code is always divided into modules, while folders beginning with an '@' sign are used by code generation mechanisms. Notably the `@alias` folder which allows sharing elements between modules.

### The power of a modular application

The module organization allows clear separations between different aspects of your code, and above all it allows reusing/sharing code blocks between multiple applications, while facilitating division of work in a team. For example, one module manages the site structure, another handles authentication, and a third adds pages for the products sold.

Modules can share dependencies with other modules thanks to powerful alias mechanisms. For example a module defines a component MyComp, which becomes accessible to all modules by importing `import MyComp from @/uiComponents/MyComp`.

Jopi's module system has the major advantage of being compatible with code pruning performed by JavasScript Bundlers, avoid common pitfalls with low-coupled code.

The module system is based on a set of mechanisms:
* **Events / listeners** — This mechanism lets modules communicate via a flexible "notify when this happens" system.
* **Composites** — This mechanism allows React components to have content enriched by modules. For example, so that a module can add content to a toolbar.
* **Sharing React.js components** — Modules can share React components, which are automatically registered in the global namespace. Also, a module can replace a shared component with its own version.

### Server-only code, browser-only code?

To be fast, Jopi does not include code analysis and server-side code removal. However, a very useful mechanism compensates for this: whenever the token **jopiBundler_ifServer** is encountered, it is replaced by the token **jopiBundler_ifBrowser**. Thus `import * as myLib from "./jopiBundler_ifServer.ts"` becomes `import * as myLib from "./jopiBundler_ifBrowser.ts"` when Jopi creates the JavaScript for the browser.

Besides being performant, this mechanism is easier to use while offering interesting possibilities.

Internally, Jopi uses a library called **Jopi Toolkit**. This library gathers a set of tools not specific to Jopi and usable in independent projects. This library also uses the translation mechanism (jopiBundler_ifServer to jopiBundler_ifBrowser) so that all server code is automatically removed or replaced by a browser-specific part.

## Cookbook

The documentation is organized as a cookbook: you want to do this, here is how.

### Basics

[Start a new project.](_doc/basic/new_project.md)  
[The 4 initialization files.](_doc/basic/init_files.md)  

[Bind a page to a url.](_doc/basic/bind_page_to_url.md)  
[Use parameterized urls.](_doc/basic/use_parametred_url.md)  
[Use catch-all urls.](_doc/basic/use_catchall_url.md)  
[Override an existing route.](_doc/basic/override_an_existing_route.md)  
[The 'public' dir](_doc/basic/the_public_dir.md)  

[Enable developer mode.](_doc/basic/enable_developper_mode.md)  
[Enable HTTPS.](_doc/basic/enable_https.md)  
[Enable CORS.](_doc/basic/use_cors_middleware.md)  
[Manage trailing slashs.](_doc/basic/manage_trailing_slashs.md)  

[Use a middleware.](_doc/basic/use_middleware.md)  
[Use with a reverse-proxy.](_doc/basic/use_with_reverse_proxy.md)  
[Use the page cache.](_doc/basic/use_page_cache.md)  

[Define 401, 404 and 500 error pages](_doc/basic/define_error_pages.md)  

### React pages

[Use React Server Side.](_doc/react/what_is_react_ssr.md)  
[Use Tailwind CSS.](_doc/react/use_tailwind_css.md)  

[Import a CSS file.](_doc/react/import_css.md)  
[Use a CSS module.](_doc/react/use_css_modules.md)  
[Import an image.](_doc/react/import_image.md)  

[Change the page title.](_doc/react/set_page_title.md)  
[Use menus.](_doc/react/use_menus.md)  

### Using modules

[Create a module.](_doc/module/create_a_module.md)  

[Share React components.](_doc/module/sharing_react_components.md)  
[Replace an already shared component.](_doc/module/replace_shared_component.md)  

[Use composites.](_doc/module/use_composites.md)  
[Communicate between modules.](_doc/module/communicate_between_modules.md)  

### Responding to a request

[Create a JSON response](_doc/request/json_response.md)  
[Create an HTML response with React](_doc/request/returns_html_with_react.md)  

[Get received input data.](_doc/request/get_received_data.md)  
[Handle received files.](_doc/request/manage_received_files.md)  
[Validate input data.](_doc/request/check_received_data.md)  
[Return files.](_doc/request/return_files.md)  

### Users and roles

[Define a user store.](_doc/users/user_data_store.md)  
[Authenticate a user.](_doc/users/login_the_user.md)  

[Know the user and their roles.](_doc/users/known_user_and_roles.md)  
[Restrict access by roles.](_doc/users/limit_access_to_roles.md)  

### Other

[Using fetch and auto-starting server](_doc/others/use_fetch_and_autostart.md)  
[Crawling a website to a flat one](_doc/others/crawling_to_flat_website.md)  