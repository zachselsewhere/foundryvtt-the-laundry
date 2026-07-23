import { LAUNDRY } from "../config.mjs";
import { laundryTest } from "../helpers/roll.mjs";

/** Default stamp icons applied to freshly-created items of each type. */
const TYPE_ICONS = {
  weapon: "systems/the-laundry/assets/icons/default-weapon.svg",
  equipment: "systems/the-laundry/assets/icons/default-equipment.svg",
  itgear: "systems/the-laundry/assets/icons/default-device.svg",
  talent: "systems/the-laundry/assets/icons/default-talent.svg",
  spell: "systems/the-laundry/assets/icons/default-spell.svg"
};

/** Item document with activation helpers for weapons, spells and IT gear. */
export class LaundryItem extends Item {
  /** Give new items a themed icon unless one was supplied (e.g. dragged from a compendium). */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    const isDefaultImg = !this.img || this.img === Item.implementation.DEFAULT_ICON;
    if (isDefaultImg && TYPE_ICONS[this.type]) {
      this.updateSource({ img: TYPE_ICONS[this.type] });
    }
  }

  /** Roll an attack (weapon) or casting (spell / itgear) Test using the owner. */
  async roll() {
    const actor = this.actor;
    if (!actor) return null;

    if (this.type === "weapon") {
      const skillKey = this.system.skill ?? "closeCombat";
      const attrKey = this.system.attackType === "ranged" ? "body" : LAUNDRY.skillDefaultAttribute[skillKey] ?? "body";
      const skill = actor.system.skills?.[skillKey];
      const attrVal = actor.system.attributes?.[attrKey] ?? 0;
      const basePool = this.system.pool || (attrVal + (skill?.training ?? 0));
      const focus = this.system.focus || (skill?.focus ?? 0);
      return laundryTest({ actor, flavor: `${this.name} (Attack)`, pool: basePool, focus });
    }

    if (this.type === "spell" || this.type === "itgear") {
      const skillKey = this.system.skill ?? "magic";
      const skill = actor.system.skills?.[skillKey];
      const attrVal = actor.system.attributes?.spirit ?? 0;
      return laundryTest({
        actor,
        flavor: `${this.name} (${this.type === "spell" ? "Cast" : "Activate"})`,
        pool: attrVal + (skill?.training ?? 0),
        focus: skill?.focus ?? 0
      });
    }
    return null;
  }
}
