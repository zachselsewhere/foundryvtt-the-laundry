# The Laundry RPG (Operator's Handbook edition) — Mechanics Reference

Source: `TL_OP_Corebook_260203_opt.pdf` (Cubicle 7). This is a **bespoke d6 dice-pool
system**, NOT the old d100/BRP Laundry. Confirmed from the corebook text.

## Core resolution — the Test
- Roll a **pool of d6s** = **Attribute score + Skill Training** (+ modifiers/Talents).
- Each die **≥ the Difficulty Number (DN)** counts as a **success**.
- **Focus**: after rolling, each point of Focus raises **one die result by +1**
  (points can be spread across dice or stacked on one die).
- **Complexity**: number of successes required. Written as **`DN X:Y`** = roll at DN X,
  need Y successes. (Evenly-matched combat = DN 4.)
- Untrained skill → pool = Attribute alone (GM discretion).

## Attributes (PC range 1–4; 2 = average, 4 = exceptional)
- **Body** — physical strength, reflexes, coordination. Feeds Melee, Defence.
- **Mind** — reasoning, perception, awareness. Feeds Accuracy, Initiative, Natural Awareness.
- **Spirit** — sense of self, drive, presence, will. Feeds Adrenaline, supernatural ability.

## The Ladder (map a numeric total → rating)
| Total | Rating |
|---|---|
| 1 | Poor |
| 2–3 | Average |
| 4–5 | Good |
| 6–7 | Great |
| 8–9 | Superb |
| 10–11 | Extraordinary |
| 12+ | Unprecedented |

(The character-sheet combat ladder shows Poor→Extraordinary; Unprecedented is the
top tier, mostly for monsters.)

## Skills (24) — each has Training (adds dice) and Focus (+1 to die results)
Academics, Athletics, Awareness, Bureaucracy, Close Combat, Computers, Dexterity,
Engineering, Fast Talk, Fortitude, Intuition, Magic, Medicine, Might, Occult, Presence,
Ranged, Reflexes, Resolve, Science, Stealth, Survival, Technology, Zeal.
- Sheet shows 3 Training boxes + 3 Focus diamonds; advancement rules allow up to 4.
  Model as integer 0–5 (render pips up to 5) to be safe.

## Derived / combat stats
- **Melee (M)** = Body + Training(Close Combat) → Ladder rating.
- **Accuracy (A)** = Mind + Training(Ranged) → Ladder rating.
- **Defence (D)** = Body + Training(Reflexes) → Ladder rating.
- **Attack DN** (attacker M or A step vs defender D step on the Ladder):
  2+ steps higher → DN 2 · 1 step higher → 3 · equal → 4 · 1 lower → 5 · 2+ lower → 6.
- **Initiative** = Mind + Training(Awareness) + Training(Reflexes)  [a number].
- **Natural Awareness** = ceil((Mind + Training(Awareness)) / 2)  ["assumed successes"].
- **Armour** = from gear (default 0); reduces incoming Damage.
- **Toughness** (Current/Total) = Body + Mind + Spirit. Non-lethal buffer.
- **Adrenaline** (Current/Total) = ceil(Spirit / 2). Fuels extra actions / Talents.
- **Injuries** max = ceil((Body + Mind + Spirit) / 2). When Toughness hits 0 and you take
  more Damage → an Injury. All injury slots filled → **Critically Injured**.
- **Speed** — movement/pace descriptor field on the sheet.

## Talents
Named special abilities gained from Assignment + XP. Each has requirements + effect text.

## Magic / Sorcery
"Applied computational demonology" — spells are computation. Spells & IT Equipment on the
sheet share the columns: **Name · DN · Target · Range · Duration · Effect**.
(IT Equipment = arcane gadgets/wards, e.g. Anti-Magic Ward; behave like usable devices.)

## Weapons / Attacks
Sheet columns: **Weapon · Pool · Focus · Damage · Traits**. Weapons have Damage + Traits
(e.g. Crushing). Melee attack = Body+Training(Close Combat); Ranged attack = Body+Training(Ranged).

## Character identity fields (sheet)
Name, Player, Assignment, Department, Line Manager, Supervisor(s), Short-term Goals,
Long-term Goals, Description, Age, Grade, Gender, Born, Deceased, Height, Weight, Speed.
Page 2: Photo, Next of Kin, Personal History, Possessions & Equipment, Disciplinary Record,
Goals, Training & Certification, IT Equipment table, Spells table.
Footer flavor: "classified PERSONA MATRIX RED … Falsified Records Directive (FRD)…"

## Assignments & Departments (character origin/occupation)
Departments: Auditing, Human Resources, Internal Logistics, Internal Security, Legal Affairs,
Records, Research & Development, Arcana Analysis, … Each Assignment grants starting
Attributes, Skills, a Primary/Core Talent, optional Talents, and issued equipment.

## Advancement (XP)
- Attribute: 1→2 = 3XP, 2→3 = 5XP, 3→4 = 10XP.
- Training/Focus per level: L1 1XP, L2 2XP, L3 3XP, L4 4XP (incremental).
- New Talent = 4XP.

## Team sheet (shared party resource)
Team/Project Name, Team Members, Team Manager, Budget, Short-term KPIs, Long-term KPIs,
Team Resources, Rumours, Known Allies, Known Enemies.
- **Total Luck** track 1–15 (current + max). Spend Luck to alter outcomes.
- **Threat** track 1–10. Rising cosmic/adversary threat.

## Visual identity of the official sheet (for the Foundry sheet aesthetic)
Classified government dossier: aged/grungy off-white paper texture; repeating
"Top Secret – Confidential" redaction banner along the top edge; bold monospace/typewriter
label font; dark charcoal section header bars with light lettering; thin black hairline
borders on boxed sections; Training = row of small squares, Focus = row of small
dots/diamonds; taped-in polaroid photo on page 2; classified footer stamp. Overall tone:
Cold-War British civil-service secret agency — bureaucratic, retro-institutional, ominous.
