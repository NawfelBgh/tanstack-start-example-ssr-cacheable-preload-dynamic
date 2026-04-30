import { Suspense, use, useMemo } from "react";
import { fetchUserLike } from "~/utils/users";

export function UserLike(props: {postId: number}) {
  // Fetch non-cacheable user like on the client side
  const likePromise = useMemo(async () => {
    // Add a timeout to simulated delayed script execution, to make the effect of <link rel="preload"> more apparent
    // await new Promise(resolve => setTimeout(resolve, 1_000));
    return fetchUserLike({ data: props.postId });
  }, [props.postId]);

  return <Suspense fallback='⌛'>
    <UserLikeInner likePromise={likePromise} />
  </Suspense>;
}

function UserLikeInner(props: { likePromise: Promise<boolean> }) {
  const like = use(props.likePromise);
  return like ? '❤️' : '♡';
}
