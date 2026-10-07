import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from "./types/supabase"
import Login from "./Login";
import Account from "./Account";
import Activate2fa from "./Activate2fa";
import Challenge2fa from "./Challenge2fa";
import * as BEUtil from "./BackendUtil";
import "./App.css";

const supabaseClient = createClient<Database>(import.meta.env.VITE_SUPABASE_URL,
                                              import.meta.env.VITE_SUPABASE_KEY
//   , {
//     auth: {
//       persistSession: false,
//     }
// }
);

export type Page = "login" | "account" | "activate2fa" | "challenge2fa";

// returns if `setWasEnrolled` was set to `true` or not effected
// can call `setWasEnrolled` as a side effect
export async function checkIfEnrolled(
  supabaseClient: SupabaseClient<Database>,
  setWasEnrolled: Dispatch<SetStateAction<boolean>>,
) {
  let retVal = false;
  const totpFactorsRes = await BEUtil.getUserTOTPMFAFactors(supabaseClient);

  if (totpFactorsRes instanceof Error) {
    alert(totpFactorsRes.message);
  } else {
    retVal = totpFactorsRes?.some(curFactor => curFactor.status === "verified")
               ?? false;
    setWasEnrolled(retVal);
  }

  return retVal;
}

export default function () {
  const [curPage, setCurPage] = useState<Page>("login");
  const [curAccountId, setCurAccountId] = useState<string | null>(null);
  const [curUsername, setCurUsername] = useState<string | null>(null);
  const [mfaFactorId, setMFAFactorId] = useState<string | null>(null);
  const [postMFAPage, setPostMFAPage] = useState<Page>("login");
  const [postMFAAccountId, setPostMFAAccountId] = useState<string | null>(null);
  const [postMFAUsername, setPostMFAUsername] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [wasEnrolled, setWasEnrolled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // attempt to sign in from session
  useEffect(() => {
    (async () => {
      try {
        const sessionRes = await BEUtil.getSessionUser(supabaseClient);
        if (sessionRes instanceof Error) {
          alert(sessionRes.message);
        }
        else if (sessionRes !== null) {
          // console.log(" >> " + JSON.stringify(sessionRes));
          setIsSignedIn(true);

          await checkIfEnrolled(supabaseClient, setWasEnrolled);
          setCurPage("account");
          setCurAccountId(sessionRes.user.id);
          setCurUsername(sessionRes.user.user_metadata.username);
        }
      } catch (errorIn: any) {
        alert(JSON.stringify(errorIn));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="centered">
        <div className="loading-spinner"></div>
      </div>
    );
  } else {
    switch (curPage) {
      case "login": return <Login supabaseClient={supabaseClient} setCurPage={setCurPage} setCurAccountId={setCurAccountId!} setCurUsername={setCurUsername!}
                                  setIsSignedIn={setIsSignedIn} setWasEnrolled={setWasEnrolled}
                                  setPostMFAPage={setPostMFAPage} setPostMFAAccountId={setPostMFAAccountId} setPostMFAUsername={setPostMFAUsername}
                                  setMFAFactorId={setMFAFactorId} />;
      case "account": return <Account supabaseClient={supabaseClient} setCurPage={setCurPage} curAccountId={curAccountId!} curUsername={curUsername!} wasEnrolled={wasEnrolled} setWasEnrolled={setWasEnrolled} />;
      case "activate2fa": return <Activate2fa supabaseClient={supabaseClient} setCurPage={setCurPage} setMFAFactorId={setMFAFactorId} isSignedIn={isSignedIn} wasEnrolled={wasEnrolled}
                                              curAccountId={curAccountId} curUsername={curUsername}
                                              setPostMFAPage={setPostMFAPage} setPostMFAAccountId={setPostMFAAccountId} setPostMFAUsername={setPostMFAUsername} />;
      case "challenge2fa": return <Challenge2fa supabaseClient={supabaseClient} factorId={mfaFactorId}
                                                setIsSignedIn={setIsSignedIn} setCurPage={setCurPage} setCurAccountId={setCurAccountId} setCurUsername={setCurUsername}
                                                postMFAPage={postMFAPage} postMFAAccountId={postMFAAccountId} postMFAUsername={postMFAUsername}
                                                setWasEnrolled={setWasEnrolled} />;
      default: return <div><h1>INVALID PAGE</h1></div>;
    }
  }
  // const [i , setI] = useState<number>(0);

  // return (
  //   <div onClick={() => setI(oldI => oldI + 1)}>
  //     Thing: {i}
  //   </div>
  // );
}
