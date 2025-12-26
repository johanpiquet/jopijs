## What is Jopi ?

Jopi is a Bun.js framework, with Node.js compatibility, for building ultra-fast websites using React.js.

Its operating principle is very similar to Next.js, with a file based router, and React Server Side Rendering.

**The goal of Jopi is simplicity and making big website easier to maintain. This thanks to a powerful module system.**

> This module is make website refactoring much more easier, since it allows you to alter the website without touching the current code :
you create a new module, which override some existing routes and React components. Once this module disabled (by adding a simple underscore in front of his name), then you immediatly revert to your old version.

Here are some of Jopi features:

* **Tailwind already configured and enabled**. As well as **React HMR integration** so that any UI code change is instantly reflected in the browser.
* Inclusion of a **Docker script** to quickly convert your project into a very lightweight Docker VM.
* Built-in **JWT authentication** with the ability to easily create a user directory: a minimalist system that is easy to understand and extend for your own needs.
* **User role-based security** is included. It allows limiting access to certain resources and customizing behavior according to user roles.
* Simple but powerful **module system** :
  * Allow sharing React components.
  * Allows a module to override a shared component.
  * Allows modules to communicate with each other (event/listeners pattern).
  * Allows modules to extend a toolbar-like component.
  * Modules to override an existing route.