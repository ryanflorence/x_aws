import { LoaderFunction, useLoaderData } from "remix";
import invariant from "tiny-invariant";
import { getDoc } from "~/models/docs.server";

export let loader: LoaderFunction = async ({ params }) => {
  invariant(params.ref, "expected `ref` params");
  invariant(params["*"], "expected splat param");
  return getDoc(params.ref, params["*"]);
};

export default function Doc() {
  let doc = useLoaderData();
  return (
    <div>
      <h1>{doc.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </div>
  );
}
