import { ClientOnly, Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start';
import { EnsureData } from '~/utils/EnsureData';
import { isServer } from '~/utils/isServer';
import { fetchUser } from '~/utils/users';


const userLoader = createClientOnlyFn(async () => {
  // Add a timeout to simulated delayed script execution, to make the effect of <link rel="preload"> more apparent
  // await new Promise(resolve => setTimeout(resolve, 1_000));
  
  return fetchUser();
});

export const Route = createFileRoute('/_layout')({
  loader: async () => {
    return {
      user: isServer() ? undefined : await userLoader(),
    };
  },
  component: LayoutComponent,
  head: () => ({
    // Only add <link rel=preload> tag on initial server render
    links: isServer() ? [
      {
        rel: 'preload',
        // In this simple case, fetchUser.url is sufficient
        href: fetchUser.url,
        as: 'fetch',
        crossOrigin: "use-credentials",
      },
    ] : [],
  }),
})

function LayoutComponent() {
  const { user } = Route.useLoaderData();
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
          <EnsureData
            fallback='⌛'
            data={user}
            loader={userLoader}
          >
            {({ data }) => <>
              <img src={data.profilePic} />
              <span>{data.name}</span>
            </>}
          </EnsureData>
        </ClientOnly>
      </div>
      <hr />
      <Outlet/>
    </>
  )
}
