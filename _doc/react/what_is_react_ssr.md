## What is React SSR?

Jopi uses a technique called React SSR. To understand what it is, here is the flow of a request.

1. The server receives a GET request.
2. Internally, it mounts a React component corresponding to the visual rendering of our web page.
3. It transforms this React component into pure HTML, without event listeners.
4. The browser receives and displays this HTML.
5. Once the JavaScript dependencies are loaded, the browser mounts the React component.
6. It replaces the HTML with this React component: since both have a completely identical rendering, the visitor sees no difference.

This technique has several advantages:
- The generated HTML is indexable by search engines since it is HTML describing a visual that is perfectly identical to what your React components should show.
- The visitor to your site sees a page display very quickly. Even if it is the first render and the dependencies take time to load.
- You use React to create your site's HTML, which means using a component system that has proven to be a time-saver.

## It's a native feature with Jopi

With Jopi, the use of React SSR is a fundamental element. That's why you don't have to do anything special to activate this feature.

## Ultra-fast integration

Jopi differs from tools like Vite.js and Next.js in that there is no prior compilation or optimization phase. Compilations are done page by page at the time of the first request, and this in less than a tenth of a second. This is why with Jopi, often restarting the server to run tests is not a problem.