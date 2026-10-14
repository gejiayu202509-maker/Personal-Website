# Ge Jiayu's Personal Website

Original website: https://gejiayu.top/

Source repository: https://github.com/gejiayu202509-maker/Personal-Website

Maintained for Ge Jiayu, with AI-assisted development and image creation.

## Reusing the design

You are welcome to adapt the layout, styles, interactions, and implementation
code for your own website. Source acknowledgement is appreciated, for example:

> Based on Ge Jiayu's personal website: https://gejiayu.top/

An acknowledgement is not a condition of the code reuse permission. See
[LICENSE](LICENSE) for the scope of that permission.

This permission does **not** include the site's personal content or images.
In particular, `assets/hero-bg.webp` is a custom AI-assisted illustration based
on Ge Jiayu's appearance. It is not a generic template background and is not
licensed for reuse, even with attribution. Replace it with your own imagery.
See [ASSET-RIGHTS.md](ASSET-RIGHTS.md).

If adapting this site, also replace the biography, personal photos, project
details, demo credentials, canonical URLs, domain configuration, and social
previews. Do not present Ge Jiayu's identity or experiences as your own.

## Source records

The homepage image has a subtle pixel-level source signature and ordinary XMP
metadata describing its source and reuse policy. The HTML and main CSS/JS files
also identify the original website. These markers can be removed; they are not
DRM, tracking, or a guarantee against copying.

[provenance.json](provenance.json) records SHA-256 fingerprints of selected
files, the recording time, and the repository revision at recording. It also
identifies the previously public, unmarked homepage asset from its Git history.
The record is **unsigned** and does not prove authorship or establish a legal
creation date. GitHub's published history provides additional context, not a
standalone originality verdict. Older public copies cannot be recalled by
changing the current asset.

Check the recorded files:

```bash
node scripts/provenance.mjs --check
```

Compare a downloaded file with the recorded exact-byte fingerprints:

```bash
node scripts/provenance.mjs --compare /absolute/path/to/image.webp
```

No match does not mean an image is independently created: screenshots,
re-encoding, resizing, and other edits can change the fingerprint. This tool
does not scan other websites or report who downloaded an image.

After editing a recorded file, refresh and check the record before committing:

```bash
node scripts/provenance.mjs --write
node scripts/provenance.mjs --check
```

Run the focused tests:

```bash
node --test scripts/provenance.test.mjs
```

The site is static HTML/CSS/JavaScript and uses GitHub Pages. The source-record
tool requires Node.js but no additional packages. It is not loaded by visitors'
browsers and does not change navigation or copying behavior.
