# marketing

Artwork for places that are not the website: a Google Business Profile post,
WhatsApp status, a printed card. Nothing in here is served — Apache returns 403
for `/marketing/` and robots.txt says so too, the same treatment
`assets-original/` gets, because Hostinger deploys the whole repository into the
web root and only the site itself belongs there.

Each poster is an HTML page rendered to PNG by a script beside it. That is
deliberate: the logo, the photograph, the brand colours and Poppins are already
in this repository, so a poster built from them cannot drift away from the site,
and changing a price or a claim is a text edit and one command rather than a
round trip through a design tool.

## google-post

The card for a Google Business Profile post.

```
node marketing/google-post/make-post.mjs
```

Writes two JPEGs next to `post.html`:

| File | Size | For |
| --- | --- | --- |
| `nitesha-google-post-1200x900.jpg` | 1200×900 | Google Business Profile post (the size Google asks for) |
| `nitesha-google-post-1080x1080.jpg` | 1080×1080 | WhatsApp status, Instagram, anywhere square |

Both come off the same page, so the wording is written once.

### Posting it

Google Business Profile → **Add update** → **Add photos** → choose the 1200×900
file → write the text → **Add a button** → *Call now* or *Book*. A post shows
for a week or so before it drops down the profile, so this is worth re-posting
rather than uploading once.

The image carries the phone number because a post is often seen as a thumbnail
in search, where the buttons are not: somebody who only ever sees the picture
should still have a number to ring.

### Changing the words

Everything is in `post.html` — the headline, the three numbers, the line at the
foot. The numbers are the ones the website already claims (1000+ customers, 20+
vehicles, cleaned before every pickup); if one of those changes on the site,
change it here as well or the two will disagree in public.

The photograph is the site's own banner image. If there is ever a good
photograph of the actual fleet — a car on a real road in Kanyakumari, a set of
keys being handed over — use that instead. Google's own advice is that real
photographs of the business outperform stock artwork, and it is also simply more
honest about what turns up when someone books.
