# TanStack Start - Preloading with Link Tags Example

This is a modified version of the basic TanStack Start example. It demonstrates the pattern of Server-Side Rendering publicly-cacheable page content, while using `<link rel="preload">` tags to accelerate the fetching of non-cacheable user-specific content.

`<link rel="preload">` tags allow preloading dynamic page data as soon as the client loads the page's head element and before any script is loaded. This gives performance similar to and sometimes better than streaming the whole page content due to better cache efficiency. See [comparison article](https://nawfelbgh.github.io/blog/when-pre-loading-beats-streaming-the-caching-advantage/).

## Limitations of the server functions' implementation

Today, TanStack server function implementation has limitations that prevent using them with `<link rel="preload">` tags:

- The server-side implementation only returns content when the header `x-tsr-serverFn: true` is sent.
    - This repo works around this issue using [patch-package](https://www.npmjs.com/package/patch-package) with [the provided patch](patches/@tanstack+start-server-core+1.167.22.patch)
- Server functions do not provide a way to get their URLs with given parameters, which is needed to construct preload URLs. Currently, only the `serverFn.url` attribute is provided which only works for preloading GET server functions with no parameters.
    - This repo works around this issue by [manually calling seroval to serialize parameters](src/utils/serializeServerFnPayload.ts).

This means that to use the SSR-cacheable-content/preload-dynamic-content pattern today, we must either use normal API routes, as demonstrated on the branch [use-classic-api-routes](https://github.com/NawfelBgh/tanstack-start-example-ssr-cacheable-preload-dynamic/tree/use-classic-api-routes), or turn to fragile workarounds to implement it using server functions. This repo aims to document the limitations and appeal to TanStack maintainers to address them in a future release.

## Other issue found

- When router status is updated on page load, the component is not re-rendered to reflect it.
    - This can be tested by navigating to `/posts/1`: The page remains grayed out as if still in pending state. See [problem code](src/routes/_layout.posts.tsx#L39).

## Implementation details (server functions version)

For the classic APIs version check out to the [use-classic-api-routes](https://github.com/NawfelBgh/tanstack-start-example-ssr-cacheable-preload-dynamic/tree/use-classic-api-routes) branch.

- The app [defines](src/utils/users.ts) two server functions for getting dynamic user-specific information:
    - `fetchUser()` fetches user name and profile pic
    - `fetchUserLike(postId: number)` fetches whether the user likes a given post
- Both functions:
    - use cookies to get the user session,
    - set a small max-age value (`private, max-age=5`) so that preloaded values are reused by subsequent fetches, and
    - use a 2-second setTimeout to simulate slow network loading.
- The page's [_layout](src/routes/_layout.tsx) inserts a preload tag to the head of the page to preload `fetchUser()` when rendered on the server. On the client, it uses the [EnsureData](src/utils/EnsureData.tsx) helper component to call `fetchUser()` reusing the already preloaded fetch.
- Likewise, the page [_layout/posts/$postId](src/routes/_layout.posts.$postId.tsx) inserts a preload tag to the head of the page to preload `fetchUserLike(postId)` when rendered on the server. On the client, it uses the [EnsureData](src/utils/EnsureData.tsx) helper component to call `fetchUserLike(postId)` reusing the already preloaded fetch.
- On client-side navigation, dynamic page data is loaded by route loaders, instead of relying on `<link rel="preload">` tags. This way, page prefetching on link hover does take into account the dynamic data.
- All pages set the Cache-Control header `public, max-age=600`.

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
