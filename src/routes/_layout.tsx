import { ClientOnly, Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react';
import { UserInfo } from '~/components/UserInfo';
import { isServer } from '~/utils/isServer';
import { userQueryOptions, userQueryPreloadLinks } from '~/utils/users';

export const Route = createFileRoute('/_layout')({
  loader: async ({ context }) => {
    if (!isServer()) {
      await context.queryClient.ensureQueryData(userQueryOptions());
    }
  },
  component: LayoutComponent,
  head: () => ({
    // Only add <link rel=preload> tag on initial server render
    links: isServer() ? userQueryPreloadLinks() : [],
  }),
})

function LayoutComponent() {
  return (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{' '}
        <Link
          to="/posts"
          activeProps={{
            className: 'font-bold',
          }}
        >
          Posts
        </Link>{' '}
        <ClientOnly fallback='⌛'>
          <Suspense fallback='⌛'>
            <UserInfo />
          </Suspense>
        </ClientOnly>
      </div>
      <hr />
      <Outlet/>
    </>
  )
}
