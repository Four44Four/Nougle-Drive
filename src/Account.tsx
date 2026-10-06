import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "./types/supabase";
import { type Page } from "./App";
import * as BEUtil from "./BackendUtil";
import { type Foo } from "./BackendUtil";

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  curAccountId: string;
  curUsername: string;
};

export default function ({ supabaseClient, setCurPage, curAccountId, curUsername }: PageProps) {
  const [foos, setFoos] = useState<Foo[]>([]);
  const fooContentRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const readRes = await BEUtil.readFoos(supabaseClient, curAccountId);
      if (readRes instanceof Error) {
        alert(readRes.message);
      } else {
        setFoos(readRes);
      }
    })();
  }, []);

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

  return (
    <div>
      <h1>ACCOUNT: {curUsername}</h1>
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
