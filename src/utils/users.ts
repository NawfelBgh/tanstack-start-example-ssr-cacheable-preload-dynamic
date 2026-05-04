import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookie, setResponseHeader } from '@tanstack/react-start/server'
import { serialize } from './serializeServerFnPayload'
import { AnyRouteMatch } from '@tanstack/react-router'

export type UserType = {
  id: number
  name: string
  profilePic: string
}

export const fetchUser = createServerFn()
  .handler(async ({ data }) => {
    // Get user info from session
    const session = getCookie('session');
    // Make the response privately cacheable for a short time (5 seconds), so that it gets reused when preloaded
    setResponseHeader('cache-control', 'private, max-age=5')
    console.info('Fetching user information');
    
    // Make the response extra slow for testing
    await new Promise(resolve => setTimeout(resolve, 2_000));
    return {
        id: 1,
        name: 'UserName',
        profilePic: 'https://www.loremfaces.net/24/id/1.jpg'
    } as UserType;
  })

export const fetchUserLike = createServerFn()
  .inputValidator((postId: number) => postId)
  .handler(async ({ data: postId}) => {
    // Get user info from session
    const session = getCookie('session');
    // Check the database
    console.info(`Checking if user liked post id ${postId}...`)
    // Make the response privately cacheable for a short time (5 seconds), so that it gets reused when preloaded
    setResponseHeader('cache-control', 'private, max-age=5')

    // Make the response extra slow for testing
    await new Promise(resolve => setTimeout(resolve, 2_000));
    return true;
  })

export const userQueryOptions = () => queryOptions({
  queryKey: ['user'],
  queryFn: async () => {
    // Add a timeout to simulated delayed script execution, to make the effect of <link rel="preload"> more apparent
    // await new Promise(resolve => setTimeout(resolve, 1_000));
    
    return fetchUser();
  },
});

export const userQueryPreloadLinks = (): AnyRouteMatch['links'] => [
  {
    rel: 'preload',
    // In this simple case, fetchUser.url is sufficient
    href: fetchUser.url,
    as: 'fetch',
    crossOrigin: "use-credentials",
  },
];

export const userLikeQueryOptions = (postId: string) => queryOptions({
  queryKey: ['userLike', postId],
  queryFn: async () => {
    // Add a timeout to simulated delayed script execution, to make the effect of <link rel="preload"> more apparent
    // await new Promise(resolve => setTimeout(resolve, 1_000));
    
    return fetchUserLike({ data: +postId });
  },
});

export const userLikeQueryPreloadLinks = async (postId: string): Promise<AnyRouteMatch['links']> => [
  {
    rel: 'preload',
    // FIXME: We need an official helper function to get server function's URL for given parameters
    href: fetchUserLike.url + '?payload=' + encodeURIComponent(await serialize({ data: +postId })),
    as: 'fetch',
    crossOrigin: "use-credentials",
  },
];
