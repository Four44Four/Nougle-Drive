import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";
import QRCode from "react-qr-code";

import type { Database } from "./types/supabase"
import * as BEUtil from "./BackendUtil";
import { type Page } from "./App";
import "./App.css";

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  setMFAFactorId: Dispatch<SetStateAction<string | null>>;
  isSignedIn: boolean;
  wasEnrolled: boolean;
  curAccountId: string | null;
  curUsername: string | null;
  setPostMFAPage: Dispatch<SetStateAction<Page>>;
  setPostMFAAccountId: Dispatch<SetStateAction<string | null>>;
  setPostMFAUsername: Dispatch<SetStateAction<string | null>>;
};

export default function ({ supabaseClient, setCurPage, setMFAFactorId, isSignedIn, wasEnrolled,
                           curAccountId, curUsername,
                           setPostMFAPage, setPostMFAAccountId, setPostMFAUsername
                         }: PageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [enrollQURI, setEnrollQURI] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const enrollRes = (await BEUtil.enrollUserTOTPMFA(supabaseClient))!;
      if (enrollRes instanceof Error) {
        alert("Backend error:" + enrollRes.message);
      } else {
        setMFAFactorId(enrollRes.id);
        setEnrollQURI(enrollRes.totp.uri);
      }

      setIsLoading(false);
    })();
  }, []);

  const onTryVerifyChallenge = async () => {
    setCurPage("challenge2fa");
    setPostMFAPage("account");
    setPostMFAAccountId(curAccountId);
    setPostMFAUsername(curUsername);
  };

  if (isLoading) {
    return (
      <div className="centered">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  else {
    if (isSignedIn) {
      if (wasEnrolled) {
        return (
          <div className="centered">
            <h1>You already have 2FA enabled.</h1>
          </div>
        );
      }
      else {
        return (
          <div className="centered">
            <h1>Setting up TOTP 2FA</h1>
            {enrollQURI !== null && (
              <div>
                <h3>Scan this with your authenticator app</h3>
                <QRCode value={enrollQURI} size={256} />
                <br />
                <br />
                <button onClick={onTryVerifyChallenge}>
                  Try verify (get QR code before pressing this)
                </button>
              </div>
            )}
          </div>
        );
      }
    } else {
      return (
        <div className="centered">
          <h1>You're not signed in.</h1>
        </div>
      );
    }
  }
}
