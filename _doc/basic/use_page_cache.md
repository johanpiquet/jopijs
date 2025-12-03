# Using page cache

## Pages are cached

By default, Jopi caches all React.js pages to make the site more responsive (files `page.tsx`). These caches make the whole site as fast as using static files, meaning converting the site to a static site will not offer performance gains.

> WARNING The automatic caching system anonymizes the user.
> Their roles are checked when accessing the page, then the user is rendered anonymous
> so that the cached page is generic.

## Two caches are provided

By default Jopi uses an in-memory cache, however a high-performance disk cache is available.

**Enable disk cache**
```typescript
import {jopiApp} from "jopijs";

jopiApp.startApp(import.meta, jopiEasy => {
    jopiEasy.create_webSiteServer()
        .configure_cache()
            .use_fileSystemCache(".cache")
            .END_configure_cache()
});
```

## Customize the cache

Cache can be customized globally while adding exceptions route by route.

You can:
* Disable automatic cache globally, or for specific routes.
* Modify what is stored in the cache.
* Modify what is loaded from the cache.
* Act before cache verification.

### Disable cache for a route

You can disable the cache for a route in three ways.

1. By adding a `cache.disable` file in the route folder.
2. Via an option in the route's `config.ts` file.
3. When creating the server.

**Using the config.ts file**
```typescript
import {RouteConfig} from "jopijs";

export default function (config: RouteConfig) {
    config.onGET.cache_disableAutomaticCache();

    // Other possible hooks:
	// - cache_afterGetFromCache
	// - cache_beforeAddToCache
	// - cache_beforeCheckingCache
}
```

**Example when creating the server**
```typescript
import {jopiApp} from "jopijs";
import myUsers from "./myUsers.json" with { type: "json" };

jopiApp.startApp(import.meta, jopiEasy => {
    jopiEasy.create_webSiteServer()
        .configure_cache()
            .add_cacheRules({
                // The regexp is optional.
                // If set, it validates the route
                // and determines if this rule applies.
                //
                regExp: /\/users\/.*$/,

                // This rule disables
                // the cache for this route.
                //
                disableAutomaticCache: true,

                // Other possible rules:
                // - afterGetFromCache
                // - beforeAddToCache
                // - beforeCheckingCache
            })

            // We can add more than one rule.
            .add_cacheRules({
	            regExp: /\/card\/.*$/,
	            disableAutomaticCache: true,
            })

            .END_configure_cache()
    });
```

### Customize cache behavior

The hooks `afterGetFromCache`, `beforeAddToCache` and `beforeCheckingCache` can be defined similarly to customize how the cache is read and written.

## User anonymization

The function `req.user_fakeNoUsers` anonymizes the user, acting as if no user is logged in.
This function is called when automatic cache is enabled and it is necessary to generate the content to be cached.

The behavior of `req.user_fakeNoUsers` can be modified by adding a listener via `req.user_onFakeNoUser`.
This listener can cancel the call to `req.user_fakeNoUsers`, or add modifications (e.g. removing cookies).

This listener can be attached:
* Via `cache_beforeAddToCache` in the route's `config.ts` file.
* Via `configure_cache().on_fakeNoUser` in `src/index.ts` or a module's `serverInit.ts` file.
