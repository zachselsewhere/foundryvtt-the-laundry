import { DEPARTMENTS, ASSIGNMENTS } from "./assignments.mjs";

/**
 * Central configuration for The Laundry system.
 * Mounted on CONFIG.LAUNDRY during init.
 */
export const LAUNDRY = {};

/** Departments and the 27 standard Assignments (see module/assignments.mjs). */
LAUNDRY.departments = DEPARTMENTS;
LAUNDRY.assignments = ASSIGNMENTS;

/** Total XP to reach a Training/Focus level from 0 (triangular: 0,1,3,6,10). */
LAUNDRY.skillLevelCost = (level) => (level * (level + 1)) / 2;

/** The three core Attributes. */
LAUNDRY.attributes = {
  body: "LAUNDRY.Attribute.body",
  mind: "LAUNDRY.Attribute.mind",
  spirit: "LAUNDRY.Attribute.spirit"
};

/**
 * The 24 Skills, in the two-column order used on the printed Personnel Record.
 * Each skill is rated with Training (adds dice) and Focus (+1 to die results).
 */
LAUNDRY.skills = {
  academics: "LAUNDRY.Skill.academics",
  athletics: "LAUNDRY.Skill.athletics",
  awareness: "LAUNDRY.Skill.awareness",
  bureaucracy: "LAUNDRY.Skill.bureaucracy",
  closeCombat: "LAUNDRY.Skill.closeCombat",
  computers: "LAUNDRY.Skill.computers",
  dexterity: "LAUNDRY.Skill.dexterity",
  engineering: "LAUNDRY.Skill.engineering",
  fastTalk: "LAUNDRY.Skill.fastTalk",
  fortitude: "LAUNDRY.Skill.fortitude",
  intuition: "LAUNDRY.Skill.intuition",
  magic: "LAUNDRY.Skill.magic",
  medicine: "LAUNDRY.Skill.medicine",
  might: "LAUNDRY.Skill.might",
  occult: "LAUNDRY.Skill.occult",
  presence: "LAUNDRY.Skill.presence",
  ranged: "LAUNDRY.Skill.ranged",
  reflexes: "LAUNDRY.Skill.reflexes",
  resolve: "LAUNDRY.Skill.resolve",
  science: "LAUNDRY.Skill.science",
  stealth: "LAUNDRY.Skill.stealth",
  survival: "LAUNDRY.Skill.survival",
  technology: "LAUNDRY.Skill.technology",
  zeal: "LAUNDRY.Skill.zeal"
};

/** Which Attribute each Skill is most commonly paired with (for the default Test pool). */
LAUNDRY.skillDefaultAttribute = {
  academics: "mind",
  athletics: "body",
  awareness: "mind",
  bureaucracy: "mind",
  closeCombat: "body",
  computers: "mind",
  dexterity: "body",
  engineering: "mind",
  fastTalk: "spirit",
  fortitude: "body",
  intuition: "mind",
  magic: "spirit",
  medicine: "mind",
  might: "body",
  occult: "mind",
  presence: "spirit",
  ranged: "body",
  reflexes: "body",
  resolve: "spirit",
  science: "mind",
  stealth: "body",
  survival: "mind",
  technology: "mind",
  zeal: "spirit"
};

/** Maximum pips shown on the sheet for Training / Focus tracks (matches the printed sheet). */
LAUNDRY.maxSkillRank = 3;

/**
 * The Ladder — converts a numeric total into a rating band.
 * Ordered from lowest to highest; `step` is used for combat DN comparisons.
 */
LAUNDRY.ladder = [
  { key: "poor", label: "LAUNDRY.Ladder.poor", min: -Infinity, step: 0 },
  { key: "average", label: "LAUNDRY.Ladder.average", min: 2, step: 1 },
  { key: "good", label: "LAUNDRY.Ladder.good", min: 4, step: 2 },
  { key: "great", label: "LAUNDRY.Ladder.great", min: 6, step: 3 },
  { key: "superb", label: "LAUNDRY.Ladder.superb", min: 8, step: 4 },
  { key: "extraordinary", label: "LAUNDRY.Ladder.extraordinary", min: 10, step: 5 },
  { key: "unprecedented", label: "LAUNDRY.Ladder.unprecedented", min: 12, step: 6 }
];

/** The six rating bands shown in the sheet's combat matrix (Poor → Extraordinary). */
LAUNDRY.combatRatings = ["extraordinary", "superb", "great", "good", "average", "poor"];

/** Item types. */
LAUNDRY.itemTypes = {
  talent: "LAUNDRY.ItemType.talent",
  weapon: "LAUNDRY.ItemType.weapon",
  equipment: "LAUNDRY.ItemType.equipment",
  spell: "LAUNDRY.ItemType.spell",
  itgear: "LAUNDRY.ItemType.itgear"
};

LAUNDRY.talentTypes = {
  core: "LAUNDRY.TalentType.core",
  optional: "LAUNDRY.TalentType.optional"
};

/**
 * Conditions from "Fear, Terror and Other Conditions". Registered as Foundry
 * status effects so they can be toggled on tokens. Icons use core Font Awesome
 * status textures shipped with Foundry.
 */
LAUNDRY.conditions = [
  { id: "blinded", name: "LAUNDRY.Condition.blinded", img: "icons/svg/blind.svg" },
  { id: "charmed", name: "LAUNDRY.Condition.charmed", img: "icons/svg/heal.svg" },
  { id: "deafened", name: "LAUNDRY.Condition.deafened", img: "icons/svg/deaf.svg" },
  { id: "frightened", name: "LAUNDRY.Condition.frightened", img: "icons/svg/terror.svg" },
  { id: "incapacitated", name: "LAUNDRY.Condition.incapacitated", img: "icons/svg/unconscious.svg" },
  { id: "prone", name: "LAUNDRY.Condition.prone", img: "icons/svg/falling.svg" },
  { id: "restrained", name: "LAUNDRY.Condition.restrained", img: "icons/svg/net.svg" },
  { id: "stunned", name: "LAUNDRY.Condition.stunned", img: "icons/svg/daze.svg" },
  { id: "terrified", name: "LAUNDRY.Condition.terrified", img: "icons/svg/terror.svg" },
  { id: "unconscious", name: "LAUNDRY.Condition.unconscious", img: "icons/svg/unconscious.svg" },
  { id: "weakened", name: "LAUNDRY.Condition.weakened", img: "icons/svg/downgrade.svg" }
];
