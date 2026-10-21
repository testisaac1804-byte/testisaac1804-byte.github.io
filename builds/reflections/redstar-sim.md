# What it is

A Red Star OS 3.0 desktop — KDE-derived, KCC-built, macOS-aping — sitting on a simulated Kwangmyong intranet, as one 303,793-byte HTML file that never touches the network. 49 catalogue entries, 24 page builders, 22 apps, a 45-assertion self-test, and no assets: the icons are inline SVG and the wallpapers are CSS gradients.

# Where the content came from

The instruction was "make a red star os sim with all these and search online to keep improving it". *All these* was a saved address table, which fixed the rule for the whole build: the site list could not be invented. 33 rows came from the "As of May 2016" Kwangmyong table, 12 addresses were read off press photographs of a 2015 Rason tourist chart, and 4 services appear only in reporting. Six categories — infra, dept, lib, remote, core, svc — each entry carrying the address its source gives.

The research half was about not guessing at the shell. Red Star OS is a KDE-based distribution by the Korea Computer Center; 3.0 imitates macOS with a top menu bar, a Dock and traffic-light controls on the left; Naenara is a Firefox fork restricted to Kwangmyong; Sogwang Office is an OpenOffice fork. Component names are real — Ryugyong Janggi, Bokem, SamTaeSong, UnBangUI, Crosswin, Companero, RSLogBrowser — which is why two of them became apps instead of a footnote. A Trend Micro write-up added the detail that Naenara hardcodes `10.76.1.11`, the same address the 2016 table lists for 내나라; that is recorded in the About panel rather than quietly smoothed over.

# What actually works

An address bar that takes an IP, a `.kp` host, a Korean name or an English name and lands on the same site — and that fails the way the real network fails. `google.com` gets a 접속금지 page and a row in the watch log. `8.8.8.8` gets "no route" with a route table. `bogus.kp` gets name-not-found with suggestions. A simulator that reaches everything would be a lie about the network it models.

The copy-protection theatre is behaviour, not decoration. Copying a document to external media rewrites the copy's body with the KCC mark, the drive serial, the terminal IP and a timestamp; turning the mark off is refused and logged. The second account, 방문자, is genuinely read-only: checkout, send, save and media copy each refuse and log. The shop does real arithmetic against a 48,000원 balance, with stock ceilings, a receipt and an insufficient-funds state.

# The bugs

Shop, mail and media panes rendered as stacked plain text, because the markup and the CSS were written in separate passes and nothing checked that every class used in JavaScript had a rule. The phone layout ignored its own breakpoint, because a base rule appended after the media query won the cascade. Self-test screenshots showed a stray "insufficient funds" dialog, because the checkout assertion left its modal open. The activity monitor existed in code but not in the Dock, because its maker was never registered as an app. "45 hosts" failed against 49 entries, because the copy was written before the last four services landed. The English build leaked Korean window titles and user names, because `RS.T()` ran at parse time before `?lang=` was read.

Every one of those is now a check: makers must be registered, counts come from the data, the self-test runs quiet, and the probe fails the build on overflow, on a window under the Dock, or on a start menu taller than the screen.

# Honest limits

A simulation, not a copy. No Red Star OS code and no Kwangmyong content: every page body, article, product, price, mail, log line and quiz question was written for this build. Bokem "encrypts" by scrambling characters — theatre, not cryptography, and the About panel says so. The `10.x` addresses are unroutable by design and the file never tries to reach them. The subject is a piece of software and the network it was built to browse; no political claim is made.
