import { useSuspenseQuery } from "@tanstack/react-query"
import { userQueryOptions } from "~/utils/users"

export function UserInfo() {
  const { data: user } = useSuspenseQuery(userQueryOptions());
  return <>
    <img src={user.profilePic} />
    <span>{user.name}</span>
  </>
}