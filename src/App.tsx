import { useState } from "react";
import { createClient } from '@supabase/supabase-js';

import type { Database } from "./types/supabase"
import Login from "./Login";
import Account from "./Account";

const supabaseClient = createClient<Database>(import.meta.env.VITE_SUPABASE_URL,
                                              import.meta.env.VITE_SUPABASE_KEY
//   , {
//     auth: {
//       persistSession: false,
//     }
// }
);

export type Page = "login" | "account";

export default function () {
  const [curPage, setCurPage] = useState<Page>("login");
  const [curAccountId, setCurAccountId] = useState<string | null>(null);
  const [curUsername, setCurUsername] = useState<string | null>(null);

  switch (curPage) {
    case "login": return <Login supabaseClient={supabaseClient} setCurPage={setCurPage} setCurAccountId={setCurAccountId!} setCurUsername={setCurUsername!} />;
    case "account": return <Account supabaseClient={supabaseClient} setCurPage={setCurPage} curAccountId={curAccountId!} curUsername={curUsername!} />;
    default: return <div><h1>INVALID PAGE</h1></div>;
  }

  // const [i , setI] = useState<number>(0);

  // return (
  //   <div onClick={() => setI(oldI => oldI + 1)}>
  //     Thing: {i}
  //   </div>
  // );
}
