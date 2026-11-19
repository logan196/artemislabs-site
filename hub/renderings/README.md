# Renderings

Put Claude-made renderings here (WebP, PNG, JPG or MP4, under 5 MB each), then add an entry to `../data/renderings.json`:

```json
{"lab": "gudjonsson", "title": "Drug-eruption tissue", "file": "renderings/gudjonsson-tissue.webp", "kind": "image", "caption": "Short caption"}
```

`lab` is a lab id from `data/labs.json`, or `artemis` for studio-wide pieces. The hub shows a "Renderings" section as soon as `items` is non-empty.
