# Portal loader

`portal-loader.js` puts a white loading screen over a portal: particles crystallise into the Artemis
dodecahedron with the partner institution's logo inside it, above an "Artemis Biolabs × Institution" lockup.
It shows for at least 2 s, fades when the page has loaded, never stays longer than 3 s, and tapping it skips it.
Without WebGL it shows the static mark. It never runs inside an iframe or with `?embed=1` / `?noloader=1`;
`?loaderhold=1` keeps it up for screenshots.

Usage, first thing in `<body>` (logo paths are relative to this folder):

    <script src="/live/loader/portal-loader.js?v=1" data-inst="Caltech"
            data-logo="logos/caltech-wordmark.png" data-mark="logos/caltech-wordmark.png" data-scale=".6"></script>

`data-logo` is the crisp logo in the lockup, `data-mark` the image sampled into particles, `data-scale` its size
inside the crystal, and `data-replace` a selector for a portal's own intro overlay to hide.

Particles are adapted from the hub landing (`hub/site/assets/landing.js`). Three.js r170 is vendored (MIT, `three.LICENSE.txt`).

Logos (used with the institutions' permission):
- `logos/scu-lockup.svg`, `logos/scu-seal.svg`: Sichuan University, from en.wikipedia `File:Sichuan_University_Logo.svg` and `File:Sichuan_University_logo_(seal).svg`.
- `logos/caltech-wordmark.png`: Caltech wordmark, existing site asset `/logos/caltech-wordmark.v1.png`.
