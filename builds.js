// Shared list of saved experiment builds — loaded by EVERY version file so the
// version dropdown shows ALL snapshots no matter which one you're viewing.
// To add a snapshot: copy index.html → index-vN.html, then add one line below.
// Every existing file picks it up automatically (they all read window.BUILDS).
window.BUILDS = [
  { label: "v1",      file: "index-v1.html" },
  { label: "v2",      file: "index-v2.html" },
  { label: "Working", file: "index.html" },
];
