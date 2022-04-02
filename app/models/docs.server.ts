import arc from "@architect/functions";
import { getRepoTarballStream } from "./github.server";
import { createTarFileProcessor } from "./tar.server";
import { processMarkdown } from "@ryanflorence/md";
// @ts-expect-error
import sortBy from "sort-by";

interface Doc {
  id: string;
  name: string;
  markdown: string;
  ref: string;
  lang: string;
  html?: string;
  parentId?: string;
}

type MenuDoc = Pick<Doc, "name" | "id"> & { slug: string };

export async function getMenu(ref: string, lang: string): Promise<MenuDoc[]> {
  let db = await arc.tables();
  let result = await db.doc.scan({});
  return result.Items.map((item: any) => ({
    id: item.id,
    name: item.name,
    // just want the "slug" part of this: {ref}#docs/{slug}.md
    // should use `match`, I'm too tired.
    slug: item.id.match(/docs\/(.+)\.md/)[1],
  })).sort(sortBy("slug"));
}

export async function getDoc(ref: string, slug: string): Promise<MenuDoc[]> {
  let db = await arc.tables();
  let filename = `docs/${slug}.md`;
  let id = `${ref}#${filename}`;
  let result = await db.doc.get({ id });
  if (!result) throw new Response("", { status: 404 });
  return result;
}

export async function addGitHubRefToDB(ref: string): Promise<void> {
  let db = await arc.tables();
  let stream = await getRepoTarballStream(ref);
  let processFiles = createTarFileProcessor(stream);
  await processFiles(async ({ filename, content }) => {
    // # TODO make a function for this
    let id = `${ref}#${filename}`;
    console.log(`Processing markdown: ${filename}`);
    let html = await processMarkdown(content);
    let name = id; // TODO: use frontmatter
    let doc: Doc = {
      id,
      lang: "en",
      markdown: content,
      name,
      html: html,
      parentId: "",
      ref,
    };

    try {
      console.log(`Writing to dynamo: ${filename}`);
      let result = await db.doc.put(doc);
      console.log(`✅ processed ${result.id}`);
    } catch (e) {
      console.error(`🚫 failed ${filename}`);
      console.error(e);
      throw e;
    }
  });
}
