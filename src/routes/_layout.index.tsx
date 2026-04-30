import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/')({
  component: Home,
  // Make the page publicly cacheable
  headers: async () => ({
    'cache-control': 'public, max-age=600',
  }),
})

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
    </div>
  )
}
