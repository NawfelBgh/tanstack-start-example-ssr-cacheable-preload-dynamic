import { ClientOnly, Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { UserInfo } from '~/components/UserInfo';
import { fetchUser } from '~/utils/users';

export const Route = createFileRoute('/_layout')({
  component: LayoutComponent,
  head: ({ params }) => ({
    links: [
      {
        rel: 'preload',
        // In this simple case, fetchUser.url is sufficient
        href: fetchUser.url,
        as: 'fetch',
        crossOrigin: "use-credentials",
      },
    ],
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
          <UserInfo />
        </ClientOnly>
      </div>
      <hr />
      <Outlet/>
    </>
  )
}
