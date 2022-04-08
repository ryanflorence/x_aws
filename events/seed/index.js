import arc from "@architect/functions";

export let handler = arc.events.subscribe(seed);

async function seed(event) {
  console.log(event);
  return;
}
