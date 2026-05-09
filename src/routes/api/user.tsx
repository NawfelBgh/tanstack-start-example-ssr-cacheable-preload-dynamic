import { createFileRoute } from '@tanstack/react-router'
import { getCookie } from '@tanstack/react-start/server';
import { UserType } from '~/utils/users'

export const Route = createFileRoute('/api/user')({
  server: {
    handlers: {
      GET: async () => {
        // Get user info from session
        const session = getCookie('session');
        console.info('Fetching user information');
        
        // Make the response extra slow for testing
        await new Promise(resolve => setTimeout(resolve, 2_000));
        return new Response(JSON.stringify({
          id: 1,
          name: 'UserName',
          profilePic: 'https://www.loremfaces.net/24/id/1.jpg'
        } as UserType));
      }
    }
  }
})
