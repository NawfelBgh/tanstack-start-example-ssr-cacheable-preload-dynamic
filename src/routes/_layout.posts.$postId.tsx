import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { fetchPost } from '../utils/posts'
import { NotFound } from '~/components/NotFound'
import { PostErrorComponent } from '~/components/PostError'
import { fetchUserLike } from '~/utils/users'
import { serialize } from '~/utils/serializeServerFnPayload'
import { UserLike } from '~/components/UserLike'

export const Route = createFileRoute('/_layout/posts/$postId')({
  loader: ({ params: { postId } }) => fetchPost({ data: postId }),
  errorComponent: PostErrorComponent,
  component: PostComponent,
  notFoundComponent: () => {
    return <NotFound>Post not found</NotFound>
  },
  // Make the page publicly cacheable
  headers: async () => ({
    'cache-control': 'public, max-age=600',
  }),
  head: async ({ params }) => ({
    links: [
      {
        rel: 'preload',
        // FIXME: We need an official helper function to get server function's URL for given parameters
        href: fetchUserLike.url + '?payload=' + encodeURIComponent(await serialize({ data: +params.postId })),
        as: 'fetch',
        crossOrigin: "use-credentials",
      },
    ],
  }),
})

function PostComponent() {
  const post = Route.useLoaderData()

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">
        {post.title}
        {' '}
        <ClientOnly fallback='⌛'>
          <UserLike postId={post.id} />
        </ClientOnly>
      </h4>
      <div className="text-sm">{post.body}</div>
    </div>
  )
}
