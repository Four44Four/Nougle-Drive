import { Dispatch, SetStateAction } from "react";
import { type SupabaseClient } from "@supabase/supabase-js";

import { type Database } from "./types/supabase";
import { type Page } from "./App";

type PageProps = {
  supabaseClient: SupabaseClient<Database>;
  setCurPage: Dispatch<SetStateAction<Page>>;
  curAccountId: string | null;
  curUsername: string | null;
};

export default function ({ supabaseClient, setCurPage, curAccountId, curUsername }: PageProps) {
  return (
    <div>
      <h1>ACCOUNT: {curUsername}</h1>
      {
        // TODO: show current account's data in realtime
        //       add buttons to send a Foo
      }
    </div>
  );
}
