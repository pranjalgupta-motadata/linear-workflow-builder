// Shared list of saved experiment builds — loaded by EVERY version file so the
// version dropdown shows ALL snapshots no matter which one you're viewing.
// To add a snapshot: copy index.html → index-vN.html, then add one line below.
// Every existing file picks it up automatically (they all read window.BUILDS).
// Newest first — the dropdown shows them top-to-bottom in this order.
// NOTE: index.html === v5.16 and is the LIVE root on GitHub Pages (promoted 2026-08-19, replacing v5.11 from 2026-07-27).
// v5.16 adds the level Merge (v2), the Loop node, the merge connector wire, the orange Split Path node, and dev-only Use Case 9.
// v5.16 = the ACTIVE working file; v5.15 = rollback; v5.14 = loop-complete rollback; v5.11 = the prior live root.
window.BUILDS = [
  { label: "v7", file: "index-v7.html" },
  { label: "v5.16 (working)", file: "index-v5.16.html" },
  { label: "v5.15", file: "index-v5.15.html" },
  { label: "v5.14", file: "index-v5.14.html" },
  { label: "v5.13", file: "index-v5.13.html" },
  { label: "v5.12", file: "index-v5.12.html" },
  { label: "v5.11 (live)", file: "index-v5.11.html" },
  { label: "v5.10", file: "index-v5.10.html" },
  { label: "v5.9", file: "index-v5.9.html" },
  { label: "v5.8", file: "index-v5.8.html" },
  { label: "v5.7", file: "index-v5.7.html" },
  { label: "v5.6", file: "index-v5.6.html" },
  { label: "v5.5", file: "index-v5.5.html" },
  { label: "v5.4", file: "index-v5.4.html" },
  { label: "v5.3", file: "index-v5.3.html" },
  { label: "v5.2", file: "index-v5.2.html" },
  { label: "v5.1", file: "index-v5.1.html" },
  { label: "v5", file: "index-v5.html" },
  { label: "v4", file: "index-v4.html" },
  { label: "v3", file: "index-v3.html" },
  { label: "v2", file: "index-v2.html" },
  { label: "v1", file: "index-v1.html" },
];
