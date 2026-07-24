import { LAUNDRY } from "../config.mjs";
import { ratingFromTotal } from "../helpers/ladder.mjs";

const fields = foundry.data.fields;

/** Blank-defaulting text field. */
const text = (initial = "") =>
  new fields.StringField({ required: true, blank: true, initial });

/** A {value,max} resource. */
const resource = (value = 0, max = 0) =>
  new fields.SchemaField({
    value: new fields.NumberField({ required: true, integer: true, min: 0, initial: value }),
    max: new fields.NumberField({ required: true, integer: true, min: 0, initial: max })
  });

/** Attribute layer (body/mind/spirit). */
const attrLayer = (initial) =>
  new fields.SchemaField({
    body: new fields.NumberField({ required: true, integer: true, min: 0, initial }),
    mind: new fields.NumberField({ required: true, integer: true, min: 0, initial }),
    spirit: new fields.NumberField({ required: true, integer: true, min: 0, initial })
  });

/** Skill layer: {training, focus} per skill key. */
const skillLayer = () => {
  const f = {};
  for (const key of Object.keys(LAUNDRY.skills)) {
    f[key] = new fields.SchemaField({
      training: new fields.NumberField({ required: true, integer: true, min: 0, max: 5, initial: 0 }),
      focus: new fields.NumberField({ required: true, integer: true, min: 0, max: 5, initial: 0 })
    });
  }
  return new fields.SchemaField(f);
};

/**
 * Character / NPC data model.
 *
 * Attributes and skills are stored as two layers — `entry` (the assignment's
 * entry-level template) and `earned` (advancement bought with XP). The effective
 * values used in play are `entry + earned`, composed in prepareBaseData so Active
 * Effects can still modify them.
 */
export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField, NumberField, HTMLField, BooleanField, StringField } = fields;

    return {
      assignment: new StringField({ required: true, blank: false, initial: "custom" }),

      entry: new SchemaField({
        attributes: attrLayer(2),
        skills: skillLayer()
      }),
      earned: new SchemaField({
        attributes: attrLayer(0),
        skills: skillLayer()
      }),

      identity: new SchemaField({
        player: text(), assignment: text(), department: text(), lineManager: text(),
        supervisors: text(), grade: text(), gender: text(), age: text(), born: text(),
        deceased: text(), height: text(), weight: text(), speed: text()
      }),

      description: new HTMLField({ required: true, blank: true }),
      goals: new SchemaField({
        shortTerm: new HTMLField({ required: true, blank: true }),
        longTerm: new HTMLField({ required: true, blank: true })
      }),

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

  /** Migrate legacy (pre-layer) characters: fold old attributes/skills into `entry`. */
  static migrateData(source) {
    if (source && typeof source === "object") {
      if (source.attributes && !(source.entry && source.entry.attributes)) {
        source.entry = source.entry || {};
        source.entry.attributes = source.attributes;
      }
      if (source.skills && !(source.entry && source.entry.skills)) {
        source.entry = source.entry || {};
        source.entry.skills = source.skills;
      }
    }
    return super.migrateData(source);
  }

  /** Compose effective attributes/skills from the two layers (pre-Active-Effects). */
  prepareBaseData() {
    const A = {};
    for (const k of ["body", "mind", "spirit"]) {
      A[k] = Math.max(0, (this.entry.attributes[k] ?? 0) + (this.earned.attributes[k] ?? 0));
    }
    this.attributes = A;

    const S = {};
    for (const key of Object.keys(LAUNDRY.skills)) {
      const e = this.entry.skills[key] ?? { training: 0, focus: 0 };
      const g = this.earned.skills[key] ?? { training: 0, focus: 0 };
      S[key] = {
        training: Math.max(0, e.training + g.training),
        focus: Math.max(0, e.focus + g.focus)
      };
    }
    this.skills = S;
  }

  /** Derived combat/ladder values (post-Active-Effects), per the Operative's Handbook. */
  prepareDerivedData() {
    const a = this.attributes;
    const sum = a.body + a.mind + a.spirit;

    this.combat.toughness.max = sum;
    this.combat.adrenaline.max = Math.ceil(a.spirit / 2);
    this.combat.injuries.max = Math.ceil(sum / 2);

    this.combat.toughness.value = Math.clamp(this.combat.toughness.value, 0, this.combat.toughness.max);
    this.combat.adrenaline.value = Math.clamp(this.combat.adrenaline.value, 0, this.combat.adrenaline.max);
    this.combat.injuries.value = Math.clamp(this.combat.injuries.value, 0, this.combat.injuries.max);
    this.combat.critical = (this.combat.injuries.max > 0) &&
      (this.combat.injuries.value >= this.combat.injuries.max);

    this.melee = this.#rating(a.body + this.skills.closeCombat.training);
    this.accuracy = this.#rating(a.mind + this.skills.ranged.training);
    this.defence = this.#rating(a.body + this.skills.reflexes.training);

    this.combat.initiative = {
      value: a.mind + this.skills.awareness.training + this.skills.reflexes.training
    };
    this.naturalAwareness = Math.ceil((a.mind + this.skills.awareness.training) / 2);
  }

  #rating(total) {
    const band = ratingFromTotal(total);
    return { total, key: band.key, label: band.label, step: band.step };
  }

  getRollData() {
    const data = { ...this };
    data.body = this.attributes.body;
    data.mind = this.attributes.mind;
    data.spirit = this.attributes.spirit;
    for (const [key, skill] of Object.entries(this.skills)) {
      data[key] = skill.training;
      data[`${key}Focus`] = skill.focus;
    }
    return data;
  }
}
