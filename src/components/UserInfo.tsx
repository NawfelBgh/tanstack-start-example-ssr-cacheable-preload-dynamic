import { Suspense, use, useMemo } from "react";
import { fetchUser, UserType } from "~/utils/users";

export function UserInfo() {
  // Fetch non-cacheable userInfo on the client side
  const userInfoPromise = useMemo(async () => {
    // Add a timeout to simulated delayed script execution, to make the effect of <link rel="preload"> more apparent
    // await new Promise(resolve => setTimeout(resolve, 1_000));
    return fetchUser()
  }, []);

  return <Suspense fallback='⌛'>
    <UserInfoInner userInfoPromise={userInfoPromise} />
  </Suspense>;
}

function UserInfoInner(props: { userInfoPromise: Promise<UserType> }) {
  const userInfo = use(props.userInfoPromise);
  return <>
    <img src={userInfo.profilePic} />
    <span>{userInfo.name}</span>
  </>;
}
