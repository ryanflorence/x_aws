import { LoaderFunction, redirect } from "remix";
import { json } from "remix";
import invariant from "tiny-invariant";
import { getDocRef } from "~/models/docs.server";

export let loader: LoaderFunction = async ({ params }) => {
  invariant(params.lang, "expected `params.lang`");
  invariant(params.ref, "expected `params.ref`");
  let docRef = await getDocRef(params.ref);
  if (docRef.status === "complete") {
    return redirect(`/${params.lang}/${params.ref}`);
  }
  return json(docRef);
};
