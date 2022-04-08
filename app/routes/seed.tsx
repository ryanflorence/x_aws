import { addGitHubRefToDB } from "~/models/docs.server";

export async function loader() {
  await addGitHubRefToDB("v6.3.0");
  return { ok: true };
}
