import { ClientOnly, createFileRoute } from '@tanstack/react-router'
import { postQueryOptions } from '../utils/posts'
import { NotFound } from '~/components/NotFound'
import { PostErrorComponent } from '~/components/PostError'
import { isServer } from '~/utils/isServer'
import { userLikeQueryOptions, userLikeQueryPreloadLinks } from '~/utils/users'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { UserLike } from '~/components/UserLike'

export const Route = createFileRoute('/_layout/posts/$postId')({
  loader: async ({ params: { postId }, context }) => {
    const promises: Promise<unknown>[] = [];
    promises.push(context.queryClient.ensureQueryData(postQueryOptions(postId)));
    if (!isServer()) {
      promises.push(context.queryClient.ensureQueryData(userLikeQueryOptions(postId)));
    }
    await Promise.all(promises);
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
    links: isServer() ? await userLikeQueryPreloadLinks(params.postId) : [],
  }),
})

function PostComponent() {
  const { postId } = Route.useParams()
  const { data: post } = useSuspenseQuery(postQueryOptions(postId))

  return (
    <div className="space-y-2">
      <h4 className="text-xl font-bold underline">
        {post.title}
        {' '}
        <ClientOnly fallback='⌛'>
          <Suspense fallback='⌛'>
            <UserLike postId={postId} />
          </Suspense>
        </ClientOnly>
      </h4>
      <div className="text-sm">{post.body}</div>
    </div>
  )
}
