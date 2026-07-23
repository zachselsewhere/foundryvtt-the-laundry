import { LAUNDRY } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** The Personnel Record — actor sheet for characters and NPCs. */
export class LaundryCharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["the-laundry", "sheet", "actor", "character"],
    position: { width: 860, height: 900 },
    window: { resizable: true, icon: "fa-solid fa-id-card-clip" },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      changeTab: LaundryCharacterSheet.#onChangeTab,
      editImage: LaundryCharacterSheet.#onEditImage,
      rollAttribute: LaundryCharacterSheet.#onRollAttribute,
      rollSkill: LaundryCharacterSheet.#onRollSkill,
      adjustSkill: LaundryCharacterSheet.#onAdjustSkill,
      adjustInjuries: LaundryCharacterSheet.#onAdjustInjuries,
      createItem: LaundryCharacterSheet.#onCreateItem,
      editItem: LaundryCharacterSheet.#onEditItem,
      deleteItem: LaundryCharacterSheet.#onDeleteItem,
      rollItem: LaundryCharacterSheet.#onRollItem,
      createEffect: LaundryCharacterSheet.#onCreateEffect,
      toggleEffect: LaundryCharacterSheet.#onToggleEffect,
      editEffect: LaundryCharacterSheet.#onEditEffect,
      deleteEffect: LaundryCharacterSheet.#onDeleteEffect
    }
  };

  static PARTS = {
    header: { template: "systems/the-laundry/templates/actor/character-header.hbs" },
    dossier: { template: "systems/the-laundry/templates/actor/character-dossier.hbs", scrollable: [""] },
    file: { template: "systems/the-laundry/templates/actor/character-file.hbs", scrollable: [""] },
    effects: { template: "systems/the-laundry/templates/actor/character-effects.hbs", scrollable: [""] }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.actor;
    const sys = actor.system;

    this.tabGroups ??= {};
    this.tabGroups.primary ??= "dossier";

    context.actor = actor;
    context.system = sys;
    context.fields = sys.schema.fields;
    context.editable = this.isEditable;
    context.tabs = this.#getTabs();

    // Attributes
    context.attributes = Object.keys(LAUNDRY.attributes).map(key => ({
      key, label: LAUNDRY.attributes[key], value: sys.attributes[key]
    }));

    // Skills (with Training squares + Focus dots)
    const max = LAUNDRY.maxSkillRank;
    context.skills = Object.keys(LAUNDRY.skills).map(key => {
      const s = sys.skills[key];
      const pips = (val) => Array.from({ length: max }, (_, i) => ({ n: i + 1, filled: i < val }));
      return {
        key,
        label: LAUNDRY.skills[key],
        attrLabel: LAUNDRY.attributes[LAUNDRY.skillDefaultAttribute[key]],
        training: s.training,
        focus: s.focus,
        trainingPips: pips(s.training),
        focusPips: pips(s.focus)
      };
    });
    // Split into the two printed columns.
    const half = Math.ceil(context.skills.length / 2);
    context.skillsLeft = context.skills.slice(0, half);
    context.skillsRight = context.skills.slice(half);

    // Combat matrix (auto-highlight derived M/A/D per rating row)
    context.combatMatrix = LAUNDRY.combatRatings.map(key => ({
      key,
      label: `LAUNDRY.Ladder.${key}`,
      m: sys.melee?.key === key,
      a: sys.accuracy?.key === key,
      d: sys.defence?.key === key
    }));
    context.melee = sys.melee;
    context.accuracy = sys.accuracy;
    context.defence = sys.defence;

    // Injury track boxes
    context.injuryTrack = Array.from({ length: sys.combat.injuries.max }, (_, i) => ({
      n: i + 1, filled: i < sys.combat.injuries.value
    }));

    // Items grouped by type
    const groups = { talent: [], weapon: [], equipment: [], spell: [], itgear: [] };
    for (const item of actor.items) groups[item.type]?.push(item);
    context.talents = groups.talent;
    context.weapons = groups.weapon;
    context.equipment = groups.equipment;
    context.spells = groups.spell;
    context.itgear = groups.itgear;

    // Active Effects
    context.effects = Array.from(actor.allApplicableEffects?.() ?? actor.effects);

    // Enriched rich-text
    const enrich = (html) => foundry.applications.ux.TextEditor.enrichHTML(html ?? "", {
      relativeTo: actor, secrets: actor.isOwner
    });
    context.enriched = {
      description: await enrich(sys.description),
      shortTerm: await enrich(sys.goals.shortTerm),
      longTerm: await enrich(sys.goals.longTerm),
      nextOfKin: await enrich(sys.bio.nextOfKin),
      personalHistory: await enrich(sys.bio.personalHistory),
      possessions: await enrich(sys.bio.possessions),
      disciplinary: await enrich(sys.bio.disciplinary),
      training: await enrich(sys.bio.training)
    };

    return context;
  }

  /** @override — give each tab part its active flag. */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    if (context.tabs?.[partId]) context.tab = context.tabs[partId];
    return context;
  }

  #getTabs() {
    const active = this.tabGroups.primary;
    const def = {
      dossier: { icon: "fa-solid fa-id-card", label: "LAUNDRY.Tab.dossier" },
      file: { icon: "fa-solid fa-folder-open", label: "LAUNDRY.Tab.file" },
      effects: { icon: "fa-solid fa-bolt", label: "LAUNDRY.Tab.effects" }
    };
    const tabs = {};
    for (const [id, t] of Object.entries(def)) {
      tabs[id] = { id, group: "primary", ...t, active: active === id, cssClass: active === id ? "active" : "" };
    }
    return tabs;
  }

  // ---- Actions ----------------------------------------------------------
  static #onChangeTab(event, target) {
    const group = target.dataset.group ?? "primary";
    const tab = target.dataset.tab;
    this.tabGroups[group] = tab;
    const root = this.element;
    root.querySelectorAll(`.tab[data-group="${group}"]`)
      .forEach(el => el.classList.toggle("active", el.dataset.tab === tab));
    root.querySelectorAll(`.tab-link[data-group="${group}"]`)
      .forEach(el => el.classList.toggle("active", el.dataset.tab === tab));
  }

  static #onEditImage(event, target) {
    if (!this.isEditable) return;
    const attr = target.dataset.edit ?? "img";
    const current = foundry.utils.getProperty(this.document, attr);
    const fp = new foundry.applications.apps.FilePicker.implementation({
      type: "image",
      current,
      callback: (path) => this.document.update({ [attr]: path })
    });
    return fp.browse();
  }

  static #onRollAttribute(event, target) {
    this.actor.rollAttribute(target.dataset.attr);
  }

  static #onRollSkill(event, target) {
    this.actor.rollSkill(target.dataset.skill);
  }

  static #onAdjustSkill(event, target) {
    const { skill, track, value } = target.dataset;
    const v = Number(value);
    const current = this.actor.system.skills[skill][track];
    const next = current === v ? v - 1 : v; // click the current top pip to decrement
    this.actor.update({ [`system.skills.${skill}.${track}`]: Math.max(0, next) });
  }

  static #onAdjustInjuries(event, target) {
    const v = Number(target.dataset.value);
    const current = this.actor.system.combat.injuries.value;
    const next = current === v ? v - 1 : v;
    this.actor.update({ "system.combat.injuries.value": Math.max(0, next) });
  }

  static async #onCreateItem(event, target) {
    const type = target.dataset.type ?? "equipment";
    const name = game.i18n.format("LAUNDRY.NewItem", {
      type: game.i18n.localize(LAUNDRY.itemTypes[type] ?? "Item")
    });
    await this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
  }

  static #onEditItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    this.actor.items.get(id)?.sheet.render(true);
  }

  static async #onDeleteItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    await this.actor.items.get(id)?.delete();
  }

  static #onRollItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    this.actor.items.get(id)?.roll();
  }

  // ---- Active Effects ---------------------------------------------------
  static async #onCreateEffect() {
    await this.actor.createEmbeddedDocuments("ActiveEffect", [{
      name: game.i18n.localize("LAUNDRY.NewEffect"),
      img: "icons/svg/aura.svg",
      origin: this.actor.uuid,
      disabled: false
    }]);
  }

  static #effectFromEvent(target) {
    const id = target.closest("[data-effect-id]")?.dataset.effectId;
    return this.actor.effects.get(id);
  }

  static async #onToggleEffect(event, target) {
    const effect = LaundryCharacterSheet.#effectFromEvent.call(this, target);
    if (effect) await effect.update({ disabled: !effect.disabled });
  }

  static #onEditEffect(event, target) {
    LaundryCharacterSheet.#effectFromEvent.call(this, target)?.sheet.render(true);
  }

  static async #onDeleteEffect(event, target) {
    await LaundryCharacterSheet.#effectFromEvent.call(this, target)?.delete();
  }
}
