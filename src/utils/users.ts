import { createServerFn } from '@tanstack/react-start'
import { getCookie, setResponseHeader } from '@tanstack/react-start/server'

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
