# Photographs

Drop image files in here and the site uses them. Nothing to register.

The filename (without its extension) is the slot. `cars-hero.jpg` fills the
`cars-hero` slot; rename a file and it moves slots. `.avif`, `.webp`, `.jpg`
and `.png` all work, and a slot with several formats prefers them in that
order — so adding `cars-hero.webp` beside `cars-hero.jpg` is an upgrade, not
a conflict.

## Words in the file name

Anything after a **double hyphen** is words for the address, not part of the
slot:

```
cars-hero--self-drive-cars-for-rent-nagercoil.webp
└── slot ──┘└──────── words in the URL ─────────┘
```

That file still fills `cars-hero`. The words matter because the file name is
one of the few things Google knows about a picture besides its alt text and
the page around it, and `cars-hero.webp` tells it nothing.

Describe what is actually in the photograph, and add the place only when the
photograph is of that place. A file called
`self-drive-car-rental-kanyakumari.jpg` showing a stock car on a European
mountain road is a claim the picture does not support, and Google is better at
noticing that than it used to be. Rewording is free — the slot does not move.

Any slot with no file falls back to the drawn scene, so a half-finished set
of photographs still gives a complete-looking site.

## Slots the pages look for

| File name                | Where it appears           | What it should show                                   |
| ------------------------ | -------------------------- | ----------------------------------------------------- |
| `cars-hero`              | Cars page banner           | Two or three of your cars together, outdoors           |
| `bikes-hero`             | Bikes page banner          | Scooters and a motorcycle, lined up                    |
| `wedding-hero`           | Wedding cars banner        | A decorated car, flowers visible                       |
| `tourist-hero`           | Tourist vehicles banner    | Your van or a group vehicle, ideally at a landmark     |
| `monthly-hero`           | Monthly rental banner      | A car parked at a home or office                       |
| `nri-hero`               | NRI page banner            | A car at an airport pickup, or with luggage loaded     |
| `tariff-hero`            | Tariff page banner         | Any clean, wide shot of a car                          |
| `about-hero`             | About page banner          | You, your team, or the yard                            |
| `contact-hero`           | Contact page banner        | Your office front, or a recognisable local landmark    |
| `/cars` `/bikes` …       | Home page service cards    | Same subjects, used as the card headers                |
| `coast`                  | Areas-served panel         | Kanyakumari coastline or the lighthouse                |

## Shooting notes

- **Landscape, and wide.** The banners crop to roughly 3:1 on a desktop, so
  anything important near the top or bottom edge gets cut. Leave room.
- **At least 1600px wide.** These stretch the full width of the page; below
  that they go soft on a laptop screen and badly soft on a phone.
- **Daylight, and not midday.** Early morning or an hour before sunset. Hard
  overhead sun blows out a car's bonnet and fills the windows with glare.
- **Clean cars.** Obvious, and the thing most often skipped.
- **No number plates you would rather not publish.** These pages are public
  and get indexed.
- **Keep them under about 500 KB each.** Export as `.webp` at quality 80 if
  you can; a 4 MB phone photo will load slowly on mobile data, which is how
  most of your visitors arrive.

## Photographs of individual cars

The fleet cards on the home page and on `/cars` look for a picture of each
vehicle here, and fall back to the drawing when there is not one. The name of
the file is the only thing that links it to the car — nothing to register, and
no code to change.

Three names are tried for each car, most specific first:

| File                             | Used for                                          |
| -------------------------------- | ------------------------------------------------- |
| `car-maruti-suzuki-swift.webp`   | That exact car — its brand and model in the panel  |
| `car-swift.webp`                 | Any Swift, whoever makes it                        |
| `car-suv.webp`                   | Any SUV that has no picture of its own             |

The name comes straight from the panel: take the **Brand** and the **Listing
name**, lowercase them, and put a hyphen wherever there is a space. `Maruti
Suzuki` + `Swift` becomes `car-maruti-suzuki-swift`. Change a car's name in the
panel and the filename has to change with it.

The four body-type files — `car-hatchback`, `car-sedan`, `car-suv`, `car-muv` —
are the quickest way to get a real photograph onto every card: four files, and
nothing is left as a drawing. Photograph the actual cars later and drop them in
one at a time; each one takes over its own card as it arrives.

These are card headers rather than banners, so they crop to 16:10. About
1200px wide is plenty, and the same shooting notes above apply — especially the
one about number plates.
