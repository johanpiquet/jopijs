# Pages 401, 404 and 500

You can define a page to display when a 404 (not found) or 500 (server error) occurs. To do this, simply create a page error404 `@routes/error404/page.tsx` and a page error500 `@routes/error404/page.tsx`. The same applies to the 401 error (not authorized) with a page error401 `@routes/error404/page.tsx`.

Note:
* The 404 error is stored in a fast-access cache. It therefore cannot be customized.
* These pages are only returned for a GET request where an HTML response is expected. For an API, a simple response with the error code is returned.

