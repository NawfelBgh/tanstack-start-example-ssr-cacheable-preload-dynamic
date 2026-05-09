import { createFileRoute } from '@tanstack/react-router'
import { getCookie } from '@tanstack/react-start/server';

export const Route = createFileRoute('/api/post/$postId/like')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        // Get user info from session
        const session = getCookie('session');
        // Check the database
        console.info(`Checking if user liked post id ${params.postId}...`);

        // Make the response extra slow for testing
        await new Promise(resolve => setTimeout(resolve, 2_000));
        return new Response("true");
      }
    }
  }
})
