# Using catch-all URLs

Suppose you want everything that starts with the URL `http://mysite/blog` to display the content from the site `http://localhost:8080`. To implement this behavior, one requirement is to add a listener for all URLs starting with `http://mysite/blog`, for example `/blog/topicA/20251101` and `/blog/author`.

This is where catch-all URLs are useful.

In the router file structure, the special folder name `[...]` defines a listener for all such URLs.

**Example of defining a catch-all URL**
```
@routes/
|- blog/                   < Mapped to url http://mysite/blog
   |-[...]/                < Will catch all urls starting with /blog/
     |- onGET.ts           < Define the function to call
```

**Contents of onGET.ts**
```typescript
import {JopiRequest, ServerFetch} from "jopijs";

const sf = ServerFetch.useIP("myblog", "127.0.0.1:8080");

export default async function (req: JopiRequest) {
    return await req.proxy_proxyRequestTo(sf);
}
```
