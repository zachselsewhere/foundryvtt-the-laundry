import { LAUNDRY } from "../config.mjs";
import { laundryTest } from "../helpers/roll.mjs";

const ASSIGNMENT_FLAG = "fromAssignment";

/** Actor document with Laundry Test helpers and the assignment charactermancer. */
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

  /**
   * Apply an Assignment as the entry-level template. Sets `system.entry`
   * (attributes + allocated skills), swaps assignment-granted talent/equipment
   * items, and leaves `system.earned` (XP advancement) and player-added items intact.
   * @param {object} payload
   * @param {string} payload.assignmentKey
   * @param {{body,mind,spirit}} payload.attributes
   * @param {Object<string,{training,focus}>} payload.skills  entry skill allocation
   * @param {string[]} payload.talents    talent names (core + chosen)
   * @param {string[]} payload.equipment  equipment names
   */
  async applyAssignment({ assignmentKey, attributes, skills, talents = [], equipment = [] }) {
    const entrySkills = {};
    for (const key of Object.keys(LAUNDRY.skills)) entrySkills[key] = { training: 0, focus: 0 };
    for (const [key, val] of Object.entries(skills ?? {})) {
      if (entrySkills[key]) entrySkills[key] = { training: val.training ?? 0, focus: val.focus ?? 0 };
    }

    await this.update({
      "system.assignment": assignmentKey,
      "system.entry.attributes": {
        body: attributes.body ?? 2, mind: attributes.mind ?? 2, spirit: attributes.spirit ?? 2
      },
      "system.entry.skills": entrySkills
    });

    await this.#clearAssignmentItems();

    const newItems = [];
    for (const name of talents) {
      newItems.push(await LaundryActor.#itemFromPack("the-laundry.talents", name, "talent"));
    }
    for (const name of equipment) {
      newItems.push(await LaundryActor.#itemFromPack("the-laundry.tools-of-the-trade", name, "equipment"));
    }
    if (newItems.length) await this.createEmbeddedDocuments("Item", newItems);
  }

  /** Switch to Custom: reset the entry template to defaults and drop granted items (earned kept). */
  async applyCustom() {
    const entrySkills = {};
    for (const key of Object.keys(LAUNDRY.skills)) entrySkills[key] = { training: 0, focus: 0 };
    await this.update({
      "system.assignment": "custom",
      "system.entry.attributes": { body: 2, mind: 2, spirit: 2 },
      "system.entry.skills": entrySkills
    });
    await this.#clearAssignmentItems();
  }

  /** Delete embedded items flagged as granted by an assignment. */
  async #clearAssignmentItems() {
    const ids = this.items.filter(i => i.getFlag("the-laundry", ASSIGNMENT_FLAG)).map(i => i.id);
    if (ids.length) await this.deleteEmbeddedDocuments("Item", ids);
  }

  /** Resolve an item by (case-insensitive) name from a compendium; fall back to a name stub. */
  static async #itemFromPack(packId, name, fallbackType) {
    let data = null;
    const pack = game.packs.get(packId);
    if (pack) {
      const index = await pack.getIndex();
      const entry = index.find(e => e.name.toLowerCase() === name.toLowerCase());
      if (entry) {
        const doc = await pack.getDocument(entry._id);
        data = doc.toObject();
        delete data._id;
      }
    }
    if (!data) data = { name, type: fallbackType };
    data.flags = foundry.utils.mergeObject(data.flags ?? {}, { "the-laundry": { [ASSIGNMENT_FLAG]: true } });
    return data;
  }
}
