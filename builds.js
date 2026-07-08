// Shared list of saved experiment builds — loaded by EVERY version file so the
// version dropdown shows ALL snapshots no matter which one you're viewing.
// To add a snapshot: copy index.html → index-vN.html, then add one line below.
// Every existing file picks it up automatically (they all read window.BUILDS).
// Newest first — the dropdown shows them top-to-bottom in this order.
// PUBLISHED list (GitHub): the live root index.html IS v5.6; v5.1 is the prior
// committed snapshot (index-v5.1.html); v5.2 / v5.3 / v5.4 / v5.5 / v6 / v7 are
// local-only and not published.
window.BUILDS = [
  { label: "v5.6", file: "index.html"      },
  { label: "v5.1", file: "index-v5.1.html" },
  { label: "v5", file: "index-v5.html" },
  { label: "v4", file: "index-v4.html" },
  { label: "v3", file: "index-v3.html" },
  { label: "v2", file: "index-v2.html" },
  { label: "v1", file: "index-v1.html" },
];
