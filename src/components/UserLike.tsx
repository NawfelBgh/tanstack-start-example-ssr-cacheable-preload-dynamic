import { useSuspenseQuery } from "@tanstack/react-query";
import { userLikeQueryOptions } from "~/utils/users";

export function UserLike(props: { postId: string }) {
  const { data: isLiked } = useSuspenseQuery(userLikeQueryOptions(props.postId));
  return isLiked ? '❤️' : '♡';
}