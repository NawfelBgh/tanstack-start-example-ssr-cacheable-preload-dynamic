# TanStack Start - Preloading with Link Tags Example

This is a modified version of the basic TanStack Start example. It demonstrates using server functions to implement Server-Side Rendering for publicly-cacheable page content, while using `<link rel="preload">` tags to accelerate the fetching of non-cacheable user-specific content.

`<link rel="preload">` tags allow preloading dynamic page data as soon as the client loads the page's head element and before any script is loaded. This gives performance similar to and sometimes better than streaming the whole page content due to better cache efficiency. See [comparison article](https://nawfelbgh.github.io/blog/when-pre-loading-beats-streaming-the-caching-advantage/).

Today, TanStack server function implementation has limitations that prevent using them with `<link rel="preload">` tags:

- The server-side implementation only returns content when the header `x-tsr-serverFn: true` is sent.
    - This repo works around this issue using [patch-package](https://www.npmjs.com/package/patch-package) with [the provided patch](patches/@tanstack+start-server-core+1.167.22.patch)
- Server functions do not provide a way to get their URLs with given parameters, which is needed to construct preload URLs. Currently, only the `serverFn.url` attribute is provided which only works for preloading GET server functions with no parameters.
    - This repo works around this issue by [manually calling seroval to serialize parameters](src/utils/serializeServerFnPayload.ts).

This means that to use the SSR-cacheable-content/preload-dynamic-content pattern today, we must either use normal API routes, or turn to such fragile workarounds to implement it using server functions. This repo aims to document the limitations and appeal to TanStack maintainers to address them in a future release.

## Implementation details

- The app [defines](src/utils/users.ts) two server functions for getting dynamic user-specific information:
    - `fetchUser()` fetches user name and profile pic
    - `fetchUserLike(postId: number)` fetches whether the user likes a given post
- Both functions:
    - use cookies to get the user session,
    - set a small max-age value (`private, max-age=5`) so that preloaded values are reused by subsequent fetches, and
    - use a 2-second setTimeout to simulate slow network loading.
- The page's [_layout](src/routes/_layout.tsx) inserts a preload tag to the head of the page to preload `fetchUser()`. And it renders a client-only component [UserInfo](src/components/UserInfo.tsx) which calls `fetchUser()` reusing the already preloaded fetch.
- Likewise, the page [_layout/posts/$postId](src/routes/_layout.posts.$postId.tsx) inserts a preload tag to the head of the page to preload `fetchUserLike(postId)`. And it renders the client-only component [UserLike](src/components/UserLike.tsx) which calls `fetchUserLike()` reusing the already preloaded fetch.
- All pages set the Cache-Control header `public, max-age=600`.

## Approach limitations

When doing client-side navigation, it makes more sense to fetch dynamic page parts using standard router loader functions to take advantage of the router's prefetching. I think this is achievable using client-side specific logic in both routes' loader and head functions, but I fear that would be less clean and less maintainable.

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
