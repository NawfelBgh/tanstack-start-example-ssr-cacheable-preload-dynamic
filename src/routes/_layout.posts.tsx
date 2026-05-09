import { Link, Outlet, createFileRoute, useRouterState } from '@tanstack/react-router'
import { postsQueryOptions } from '../utils/posts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { isServer } from '~/utils/isServer'

export const Route = createFileRoute('/_layout/posts')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(postsQueryOptions())
  },
  head: () => ({
    meta: [{ title: 'Posts' }],
  }),
  component: PostsComponent,
});

function PostsComponent() {
  const postsQuery = useSuspenseQuery(postsQueryOptions());
  const routerStatus = useRouterState({ select: (s) => s.status });
  // Note: when the page is rendered on the server side, routerStatus is pending
  // routerStatus does not change to idle, on page load on the client
  // hence the isServer() check
  const isNavigatingAway = useMemo(() => routerStatus === 'pending' && !isServer(), [routerStatus, isServer()]);

  return (
    <div className="p-2 flex gap-2">
      <ul className="list-disc pl-4">
        {[
          ...postsQuery.data,
          { id: 'i-do-not-exist', title: 'Non-existent Post' },
        ].map((post) => {
          return (
            <li key={post.id} className="whitespace-nowrap">
              <Link
                to="/posts/$postId"
                params={{
                  postId: post.id,
                }}
                className="block py-1 text-blue-800 hover:text-blue-600"
                activeProps={{ className: 'text-black font-bold' }}
              >
                <div>{post.title.substring(0, 20)}</div>
              </Link>
            </li>
          )
        })}
      </ul>
      <hr />
      <div className={(isNavigatingAway ? ' opacity-50' : '')}>
        <Outlet/>
      </div>
    </div>
  )
}
