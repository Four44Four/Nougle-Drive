import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "./types/supabase";
import { type Page } from "./App";
import Activate2fa from "./Activate2fa";
import * as BEUtil from "./BackendUtil";
import { type Foo } from "./BackendUtil";

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  curAccountId: string;
  curUsername: string;
  wasEnrolled: boolean;
  setWasEnrolled: Dispatch<SetStateAction<boolean>>;
};

export default function ({ supabaseClient, setCurPage, curAccountId, curUsername, wasEnrolled, setWasEnrolled }: PageProps) {
  const [foos, setFoos] = useState<Foo[]>([]);
  const fooContentRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      if (wasEnrolled
            && (await BEUtil.isClientMFAVerified(supabaseClient)) instanceof Error) {
        await BEUtil.signOutUser(supabaseClient);
        setCurPage("login");
      }

      const readRes = await BEUtil.readFoos(supabaseClient, curAccountId);
      if (readRes instanceof Error) {
        alert(readRes.message);
      } else {
        setFoos(readRes);
      }
    })();
  }, []);

  const onSignOut = async () => {
    const signOutRes = await BEUtil.signOutUser(supabaseClient);
    if (signOutRes instanceof Error) {
      alert(signOutRes.message);
    } else {
      alert("Signed out successfully");
      window.location.reload();
    }
  }

  const onDelete = async (fooIdIn: number) => {
    const deleteRes = await BEUtil.deleteFoo(supabaseClient, fooIdIn);
    if (deleteRes instanceof Error) {
      alert(deleteRes.message);
    } else {
      setFoos(oldFoos => oldFoos.filter(curFoo => curFoo.id !== fooIdIn));
      alert("Delete successful");
    }
  }

  const onAdd = async () => {
    if (fooContentRef.current === null) {
      return;
    }

    const createRes = await BEUtil.createFoo(supabaseClient, curAccountId, fooContentRef.current.value);
    if (createRes instanceof Error) {
      alert(createRes.message);
    } else {
      setFoos(oldFoos => [createRes, ...oldFoos]);
      fooContentRef.current.value = "";
      alert("Create successful");
    }
  }

  const onEnroll2FA = () => {
    setCurPage("activate2fa");
  }

  const onUnenroll2FA = async () => {
    const unenrollRes = await BEUtil.unenrollUserTOTPMFA(supabaseClient);

    if (unenrollRes instanceof Error) {
      alert(`Backend error: ${JSON.stringify(unenrollRes)}`);
    } else {
      setWasEnrolled(false);
      alert("Successfully unenrolled from MFA");
    }
  }

  return (
    <div>
      <h1>ACCOUNT: {curUsername}</h1>
      {wasEnrolled && (
        <button onClick={onUnenroll2FA}>
          *Unenroll* from 2FA
        </button>
      )}
      {!wasEnrolled && (
        <button onClick={onEnroll2FA}>
          Enroll for 2FA
        </button>
      )}
      <button onClick={onSignOut}>
        Sign out
      </button>

      <br />

      <input ref={fooContentRef} type="text" placeholder="Foo content here..." />
      <button onClick={onAdd}>
        Add new Foo
      </button>

      <br />

      {foos.map((curFoo: Foo) => (
        <div>
          <p>{curFoo.content}</p>
          <button onClick={async () => {await onDelete(curFoo.id);}}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
