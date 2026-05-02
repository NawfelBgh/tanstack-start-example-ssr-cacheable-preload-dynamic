import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { fetchPost } from '../utils/posts'
import { NotFound } from '~/components/NotFound'
import { PostErrorComponent } from '~/components/PostError'
import { EnsureData } from '~/utils/EnsureData'
import { createClientOnlyFn } from '@tanstack/react-start'
import { isServer } from '~/utils/isServer'
import { fetchUserLike } from '~/utils/users'
import { serialize } from '~/utils/serializeServerFnPayload'

const likeLoader = createClientOnlyFn(async (postId: string) => {
  // Add a timeout to simulated delayed script execution, to make the effect of <link rel="preload"> more apparent
  // await new Promise(resolve => setTimeout(resolve, 1_000));
  
  return fetchUserLike({ data: +postId });
});

export const Route = createFileRoute('/_layout/posts/$postId')({
  loader: ({ params: { postId } }) => {
    const post = fetchPost({ data: postId });
    const like = isServer() ? undefined : likeLoader(postId);
    return Promise.all([post, like]).then(([post, like]) => ({
      post,
      like,
    }))
  },
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
    // Only add <link rel=preload> tag on initial server render
    links: isServer() ? [
      {
        rel: 'preload',
        // FIXME: We need an official helper function to get server function's URL for given parameters
        href: fetchUserLike.url + '?payload=' + encodeURIComponent(await serialize({ data: +params.postId })),
        as: 'fetch',
        crossOrigin: "use-credentials",
      },
    ] : [],
  }),
})

function PostComponent() {
  const {post, like} = Route.useLoaderData()

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">
        {post.title}
        {' '}
        <ClientOnly fallback='⌛'>
          <EnsureData
            fallback='⌛'
            params={post.id + ''}
            data={like}
            loader={likeLoader}
          >
            {({ data: isLiked }) => isLiked ? '❤️' : '♡'}
          </EnsureData>
        </ClientOnly>
      </h4>
      <div className="text-sm">{post.body}</div>
    </div>
  )
}
