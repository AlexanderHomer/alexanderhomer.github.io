# Tufts Oto-HNS Guide

This repository contains the source for the Tufts Oto-HNS Guide website. Pages are written in Markdown and built with [Jekyll](https://jekyllrb.com/).

The site is hosted from an S3 bucket behind CloudFront, not GitHub Pages, so there is no server-side Jekyll processing at request time. `.github/workflows/main.yml` builds the site with Jekyll on every push to `main` and syncs the resulting `_site/` output to S3, then invalidates the CloudFront distribution.

To preview locally, install dependencies once and run the Jekyll dev server:

``` bash
bundle install
bundle exec jekyll serve
```

Every Markdown page needs front matter (at minimum `layout: default`) — without it, Jekyll copies the file as-is instead of rendering it to HTML.
