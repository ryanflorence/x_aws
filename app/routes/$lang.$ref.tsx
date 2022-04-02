import { LoaderFunction, Outlet, useLoaderData, json, Link } from "remix";
import * as Docs from "~/models/docs.server";
import styles from "../styles/docs.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export let loader: LoaderFunction = async () => {
  let menu = await Docs.getMenu("local", "en");
  return json(menu);
};

export default function Doc() {
  let data = useLoaderData<Awaited<ReturnType<typeof Docs.getMenu>>>();

  return (
    <div className="flex">
      <div className="w-80 flex-shrink-0 px-8">
        <div className="sticky top-0 py-8">
          <h1>Docs!</h1>
          <ul>
            {data.map((doc, index) => (
              <li key={index}>
                <Link className="block py-2 text-blue-500" to={doc.slug}>
                  {doc.slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
}
