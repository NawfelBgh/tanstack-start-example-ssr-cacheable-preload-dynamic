# TanStack Start Example: SSR Publicly Cacheable Content And Preload Dynamic Content

This is a modified version of the basic TanStack Start example. It demonstrates the pattern of server-side rendering publicly-cacheable page content, while using `<link rel="preload">` tags to accelerate the fetching of non-cacheable user-specific content.

`<link rel="preload">` tags allow preloading dynamic page data as soon as the client loads the page's head element and before any script is loaded. This gives performance similar to and sometimes better than streaming the whole page content due to better cache efficiency. See [comparison article](https://nawfelbgh.github.io/blog/when-pre-loading-beats-streaming-the-caching-advantage/).

```mermaid
sequenceDiagram
    participant Client
    participant ClientCache as Client Cache
    participant SharedCache as Shared Cache
    participant Server

    Client->>ClientCache: GET /page
    ClientCache->>SharedCache: GET /page
    SharedCache-->>ClientCache: Page Content
    ClientCache-->>Client: Page Content

    Client->>ClientCache: GET /api/dynamic (preload)
    ClientCache->>SharedCache: GET /api/dynamic
    SharedCache->>Server: GET /api/dynamic

    Client->>ClientCache: GET /script.js
    ClientCache->>SharedCache: GET /script.js
    SharedCache-->>ClientCache: Script Content
    ClientCache-->>Client: Script Content

    Server-->>SharedCache: /api/dynamic Content
    SharedCache-->>ClientCache: /api/dynamic Content

    Client->>Client: Execute Script

    Client->>ClientCache: GET /api/dynamic (fetch from script)
    ClientCache-->>Client: /api/dynamic Content (from cache)
```

If the server takes a long time to respond to the preloading fetch, and the script ends up fetching the same URL before the preload is finished, the browser does not send a second request. Instead, it waits for the preload to finish and reuses its response. All major browsers conform to this behavior, which the [spec](https://html.spec.whatwg.org/multipage/links.html#link-type-preload) describes in opaque terms:

> To consume a preloaded resource [...]
>
> 9. If entry's response is null, then set entry's on response available to onResponseAvailable.
> 10. Otherwise, call onResponseAvailable with entry's response.

---

This repo contains 2 versions:

- One using server functions to get dynamic content, on the branch [main](https://github.com/NawfelBgh/tanstack-start-example-ssr-cacheable-preload-dynamic/tree/main), and
- One using classic API routes to get them, on the branch [use-classic-api-routes](https://github.com/NawfelBgh/tanstack-start-example-ssr-cacheable-preload-dynamic/tree/use-classic-api-routes).

## Server functions version

### Limitations

Today, TanStack server function implementation has limitations that prevent using them with `<link rel="preload">` tags:

- The server functions' server-side implementation only returns content when the header `x-tsr-serverFn: true` is sent.
    - This repo works around this issue using [patch-package](https://www.npmjs.com/package/patch-package) with [the provided patch](patches/@tanstack+start-server-core+1.167.28.patch)
- The server functions' client-side implementation generates requests that are different from those created by `<link rel="preload">`, preventing browsers from reusing the preloaded content.
    - The differences are:
        - The added header `x-tsr-serverFn: true`
        - Not including credentials (Cookie), which is the default behavior for `fetch`.
    - It also fetches in `cors` mode (the default for `fetch`), meaning that we must match it by using `<link rel="preload" crossorigin="use-credentials" as="fetch" href="...">`. This works perfectly fine in Chromium-based browsers and in Firefox. But [Safari does not reuse cross-origin preloads](https://stackoverflow.com/a/63814972).
    - This repo works around these issues using [patch-package](https://www.npmjs.com/package/patch-package) with [the provided patch](patches/@tanstack+start-client-core+1.168.1.patch)
- Server functions do not provide a way to get their URLs with given parameters, which is needed to construct preload URLs. Currently, only the `serverFn.url` attribute is provided which only works for preloading GET server functions with no parameters.
    - This repo works around this issue by [manually calling seroval to serialize parameters](src/utils/serializeServerFnPayload.ts).

This means that to use the SSR-cacheable-content/preload-dynamic-content pattern today, we must either use normal API routes, as demonstrated on the branch [use-classic-api-routes](https://github.com/NawfelBgh/tanstack-start-example-ssr-cacheable-preload-dynamic/tree/use-classic-api-routes), or turn to fragile workarounds to implement it using server functions. This repo aims to document the limitations and appeal to TanStack maintainers to address them in a future release.

### Implementation details

- The app [defines](src/utils/users.ts) two server functions for getting dynamic user-specific information:
    - `fetchUser()` fetches user name and profile pic
    - `fetchUserLike(postId: number)` fetches whether the user likes a given post
- Both functions:
    - use cookies to get the user session,
    - use a 2-second setTimeout to simulate slow network loading, and
    - are accessed through TanStack query wrappers for ease of consumption.
- The page's [_layout](src/routes/_layout.tsx) inserts a preload tag to the head of the page to preload `fetchUser()` when rendered on the server. On the client, it renders the [UserInfo](src/components/UserInfo.tsx) component which calls `fetchUser()` reusing the already preloaded fetch.
- Likewise, the page [_layout/posts/$postId](src/routes/_layout.posts.$postId.tsx) inserts a preload tag to the head of the page to preload `fetchUserLike(postId)` when rendered on the server. On the client, it renders the [UserLike](src/components/UserLike.tsx) component which calls `fetchUserLike(postId)` reusing the already preloaded fetch.
- On client-side navigation, dynamic page data is loaded by route loaders, instead of relying on `<link rel="preload">` tags. This way, page prefetching on link hover does take into account the dynamic data.
- All pages set the Cache-Control header to `public, max-age=600`.

## Getting Started

From your terminal:

```sh
npm install
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Build

To build the app for production:

```sh
npm run build
```
