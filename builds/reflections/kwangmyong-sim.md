# Kwangmyong — the network, not the machine

## The simulator, in full

A working model of the Democratic People's Republic of Korea's national intranet, shipped as one HTML file that runs with the network cable pulled out. It opens straight onto the portal at `www.sciteco.aca.kp`: no boot sequence, no login, no desktop — a browser, filling the window, with a strip across the top that switches between the eight services the network actually offers.

Those eight are the whole product: the browser, a national search engine, intranet mail, the online shop with a working basket and Central Bank e-payment, Manbang streaming, the site catalogue, the device log, and the About panel that separates documented fact from invention.

Behind the browser are 136 catalogue entries. Thirty have real addresses and hand-built pages — news wires, an encyclopaedia, a university, bookshops, a cooking site, a weather service, an online shop, a graded tele-education exam. The other 106 are generated from their own catalogue rows, so the directory is never a dead end.

What makes it a simulation rather than a mock-up is the log. Every page opened is recorded with a timestamp, including attempts to reach an outside address, and the log is built so it refuses to be erased. That is the point: on this network the interesting fact is not what you can reach, but that reaching it is written down.

## Why the cut

The machine and the network were one product, and that was the mistake. A desktop simulator and an intranet simulator share a browser and nothing else: one is about files, windows, accounts and settings, the other is about what a closed network will and will not resolve.

So the boundary is now explicit. This build owns the network. The desktop half belongs to the Red Star OS 3.0 simulator on the same site, which is a separate artefact with its own shell, apps and 49-address sample of the address book. Nothing is shared at runtime between them — no common file, no common script, no iframe.

What that removed from this build: the boot splash, the login gate and its three accounts, the Windows-style desktop, the dock, the start menus, wallpapers and desktop icons, the settings panel, the document store, and the command terminal. Three applications were deleted from the registry outright, and the suite now asserts they are absent, because a feature you have "removed" by hiding a button is not removed.

The read-only visitor account went with the login gate. Its refusal behaviour — no payment, no mail — is still enforced, but the account is now a fixture rather than a choice: you are already on the network when the page loads, and the visitor role is what the log and the shop pages talk about.

## How the cut was made

The Korean original stays untouched. The English build is assembled by `build-en.sh` from the same parts, and the rescope is one extra module appended last: `parts/net_shell.js`. It

- hides the shell surfaces at CSS level and stacks the window layer under a 42-pixel strip, so every app window fills the frame instead of floating on a desktop;
- disables `K.boot` and starts the session directly with a user already on the network;
- deletes `set`, `files` and `term` from the app registry;
- replaces the desktop single-window model: opening a service closes the previous one, so there is exactly one page on screen;
- installs its own self-test, because the original suite was mostly assertions about the desktop.

Keeping the cut in one appended module means the Korean build still compiles from the same source, and the decision is reversible by removing one line from the build script.

## What broke

**The test suite was the product.** Of the original 72 checks, most walked the desktop: login, dock, terminal commands, document storage, settings. Removing the machine removed the tests with it. The new suite is 41 checks, and the ones that matter most are assertions of absence — no boot screen, no login screen, no icons, no dock, no start menu, and three apps that must not exist in the registry. An absence is cheap to test and easy to regress.

**The help panel still taught the desktop.** Two bullets in "How to use" told the reader to double-click desktop icons and to type `find` and `netstat` in the terminal, and a third bullet described signing in. The self-test passed the whole time. It was a text sweep of every Help tab, run after the fact, that found them: tests check behaviour, not whether the prose still describes the product.

**The strip overflowed by 330 pixels at 390 wide.** Eight labelled buttons plus a wordmark do not fit a phone. Labels collapse to icons under 960 pixels and the wordmark under 560, and the media queries are now part of the build rather than a later fix.

**The language toggle had to go.** The English build translates at render time, so switching the UI back to Korean made the layer translate its own labels — `한` came back as the word "one". A switch that fights the translation layer is not a feature. This build is English; the Korean original is the button beside it.

**One mail page promised a feature that no longer existed** — "uploaded files also appear in the document store." The store was gone; the sentence was not. Fixed in the same sweep.

**The self-test left visitors in the shop cart.** The suite drives the browser hard to prove the shop arithmetic, and it used to end wherever it finished. It now restores the portal before it prints its result.

## What I'd change

- Draw the boundary before the first line of chrome. Deciding late that a product is two products cost a rewrite of the test suite and every screen that mentioned a desktop.
- Write absence assertions as soon as something is removed. They are one line each and they are the only thing that stops a removed feature leaking back.
- Sweep the prose, not just the DOM. Behaviour tests cannot see a help page describing a terminal that no longer exists.
- Do not ship two builds of the same idea without naming the boundary on the card. A visitor should be able to tell, before clicking, which one is the machine and which one is the network.
- Check the strip at 390 pixels on the first day. It is the one piece of chrome every page inherits.

## What I learned

A simulation is defined by what it refuses to include. The interesting part of Kwangmyong was never the desktop — it was the resolver, the catalogue, the blocked page and the log. Cutting the machine made that visible, and it made the artefact smaller in scope and larger in argument at the same time.

Second: a self-test that ships inside the artefact is only as good as the product it describes. When the product changes shape, the suite has to be rewritten with it, not merely made to pass — and the fastest way to rewrite it honestly is to turn the removals into assertions.

Third: translation and scope interact. A render-time translation layer is a scope decision, not a formatting one, because it will translate whatever chrome you add and it cannot tell a retired feature from a live one.

## By the numbers

- 1 HTML file, 430 KB, 6,168 lines, 0 network requests after load
- 136 catalogue sites: 30 hand-built with real addresses, 106 generated from their own rows
- 8 services on the strip; 3 OS applications removed (settings, document store, terminal)
- 41 in-artefact checks, all green, 0 Hangul on screen
- 421 build-time translation rows across 13 batches, 42 unmatched
- 2 published builds: this one, and the Korean full-desktop original
