import { addGitHubRefToDB } from "~/models/docs.server";

export async function loader() {
  await addGitHubRefToDB("main");
  return { ok: true };
}
