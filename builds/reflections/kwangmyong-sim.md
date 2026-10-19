# The simulator, in full

A working model of the Democratic People's Republic of Korea's national intranet — Kwangmyong — as one HTML file that runs with the network cable pulled out.

It boots to a login gate with three accounts: a researcher with standard access, a lecturer at Kim Il Sung University, and a guest account in the reading room that can browse but cannot shop or send mail. Past that is a Windows-style desktop and a dock: a browser that resolves `.kp` hosts and internal `10.x` addresses, a national search engine, intranet mail, a site directory, document storage, a command terminal, a shop, a streaming app, and a help manual.

Behind it are 136 catalogue entries. Thirty have real addresses and hand-built pages — news wires, an encyclopaedia, a university, bookshops, a cooking site, a weather service, a mail client, an online shop with carts and checkout. The other 106 are generated from their own catalogue rows, so the directory is never a dead end: every entry you click opens something.

The part that makes it a simulation rather than a mock-up is the visit log. Every page you open is recorded with a timestamp, and the log is built so it refuses to be erased. That is the thing the sim is actually about: an intranet where the interesting fact is not what you can reach, but that reaching it is written down.

Nothing loads from the network. All 411 KB arrive in one request and the app never makes another.

# How it's put together

No framework, no bundler, no dependencies. The source lives as separate modules under `parts/` — pages, apps, shops, the about section, the stylesheets — and a shell script concatenates them into a single file, then runs a syntax check. A second script builds the English version from the same parts.

Five thousand seven hundred and ninety-one lines, 362 KB of it JavaScript. The clock and the Pyongyang date are real; the numbers are deterministic, seeded from the page key, so the same shop page shows the same prices on every reload instead of randomising itself into nonsense. Pages are built from a small set of primitives — a frame with tabs and an address bar, cards, side blocks, list rows — which is why 30 hand-written sites fit in a file this size.

The self-test is inside the artefact. Seventy-two checks that walk the catalogue, open every page, resolve every host, run the terminal commands and re-do the shop arithmetic. It is not a test file next to the app; it ships in the app and runs in the same page, in either language, including inside an iframe on the deployed site.

# The English rewrite

The original is Korean. Editing 400 KB of Korean by hand was not going to work, so I built a translation layer instead: an ordered table of exact source strings and their English replacements. Four hundred and sixty-five rows across thirteen batches, applied at build time, longest key first.

That last detail is the whole game. Rows are sorted longest-first so a short string cannot eat the start of a longer one. It also means a later batch cannot override an earlier batch unless it carries the *entire* corrected string — a fragment in batch 13 loses to the full sentence in batch 9. I lost an afternoon to exactly that before I understood it.

After every build I swept the result for residual Hangul: the terminal, every app, all eight site pages, the tutorial, the About section, the news desks. The English build ends at zero.

Two things only became visible at the end:

**The word dictionary is fine for chrome and fatal for prose.** Chrome strings are short and self-contained, so a dictionary row works. Article bodies are not: they came out as "socialistconstruction achieved the results summary next year's outlook announced". That is not a translation problem you can fix with more rows — it is the wrong tool. Generated content had to be replaced as a block. The wire copy for Korean Central News Agency and Rodong Sinmun is now written in English directly, five reports each, and the block swap is the last step of the build.

**The self-test is the only reason the rewrite was safe.** Mid-way through, it fell from 72 to 68 because assertions were comparing Korean labels that had just been translated. Rewriting them to assert on stable IDs instead of rendered text is what let me keep translating without flying blind.

# What broke

- **68/72 on the self-test.** Assertions matched displayed Korean text. Fix: assert on identifiers, not on what the user sees.
- **Batch precedence.** A later batch silently losing to an earlier one, because both matched and the longer key went first. Documented, and now the reason the fix tables carry whole strings.
- **Service names drifted.** The terminal called services one thing and the site directory another, because they were translated in different batches. Curated a single set of names for the terminal.
- **Three romanisations of one brand.** The same word appeared three ways across pages. Unified to one spelling everywhere, last batch, full string each time.
- **The deploy raced the listing generator.** The site script regenerates the build-log hub from the card list; running it while the generator was mid-write aborted the upload with no clear error. Re-running after the generator settled fixed it. Worth knowing that the deploy bundles whatever is on disk — including another session's unfinished cards.
- **Forty-two rows still match nothing.** Leftovers from sentences I rewrote twice. They are dead weight rather than bugs, but I have not triaged them, and the build report is the only place they show up.
- **One tooling hole.** The terminal-listing tool yields zero parseable rows because of a separator quirk in its own helper. I worked around it by hand instead of fixing it.

# What I'd change

- **Key the translations, do not match the text.** Every row is a brittle exact-match against a Korean sentence. A message catalogue keyed by ID would have survived three rewrites without a single stale row, and the 42 orphans would not exist.
- **Separate chrome from content from day one.** I learned this at the news desk, late. It should have been the first architectural decision, not the last fix.
- **Run the self-test at build time and fail the build.** I read a board after each build; a non-zero exit would have caught the 68/72 regression the moment it happened.
- **Fewer generated pages, more depth.** The 106 generated entries make the directory feel real, but they share one template. Ten richer pages would teach more than a hundred stubs.
- **Publish the Korean original alongside from the start.** It is the honest reference for anyone who reads Korean, and it costs one button. It is there now.

# What I learned

Exact-string replacement at this scale is only survivable with a report. Four hundred and sixty-five rows produce a list of what did not match, and that list — not the diff — is what found the precedence bug and the drifted service names. Without it I would have shipped a build that looked finished and said the wrong thing in a dozen places.

Second: an app that tests itself is worth more than any harness around it. The same 72 checks ran standalone, in the deployed page, inside an iframe, in both languages, with no test infrastructure to maintain — and they are the reason I can claim the English build works rather than hoping it does.

Third: translation strategy has to follow the shape of the text. Interface strings want a dictionary; prose wants a writer.

# By the numbers

- 1 HTML file, 411 KB, 5,791 lines, 0 network requests after load
- 136 catalogue sites: 30 hand-built with real addresses, 106 generated from their own rows
- 8 tabbed page sets, one address bar that resolves `.kp` hosts and internal IPs
- 72 self-test checks, green in both languages and inside the deployed iframe
- 13 build-time fix batches, 465 rows, 42 unmatched
- English build: 0 Hangul on every screen, tab and article
- 2 published builds: English and the Korean original, on the same card
