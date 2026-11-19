#!/usr/bin/env python3
"""Regenerate the static Vitessce viewer pages under public/live/.

Reads each dataset's data.zarr to discover what it actually contains
(cell-state categories, BANKSY domains, UMAP embedding) and emits an
index.html whose Vitessce config:

  - pre-selects every putative cell state, so the section is COLORED on load
    (the old configs booted with obsSetSelection: null -> grey, unreadable);
  - shows linked Spatial + UMAP scatterplots when obsm/X_umap exists;
  - sets a manual spot radius (auto radius renders Visium spots near-invisible);
  - expands both set hierarchies in the Cell Sets panel.

Also writes public/live/manifest.json, which portal.html fetches at runtime —
the shell no longer hardcodes the dataset list.

Run from the repo root with any python that has `zarr` installed, e.g.:
  ~/spatial-transcriptomic-single-agent/.venv-pipeline/bin/python scripts/build-live-viewers.py
"""
import json
import pathlib
import sys

import zarr

ROOT = pathlib.Path(__file__).resolve().parent.parent
LIVE = ROOT / "public" / "live"

# Display metadata the zarrs can't tell us. Single source of truth for the
# whole portal: the shell reads it from manifest.json, never from its own copy.
DATASETS = [
    {"id": "GBM1", "name": "GBM1", "dx": "Astrocytoma · IDH-mut"},
    {"id": "GBM2", "name": "GBM2", "dx": "GBM · IDH-wt · recurrent"},
    {"id": "GBM3", "name": "GBM3", "dx": "GBM · IDH-wt · primary"},
    {"id": "GBM4", "name": "GBM4", "dx": "Astrocytoma · IDH-mut"},
    {"id": "TenX_GBM", "name": "10x Parent", "dx": "GBM · 10x Genomics Visium"},
]
DEFAULT_ID = "GBM3"

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{name} · Artemis BioLabs live demo</title>
  <style>
    html, body, #root {{ margin: 0; padding: 0; width: 100%; height: 100%; background: #0a0c0e; }}
    #loading {{ font-family: -apple-system, system-ui, sans-serif; padding: 24px; color: #8b98a0; }}
  </style>
</head>
<body>
  <div id="root"><div id="loading">Loading spatial portal&hellip; (serve this folder over HTTP)</div></div>
  <script type="module">
    let importWithMap;
    try {{
      importWithMap = (await import('https://unpkg.com/dynamic-importmap@0.1.0')).importWithMap;
    }} catch (e) {{
      importWithMap = (await import('https://cdn.vitessce.io/dynamic-importmap@0.1.0/dist/index.js')).importWithMap;
    }}

    const importMap = {{
      imports: {{
        "react": "https://esm.sh/react@18.2.0",
        "react-dom": "https://esm.sh/react-dom@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "vitessce": "https://cdn.vitessce.io/vitessce@3.9.11/dist/index.min.js"
      }}
    }};

    const React = await importWithMap("react", importMap);
    const {{ createRoot }} = await importWithMap("react-dom/client", importMap);
    const {{ Vitessce }} = await importWithMap("vitessce", importMap);

    const config = {config};

    // Vitessce's zarr loader calls `new URL(url)`, which rejects relative
    // strings. Resolve each data file URL against this page's location so the
    // portal works from whatever host/port serves the folder.
    for (const ds of (config.datasets || [])) {{
      for (const f of (ds.files || [])) {{
        if (f.url && !/^https?:\\/\\//.test(f.url)) {{
          f.url = new URL(f.url, window.location.href).href;
        }}
      }}
    }}

    const e = React.createElement;
    createRoot(document.getElementById('root')).render(
      e(Vitessce, {{ config, theme: 'dark', height: window.innerHeight }})
    );
  </script>
