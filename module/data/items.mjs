import { LAUNDRY } from "../config.mjs";

const fields = foundry.data.fields;

const text = (initial = "") => new fields.StringField({ required: true, blank: true, initial });
const html = () => new fields.HTMLField({ required: true, blank: true });
const int = (initial = 0, min = 0) => new fields.NumberField({ required: true, integer: true, min, initial });

/** Skill keys as StringField choices. */
const skillChoices = Object.keys(LAUNDRY.skills);

/** Talent — a learned special ability. */
export class TalentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      talentType: new fields.StringField({
        required: true, choices: Object.keys(LAUNDRY.talentTypes), initial: "optional"
      }),
      requirements: text(),
      adrenalineCost: int(0),
      description: html()
    };
  }
}

/** Weapon — an attack row (Weapon · Pool · Focus · Damage · Traits). */
export class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attackType: new fields.StringField({
        required: true, choices: ["melee", "ranged"], initial: "melee"
      }),
      skill: new fields.StringField({
        required: true, choices: skillChoices, initial: "closeCombat"
      }),
      pool: int(0),
      focus: int(0),
      damage: text(),
      traits: text(),
      range: text(),
      equipped: new fields.BooleanField({ initial: true }),
      description: html()
    };
  }
}

/** General equipment / possession. */
export class EquipmentData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      quantity: int(1, 0),
      carried: new fields.BooleanField({ initial: true }),
      location: text(),
      description: html()
    };
  }
}

/**
 * Shared shape for Spells and IT Equipment — both are cast/activated via a
 * Test and share the columns: Name · DN · Target · Range · Duration · Effect.
 */
function occultSchema() {
  return {
    dn: text(),          // e.g. "4:2" (Difficulty Number : Complexity)
    target: text(),
    range: text(),
    duration: text(),
    effect: html(),
    description: html()
  };
}

/** Spell / ritual — applied computational demonology. */
export class SpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...occultSchema(),
      skill: new fields.StringField({ required: true, choices: skillChoices, initial: "magic" })
    };
  }
}

/** IT Equipment — arcane gadgets and wards (behave like usable devices). */
export class ITGearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...occultSchema(),
      level: int(0),
      charges: new fields.SchemaField({
        value: int(0),
        max: int(0)
      })
    };
  }
}
