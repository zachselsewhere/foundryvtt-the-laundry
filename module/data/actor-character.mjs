import { LAUNDRY } from "../config.mjs";
import { ratingFromTotal } from "../helpers/ladder.mjs";

const fields = foundry.data.fields;

/** Build a text field that defaults to blank. */
const text = (initial = "") =>
  new fields.StringField({ required: true, blank: true, initial });

/** A {value,max} resource. */
const resource = (value = 0, max = 0) =>
  new fields.SchemaField({
    value: new fields.NumberField({ required: true, integer: true, min: 0, initial: value }),
    max: new fields.NumberField({ required: true, integer: true, min: 0, initial: max })
  });

/**
 * Data model for a player character — the "Personnel Record".
 * Also used for NPCs (monsters can exceed the human 1-4 Attribute range).
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField, NumberField, HTMLField, BooleanField } = fields;

    // Build the 24-skill schema from config: each skill has training + focus.
    const skillFields = {};
    for (const key of Object.keys(LAUNDRY.skills)) {
      skillFields[key] = new SchemaField({
        training: new NumberField({ required: true, integer: true, min: 0, max: LAUNDRY.maxSkillRank, initial: 0 }),
        focus: new NumberField({ required: true, integer: true, min: 0, max: LAUNDRY.maxSkillRank, initial: 0 })
      });
    }

    return {
      identity: new SchemaField({
        player: text(),
        assignment: text(),
        department: text(),
        lineManager: text(),
        supervisors: text(),
        grade: text(),
        gender: text(),
        age: text(),
        born: text(),
        deceased: text(),
        height: text(),
        weight: text(),
        speed: text()
      }),

      description: new HTMLField({ required: true, blank: true }),

      goals: new SchemaField({
        shortTerm: new HTMLField({ required: true, blank: true }),
        longTerm: new HTMLField({ required: true, blank: true })
      }),

      attributes: new SchemaField({
        body: new NumberField({ required: true, integer: true, min: 0, initial: 2 }),
        mind: new NumberField({ required: true, integer: true, min: 0, initial: 2 }),
        spirit: new NumberField({ required: true, integer: true, min: 0, initial: 2 })
      }),

      skills: new SchemaField(skillFields),

      combat: new SchemaField({
        armour: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        toughness: resource(6, 6),
        adrenaline: resource(1, 1),
        injuries: resource(0, 4),
        critical: new BooleanField({ initial: false })
      }),

      bio: new SchemaField({
        nextOfKin: new HTMLField({ required: true, blank: true }),
        personalHistory: new HTMLField({ required: true, blank: true }),
        possessions: new HTMLField({ required: true, blank: true }),
        disciplinary: new HTMLField({ required: true, blank: true }),
        training: new HTMLField({ required: true, blank: true })
      }),

      xp: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        spent: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      })
    };
  }

  /** Final derived values, per the Operator's Handbook formulas. */
  prepareDerivedData() {
    const a = this.attributes;
    const sum = a.body + a.mind + a.spirit;

    // --- Health-style resources -------------------------------------------
    this.combat.toughness.max = sum;                       // Body + Mind + Spirit
    this.combat.adrenaline.max = Math.ceil(a.spirit / 2);  // ceil(Spirit / 2)
    this.combat.injuries.max = Math.ceil(sum / 2);         // ceil((B+M+S) / 2)

    this.combat.toughness.value = Math.clamp(this.combat.toughness.value, 0, this.combat.toughness.max);
    this.combat.adrenaline.value = Math.clamp(this.combat.adrenaline.value, 0, this.combat.adrenaline.max);
    this.combat.injuries.value = Math.clamp(this.combat.injuries.value, 0, this.combat.injuries.max);

    // Critically Injured: every Injury slot filled.
    this.combat.critical = (this.combat.injuries.max > 0) &&
      (this.combat.injuries.value >= this.combat.injuries.max);

    // --- Ladder-rated combat stats ----------------------------------------
    this.melee = this.#rating(a.body + this.skills.closeCombat.training);      // Body + Close Combat
    this.accuracy = this.#rating(a.mind + this.skills.ranged.training);        // Mind + Ranged
    this.defence = this.#rating(a.body + this.skills.reflexes.training);       // Body + Reflexes

    // --- Numeric derived stats --------------------------------------------
    this.combat.initiative = {
      value: a.mind + this.skills.awareness.training + this.skills.reflexes.training
    };
    this.naturalAwareness = Math.ceil((a.mind + this.skills.awareness.training) / 2);
  }

  /** Package a total into a Ladder rating for display. */
  #rating(total) {
    const band = ratingFromTotal(total);
    return { total, key: band.key, label: band.label, step: band.step };
  }

  /** @-substitutions available in Roll formulas. */
  getRollData() {
    const data = { ...this };
    data.body = this.attributes.body;
    data.mind = this.attributes.mind;
    data.spirit = this.attributes.spirit;
    // Flatten each skill's training/focus as e.g. @closeCombat / @closeCombatFocus
    for (const [key, skill] of Object.entries(this.skills)) {
      data[key] = skill.training;
      data[`${key}Focus`] = skill.focus;
    }
    return data;
  }
}
