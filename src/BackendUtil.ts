import { type SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "./types/supabase"

export type Foo = Tables<"foos">;

// returns a string with the user ID if the registration was successful
//         or an Error if not
export async function registerUser(
  supabaseClientIn: SupabaseClient<Database>,
  usernameIn: string,
  passwordIn: string,
): Promise<string | Error> {
  const { data, error } = await supabaseClientIn.auth.signUp({
                            // dumb workaround
                            email: `${usernameIn}@example.com`,
                            password: passwordIn,
                            options: {
                              data: {
                                username: usernameIn,
                              },
                            }
                          });
  if (error) {
    return new Error(`Registration failed: ${JSON.stringify(error)}`);
  } else {
    return data.user!.id;
  }
}

// returns a string with the user ID if the registration was successful
//         or an Error if not
export async function signInUser(
  supabaseClientIn: SupabaseClient<Database>,
  usernameIn: string,
  passwordIn: string,
): Promise<string | Error> {
  const { data, error } = await supabaseClientIn.auth.signInWithPassword({
                            // dumb workaround
                            email: `${usernameIn}@example.com`,
                            password: passwordIn,
                          });
  if (error) {
    return new Error(`Sign-in failed: ${JSON.stringify(error)}`);
  } else {
    return data.user!.id;
  }
}

// export async function signOutUser(
//   supabaseClientIn: SupabaseClient<Database>,
// ): Promise<true | Error> {
  
// }

// returns the new Foo object if the create succeeded
//         or an Error if not
export async function createFoo(
  supabaseClientIn: SupabaseClient<Database>,
  userIdIn: string,
  contentIn: string,
): Promise<Foo | Error> {
  const { data, error } = await supabaseClientIn
    .from("foos")
    .insert([{ user_id: userIdIn, content: contentIn }])
    .select();

  if (error) {
    return new Error(`Create failed: ${JSON.stringify(error)}`);
  } else {
    return data[0];
  }
}

// returns `true` if the delete succeeded
//         or an Error if not
export async function deleteFoo(
  supabaseClientIn: SupabaseClient<Database>,
  fooIdIn: number,
): Promise<true | Error> {
  const { error } = await supabaseClientIn
    .from("foos")
    .delete()
    .eq("id", fooIdIn);

  if (error) {
    return new Error(`Delete failed: ${JSON.stringify(error)}`);
  } else {
    return true;
  }
}

// returns an array of `Foo`s if read succeeded
//         or an Error if not
export async function readFoos(
  supabaseClientIn: SupabaseClient<Database>,
  userIdIn: string,
): Promise<Foo[] | Error> {
  const { data, error } = await supabaseClientIn
    .from("foos")
    .select("*")
    .eq("user_id", userIdIn)
    .order("created_at", { ascending: false });

  if (error) {
    return new Error(`Read failed: ${JSON.stringify(error)}`);
  } else {
    return data;
  }
}
