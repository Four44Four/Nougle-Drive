import type { SupabaseClient, Session, Factor, AuthMFAEnrollTOTPResponse } from "@supabase/supabase-js";

import type { Database, Tables } from "./types/supabase";

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

// returns `true` if the sign-out succeeded
//         or an Error if not
export async function signOutUser(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<true | Error> {
  const { error } = await supabaseClientIn.auth.signOut();
  if (error) {
    return new Error(`Sign-out failed: ${JSON.stringify(error)}`);
  } else {
    return true;
  }
}

// returns a valid Session if the client is signed in succeeded
//         or `null` if the client is not signed in
//         or an Error if an error occurred
export async function getSessionUser(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<Session | null | Error> {
  const { data, error } = await supabaseClientIn.auth.getSession();
  if (error) {
    return error;
  } else {
    return data.session;
  }
}

// returns an array of Factors if the client has 2fa factors
//         or empty array/`null` if the client has no 2fa factors
//         or an Error if an error occurred
export async function getUserTOTPMFAFactors(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<Factor[] | null | Error> {
  const { data, error } = await supabaseClientIn.auth.mfa.listFactors();
  if (error) {
    return error;
  } else {
    return data?.totp ?? null;
  }
}

export async function getUserMFAFactorID(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<string | null | Error> {
  const totpFactorsRes = await getUserTOTPMFAFactors(supabaseClientIn);
  if (totpFactorsRes instanceof Error) {
    return totpFactorsRes;
  } else {
    return totpFactorsRes?.[0]?.id ?? null;
  }
}

// returns a AuthMFAEnrollTOTPResponse if the enrollment succeeded
//         or an Error if not
export async function enrollUserTOTPMFA(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<AuthMFAEnrollTOTPResponse["data"] | Error> {
  const { data, error } = await supabaseClientIn.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Supabase test",
  });

  if (error) {
    return error;
  } else {
    return data;
  }
}

// returns `true` if the user was unenrolled from the TOTP MFA
//         or an Error if not
export async function unenrollUserTOTPMFA(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<true | Error> {
  const factorsRes = await getUserTOTPMFAFactors(supabaseClientIn);
  if (factorsRes instanceof Error) {
    return factorsRes
  }

  if (factorsRes === null || factorsRes.length === 0) {
    return new Error("You have no MFA factors");
  }

  const { error } = await supabaseClientIn.auth.mfa.unenroll({
    factorId: factorsRes[0].id,
  });

  if (error) {
    return error;
  } else {
    return true;
  }
}

// returns `true` if the MFA challenge was completed
//         or an Error if not
export async function checkMFAChallenge(
  supabaseClientIn: SupabaseClient<Database>,
  factorIdIn: string,
  codeIn: string,
): Promise<true | Error> {
  const { data: challengeData, error: challengeError } = await supabaseClientIn.auth.mfa.challenge({ factorId: factorIdIn });
  if (challengeError) {
    return challengeError;
  }

  const { error: verifyError } = await supabaseClientIn.auth.mfa.verify({
    factorId: factorIdIn,
    challengeId: challengeData.id,
    code: codeIn,
  });

  if (verifyError) {
    return verifyError;
  } else {
    return true;
  }
}

export async function isClientMFAVerified(
  supabaseClientIn: SupabaseClient<Database>,
): Promise<true | Error> {
  const { data, error } = await supabaseClientIn.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) {
    return error;
  }
  else if (data.currentLevel === "aal2") {
    return true;
  }
  else {
    return new Error("You are not 2FA verified");
  }
}

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
