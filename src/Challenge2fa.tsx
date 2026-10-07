import { useRef, ChangeEvent, Dispatch, SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types/supabase"
import * as BEUtil from "./BackendUtil";
import { type Page } from "./App";

const MAX_CODE_INPUT_LENGTH = 6;

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  factorId: string | null;
  setIsSignedIn: Dispatch<SetStateAction<boolean>>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  setCurAccountId: Dispatch<SetStateAction<string | null>>;
  setCurUsername: Dispatch<SetStateAction<string | null>>;
  postMFAPage: Page;
  postMFAAccountId: string | null;
  postMFAUsername: string | null;
  setWasEnrolled: Dispatch<SetStateAction<boolean>>;
};

export default function ({ supabaseClient, factorId,
                           setIsSignedIn, setCurPage, setCurAccountId, setCurUsername,
                           postMFAPage, postMFAAccountId, postMFAUsername,
                           setWasEnrolled,
                         }: PageProps) {
  const codeInputRef = useRef<HTMLInputElement | null>(null);

  const onCodeFinishInput = async () => {
    if (codeInputRef.current === null || factorId === null) {
      return;
    }

    const mfaChallengeRes = await BEUtil.checkMFAChallenge(supabaseClient, factorId, codeInputRef.current.value);
    if (mfaChallengeRes instanceof Error) {
      alert(mfaChallengeRes.message);
      codeInputRef.current.value = "";
    } else {
      setIsSignedIn(true);

      setCurPage(postMFAPage);
      setCurAccountId(postMFAAccountId);
      setCurUsername(postMFAUsername);
      setWasEnrolled(true);
    }
  }

  const onCodeInputChange = () => {
    if (codeInputRef.current === null) {
      return;
    }

    if (codeInputRef.current.value.length === MAX_CODE_INPUT_LENGTH) {
      onCodeFinishInput();
    }
  }

  return (
    <div>
      <h1>Enter current TOTP code</h1>
      <input ref={codeInputRef} onChange={onCodeInputChange} type="text" placeholder="123456" maxLength={MAX_CODE_INPUT_LENGTH}/>
    </div>
  );
}
