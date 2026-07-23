import { LAUNDRY } from "../config.mjs";
import { laundryTest } from "../helpers/roll.mjs";

/** Actor document with Laundry Test helpers. */
export class LaundryActor extends Actor {
  /** Roll a Skill Test: pool = paired Attribute + Training, Focus available. */
  async rollSkill(skillKey, { attribute } = {}) {
    const skill = this.system.skills?.[skillKey];
    if (!skill) return null;
    const attrKey = attribute ?? LAUNDRY.skillDefaultAttribute[skillKey] ?? "body";
    const attrVal = this.system.attributes?.[attrKey] ?? 0;
    const flavor = `${game.i18n.localize(LAUNDRY.attributes[attrKey])} (${game.i18n.localize(LAUNDRY.skills[skillKey])})`;
    return laundryTest({ actor: this, flavor, pool: attrVal + skill.training, focus: skill.focus });
  }

  /** Roll a bare Attribute Test (no Skill). */
  async rollAttribute(attrKey) {
    const attrVal = this.system.attributes?.[attrKey];
    if (attrVal == null) return null;
    return laundryTest({ actor: this, flavor: game.i18n.localize(LAUNDRY.attributes[attrKey]), pool: attrVal, focus: 0 });
  }
}
