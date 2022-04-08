import arc from "@architect/functions";
import { getRepoTarballStream } from "./github.server";
import { createTarFileProcessor } from "./tar.server";
import { processMarkdown } from "@ryanflorence/md";
// @ts-expect-error
import sortBy from "sort-by";

export interface Doc {
  pk: string;
  name: string;
  markdown: string;
  ref: string;
  lang: string;
  html?: string;
  parentPk?: string;
}

export interface DocRef {
  pk: string;
  status: "seeding" | "failed" | "complete";
  lastDoc?: string;
}

type MenuDoc = Pick<Doc, "pk" | "name"> & { slug: string };

export async function getMenu(ref: string, lang: string): Promise<MenuDoc[]> {
  let db = await arc.tables();
  let result = await db.doc.scan({});
  return result.Items.map((item: any) => ({
    pk: item.pk,
    name: item.name,
    // just want the "slug" part of this: {ref}#docs/{slug}.md
    // should use `match`, I'm too tired.
    slug: item.pk.match(/docs\/(.+)\.md/)[1],
  })).sort(sortBy("slug"));
}

export async function getDoc(ref: string, slug: string): Promise<MenuDoc[]> {
  let db = await arc.tables();
  let pk = generateDocPrimaryKey(ref, `docs/${slug}.md`);
  let result = await db.doc.get({ pk });
  if (!result) throw new Response("", { status: 404 });
  return result;
}

let generateDocPrimaryKey = (ref: string, filename: string) =>
  `${ref}#${filename}`;

export async function getDocRef(ref: string): Promise<DocRef> {
  let db = await arc.tables();
  return db.docRef.get({ pk: ref });
}

export async function addGitHubRefToDB(ref: string): Promise<void> {
  let db = await arc.tables();

  let docRef = await db.docRef.get({ pk: ref });

  // already seeding
  if (docRef && docRef.status === "seeding") {
    return;
  }

  db.docRef.put({ pk: ref, status: "seeding" });
  let stream = await getRepoTarballStream(ref);
  let processFiles = createTarFileProcessor(stream);
  await processFiles(async ({ filename, content }) => {
    // # TODO make a function for this
    let pk = generateDocPrimaryKey(ref, filename);
    console.log(`Processing markdown: ${pk}`);
    let html = await processMarkdown(content);
    let name = pk; // TODO: use frontmatter
    let doc: Doc = {
      pk,
      lang: "en",
      markdown: content,
      name,
      html: html,
      parentPk: "",
      ref,
    };

    try {
      console.log(`Writing to dynamo: ${filename}`);
      let result = await db.doc.put(doc);
      console.log(`✅ processed ${result.pk}`);
      db.docRef.put({ pk: ref, status: "seeding", lastDoc: filename });
    } catch (e) {
      console.error(`🚫 failed ${filename}`);
      console.error(e);
      db.docRef.put({ pk: ref, status: "failed" });
      throw e;
    }
  });
  db.docRef.put({ pk: ref, status: "complete" });
}
