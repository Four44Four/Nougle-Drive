import { useRef, Dispatch, SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "./types/supabase";
import * as BEUtil from "./BackendUtil";
import { type Page } from "./App";

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  setCurAccountId: Dispatch<SetStateAction<string | null>>;
  setCurUsername: Dispatch<SetStateAction<string | null>>;
};

export default function ({ supabaseClient, setCurPage, setCurAccountId, setCurUsername }: PageProps) {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const onRegister = async () => {
    if (usernameRef.current === null || passwordRef.current === null) {
      return;
    }

    const registerRes = await BEUtil.registerUser(supabaseClient, usernameRef.current.value, passwordRef.current.value);
    if (registerRes instanceof Error) {
      alert(registerRes.message);
    } else {
      setCurPage("account");
      setCurAccountId(registerRes);
      setCurUsername(usernameRef.current.value);
    }
  };

  const onSignIn = async () => {
    if (usernameRef.current === null || passwordRef.current === null) {
      return;
    }

    const signInRes = await BEUtil.signInUser(supabaseClient, usernameRef.current.value, passwordRef.current.value);
    if (signInRes instanceof Error) {
      alert(signInRes.message);
    } else {
      setCurPage("account");
      setCurAccountId(signInRes);
      setCurUsername(usernameRef.current.value);
    }
  };

  return (
    <div>
      <h1>REGISTER or SIGN-IN</h1>
      <input ref={usernameRef} type="text" placeholder="Enter username here..." />
      <input ref={passwordRef} type="password" placeholder="Enter password here..." />

      <button onClick={onRegister}>
        Register
      </button>
      <button onClick={onSignIn}>
        Sign in
      </button>
    </div>
  );
}
