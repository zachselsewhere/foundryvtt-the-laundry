# The Laundry Roleplaying Game — FoundryVTT System

An unofficial, fan-made game system for **The Laundry Roleplaying Game: Operative's
Handbook** (Cubicle 7), based on Charles Stross's *Laundry Files* novels. It implements
the **C7d6** dice-pool ruleset and ships a character sheet styled after the printed
"Personnel Record" dossier.

> **Built for Foundry VTT v14.** `compatibility` is pinned to `minimum: 14, verified: 14`.
> The system uses the v14 architecture end-to-end — `documentTypes` + `TypeDataModel`
> (no deprecated `template.json`), `ApplicationV2` sheets, and ProseMirror rich text.

---

## Features

- **Personnel Record** character sheet (`character` actor) styled like the official
  classified dossier: aged-paper texture, "Top Secret · Confidential" banner, typewriter
  labels, charcoal section bars, Training-squares / Focus-dots, the vertical Injury track
  with a *Critically Injured* flag, a taped polaroid portrait, and the PERSONA MATRIX RED
  footer. Two tabs mirror the two printed pages (**Dossier** / **File**) plus an **Effects** tab.
- **Team Sheet** (`team` actor) with the shared **Luck** (1–15) and **Threat** (1–10) tracks,
  KPIs, budget, resources, allies/enemies and rumours.
- **NPC / Creature** actor (`npc`) using the same data model (Attributes can exceed the
  human 1–4 range for monsters).
- **Item types**: `talent`, `weapon`, `equipment`, `spell`, `itgear` (IT Equipment / wards).
- **Dice roller** implementing the Test: roll `Attribute + Training` d6, count dice ≥ the
  **Difficulty Number**, auto-apply **Focus** (+1 to dice), compare successes to the
  **Complexity** — with a pre-roll dialog and a styled chat card. Click any skill,
  attribute, weapon, or spell to roll.
- **Derived stats** computed automatically from the corebook formulas: Melee / Accuracy /
  Defence rated on **The Ladder**, Initiative, Natural Awareness, Toughness (B+M+S),
  Adrenaline (⌈Spirit/2⌉), and max Injuries (⌈(B+M+S)/2⌉).
- **Conditions** (Blinded, Charmed, Deafened, Frightened, Incapacitated, Prone, Restrained,
  Stunned, Terrified, Unconscious, Weakened) registered as token status effects.

## The ruleset (quick reference)
- **Attributes**: Body, Mind, Spirit (PCs 1–4).
- **Skills** (24): each rated with **Training** (adds dice) and **Focus** (+1 to a die result).
- **Test**: `DN X:Y` — roll the pool, each die ≥ X is a success, need Y successes.
- Full assessment: [`docs/laundry-mechanics.md`](docs/laundry-mechanics.md).

## Installation
1. Copy the **`the-laundry`** folder into your Foundry user data at
   `Data/systems/the-laundry` (the folder name must stay `the-laundry` — it matches the
   system `id`).
2. Restart Foundry, then create a new World using **The Laundry Roleplaying Game**.

(Or host `system.json` + a packaged zip and install via the manifest URL — fill in the
`manifest`/`download`/`url` fields in `system.json` first.)

## Usage notes
- **Attributes / current resources** (Toughness, Adrenaline, Armour) are editable inputs;
  **maxes and ratings are derived** and update live as Attributes/Skills change.
- **Training & Focus**: click a pip to set that rank; click the current top pip to drop one.
- **Injuries / Luck / Threat**: click a box to set the level (click the current top box to
  decrement). Filling every Injury box lights the *Critically Injured* flag.
- **Rolling**: click a skill name, an attribute label, a weapon, a spell, or an IT-equipment
  entry. Adjust DN / Complexity / situational dice in the dialog.

## Project structure
```
the-laundry/
├── system.json                 # v14 manifest (documentTypes, no template.json)
├── module/
│   ├── the-laundry.mjs         # entry: registers data models, sheets, conditions, helpers
│   ├── config.mjs              # skills, The Ladder, conditions, enums
│   ├── data/                   # TypeDataModel classes (character, team, items)
│   ├── documents/              # LaundryActor / LaundryItem (roll helpers)
│   ├── sheets/                 # ApplicationV2 sheets (character, team, item)
│   └── helpers/                # ladder maths, dice Test, template preload, hbs helpers
├── templates/                  # Handlebars (actor/, item/, partials/)
├── styles/the-laundry.css      # dossier styling (scoped under .the-laundry)
├── lang/en.json                # localisation
└── docs/                       # retained references (Foundry v14 build guide + rules)
```

## Known limitations / roadmap
- No bundled compendiums yet (Assignments, Talents, sample Spells/gear) — item types exist,
  content can be added as packs.
- The roll dialog auto-optimises Focus for maximum successes; manual Focus placement is a
  future option.
- Effect toggling on the Effects tab targets actor-owned effects; item-transferred effects
  are managed on their item.

## Legal
Unofficial fan content. Not affiliated with, endorsed by, or licensed by Cubicle 7 or
Charles Stross. No copyrighted rules text or artwork from the corebook is distributed with
this system; it ships only original code, styling, and localisation strings. "The Laundry"
and related names are trademarks of their respective owners.
