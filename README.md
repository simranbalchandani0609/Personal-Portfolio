# Simran Balchandani: personal portfolio 

A hand-coded portfolio for a college assignment (Personal Portfolio Website, due 17 October 2026).
It is plain **HTML, CSS and JavaScript**: no framework, no build step, no template, no tracking, no backend.

Live site: https://simranbalchandani0609.github.io/personal-portfolio/
Source: https://github.com/simranbalchandani0609/personal-portfolio

## Overview

A dark, streaming-style home screen for a data science student: a full-screen hero, then rows of tiles you scroll sideways. The layout is inspired by streaming services; it is not affiliated with any of them and uses none of their code, logos or assets.

## Features

- **Hero:** name, introduction and two buttons (Explore My Work, About Me) over my own project visuals, with a faint animated "data points" background.
- **Project rows:** MediCloud v2, Flight Management Dashboard and my GIS paper as tiles. Hover (or tap) for details; select a tile to open the full write-up in a dialog. A second row holds the MediCloud screenshots (click to enlarge).
- **Skills:** skills by area, plus a **skill map**: tap a project to light up the tools it used, or tap a tool to see where it was used.
- **Education, experience, courses:** schools, internship, volunteering, committees, and four Coursera certificates (PDF and verification link for each).
- **Doodle pad:** a floating pencil button (bottom-right, always visible) opens a compact panel with freehand drawing (mouse, finger or stylus), colour picker and quick colours, brush size, eraser, undo (stroke history, also Ctrl/Cmd+Z), clear canvas with confirmation, download as PNG, and a close button (or Esc). Drawings stay in the browser tab and are never uploaded or stored.
- **Jump palette:** press `K` or `/` (or use the search icon) to jump to a section or action.
- **Opening video (6.5 seconds):** on the first visit in a browser tab, my SB intro video (`assets/video/sb-intro.mp4`, with a `.webm` copy) plays full screen over black, then fades into the site. Browsers only allow sound after a click or tap, so unless audio is already allowed the page first asks once: **Play intro with sound** or **Continue without sound** (if nobody clicks, it plays silently after 8 seconds). There is a Sound toggle and a Skip button (Esc also skips). It plays once per tab session, so a refresh does not replay it; a footer **Replay the intro** button and `?intro=1` on the address bring it back. Visitors who prefer reduced motion skip it, and if the video can't load the site simply opens.
- **SB logo:** a black tile with a red accent bar; the letters and bar animate in on load and the tile fills red on hover or focus.
- **About:** a short pull-quote, three paragraphs, a quick-facts list and a "When I'm not studying" list, revealed gently on scroll.
- **Animation:** staggered hero entrance, a slow red light streak and a cursor-following glow in the hero (mouse only), buttons that lean toward the cursor, a gentle hero background parallax, section titles that wipe in, scroll reveals, tiles that fade in, button and nav-link hovers, a doodle panel that grows from its button. One set of durations and easing is used throughout, and the motion is reduced for visitors who prefer reduced motion.
- **Accessibility and mobile:** skip link, keyboard-friendly dialogs and controls, visible focus, 44 px touch targets, readable contrast, no sideways page scroll (only the carousels scroll sideways, by swipe on phones).

## Technologies

HTML5, CSS3 (custom properties, Grid, Flexbox, scroll snap, `@starting-style`), vanilla JavaScript (Intersection Observer, Canvas API, native `<dialog>`). Fonts are self-hosted. No dependencies to install.

## Files

```
index.html     all the content
styles.css     all the styling (colours and sizes are variables at the top)
script.js      carousels, dialogs, doodle pad, palette, animation
favicon.svg    browser-tab icon
.nojekyll      tells GitHub Pages to serve the files as they are
assets/
  fonts/       self-hosted fonts (see Credits)
  img/         MediCloud screenshots (WebP) and an original abstract illustration (gis-rings.svg)
  certs/       certificate PDFs and preview images
  video/       20-second Flight Dashboard demo clip and poster
```

## Run it on your computer

No install is needed. Either double-click `index.html`, or start a small local server from this folder:

```
python -m http.server 8081
```

then open http://localhost:8081. (If port 8081 is blocked, use another number such as 9000. On macOS or Linux use `python3`.)

## Deploy for free on GitHub Pages

1. Sign in at github.com as `simranbalchandani0609`. Click **New repository**, name it `portfolio`, choose **Public**, click **Create repository**.
2. Click **uploading an existing file**, drag in **everything inside this folder, including the whole `assets` folder** (dragging only the loose files leaves out the images, fonts and video) (so `index.html` is at the top level, with the `assets` folder), then **Commit changes**.
3. Go to **Settings, then Pages**. Under **Build and deployment** choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute or two the site is live at `https://simranbalchandani0609.github.io/personal-portfolio/`.

Netlify also works: drag this folder onto https://app.netlify.com/drop. All paths are relative, so no configuration is needed.

## Credits and notes

- **Fonts** (SIL Open Font License 1.1, self-hosted, via the Fontsource npm packages): [Fraunces](https://github.com/undercasetype/Fraunces), [Instrument Sans](https://github.com/Instrument/instrument-sans) and [IBM Plex Mono](https://github.com/IBM/plex).
- **Screenshots and video** are my own project work. MediCloud screenshots use sample data with the sample phone number blurred. The Flight Dashboard clip was trimmed and cropped to show only the dashboard. The lake illustration (`gis-rings.svg`) is an original abstract drawing, not a satellite image.
- **Certificates** are my own Coursera course-completion certificates (AWS, Microsoft, AI CERTs). They are course certificates, not formal exam certifications or academic credit.
- **Design guidance:** motion and polish rules (easing, press feedback, reduced motion, hover gating, worst-case content testing) follow the open-source [emilkowalski/skills](https://github.com/emilkowalski/skills) guidance (MIT). No code was copied from it.
- No template was used. The site has no analytics, cookies or tracking, and sends nothing to any server.
- **Intro video:** the SB intro video and its sound were supplied by the author. I compressed the original 4K file to 1080p (MP4 and WebM) for the web. It is not a recording of anyone else's work, and the site uses no other audio.
