import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/posts/')({
  component: PostsIndexComponent,
  // Make the page publicly cacheable
  headers: async () => ({
    'cache-control': 'public, max-age=600',
  }),
})

function PostsIndexComponent() {
  return <div>Select a post.</div>
}