</body>
</html>
"""


def read_categories(group, col):
    try:
        cats = group[f"obs/{col}/categories"][:]
    except KeyError:
        return []
    return [c.decode() if isinstance(c, bytes) else str(c) for c in cats]


def build_config(meta, cell_states, has_umap):
    name = meta["name"]
    files_options = {
        "obsLocations": {"path": "obsm/spatial"},
        "obsEmbedding": [
            {"path": "obsm/spatial", "dims": [0, 1], "embeddingType": "Spatial"},
        ],
        "obsSets": [
            {"name": "Putative cell state", "path": "obs/putative_cell_type"},
            {"name": "BANKSY domain", "path": "obs/banksy_cluster"},
        ],
        "obsFeatureMatrix": {"path": "X", "initialFeatureFilterPath": "var/top_marker"},
    }
    if has_umap:
        files_options["obsEmbedding"].append(
            {"path": "obsm/X_umap", "dims": [0, 1], "embeddingType": "UMAP"}
        )

    # Every putative cell state selected up front -> colored from first paint.
    selection = [["Putative cell state", c] for c in cell_states]

    coordination = {
        "dataset": {"A": "A"},
        "embeddingType": {"SPATIAL": "Spatial", "UMAP": "UMAP"},
        "obsSetSelection": {"A": selection},
        "obsSetExpansion": {"A": [["Putative cell state"], ["BANKSY domain"]]},
        "obsColorEncoding": {"A": "cellSetSelection"},
        # Auto radius renders Visium spots near-invisible on a 4k-spot section.
        "embeddingObsRadiusMode": {"SPATIAL": "manual", "UMAP": "manual"},
        "embeddingObsRadius": {"SPATIAL": 2.4, "UMAP": 1.9},
        "embeddingObsOpacityMode": {"SPATIAL": "manual", "UMAP": "manual"},
        "embeddingObsOpacity": {"SPATIAL": 1.0, "UMAP": 0.85},
    }

    shared = {"dataset": "A", "obsSetSelection": "A", "obsColorEncoding": "A"}
    scatter_common = dict(shared, obsSetExpansion="A")

    layout = [
        {
            "component": "scatterplot",
            "props": {"title": "Spatial · " + name},
            "coordinationScopes": dict(
                scatter_common,
                embeddingType="SPATIAL",
                embeddingObsRadiusMode="SPATIAL",
                embeddingObsRadius="SPATIAL",
                embeddingObsOpacityMode="SPATIAL",
                embeddingObsOpacity="SPATIAL",
            ),
            "x": 0, "y": 0, "w": 5 if has_umap else 9, "h": 7,
        },
        {
            "component": "obsSets",
            "coordinationScopes": dict(shared, obsSetExpansion="A"),
            "x": 9, "y": 0, "w": 3, "h": 7,
        },
        {
            "component": "featureList",
            "coordinationScopes": shared,
            "x": 0, "y": 7, "w": 3, "h": 5,
        },
        {
            "component": "heatmap",
            "coordinationScopes": shared,
            "x": 3, "y": 7, "w": 9, "h": 5,
        },
    ]
    if has_umap:
        layout.insert(1, {
            "component": "scatterplot",
            "props": {"title": "UMAP (BANKSY space)"},
            "coordinationScopes": dict(
                scatter_common,
                embeddingType="UMAP",
                embeddingObsRadiusMode="UMAP",
                embeddingObsRadius="UMAP",
                embeddingObsOpacityMode="UMAP",
                embeddingObsOpacity="UMAP",
            ),
            "x": 5, "y": 0, "w": 4, "h": 7,
        })

    return {
        "version": "1.0.16",
        "name": f"{name} · Artemis BioLabs live demo",
        "description": "BANKSY domains + putative cell states on a public GBM Visium section",
        "datasets": [{
            "uid": "A",
            "name": name,
            "files": [{
                "fileType": "anndata.zarr",
                "url": "./data.zarr",
                "options": files_options,
                "coordinationValues": {"obsType": "cell"},
            }],
        }],
        "coordinationSpace": coordination,
        "layout": layout,
        "initStrategy": "auto",
        "vitessceMetadata": {
            "lab_name": "Artemis BioLabs",
            "portal_title": f"{name} live demo",
            "has_spatial_coordinates": True,
            "spatial_coordinate_origin": "measured",
            "has_measured_spatial_coordinates": True,
        },
    }


def main():
    manifest = {"default": DEFAULT_ID, "datasets": []}
    for meta in DATASETS:
        d = LIVE / meta["id"]
        zpath = d / "data.zarr"
        if not zpath.is_dir():
            print(f"{meta['id']}: no data.zarr — skipped", file=sys.stderr)
            continue
        g = zarr.open_group(str(zpath), mode="r")
        cell_states = read_categories(g, "putative_cell_type")
        domains = read_categories(g, "banksy_cluster")
        has_umap = "X_umap" in g.get("obsm", {})

        config = build_config(meta, cell_states, has_umap)
        (d / "index.html").write_text(PAGE.format(
            name=meta["name"],
            config=json.dumps(config),
        ))

        stats = {}
        sp = d / "stats.json"
        if sp.exists():
            stats = json.loads(sp.read_text())
        manifest["datasets"].append({
            **meta,
            "src": f"../{meta['id']}/",
            "umap": has_umap,
            "context": (d / "context.txt").exists(),
            "stats": stats,
            "cell_states": cell_states,
            "n_domains": len(domains),
        })
        print(f"{meta['id']}: viewer written · {len(cell_states)} states · "
              f"{len(domains)} domains · umap={has_umap}")

    (LIVE / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"manifest.json: {len(manifest['datasets'])} datasets")


if __name__ == "__main__":
    main()
