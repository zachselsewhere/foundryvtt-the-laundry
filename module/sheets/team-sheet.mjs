const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** The Team Sheet — shared party resource tracker (Luck & Threat). */
export class LaundryTeamSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["the-laundry", "sheet", "actor", "team"],
    position: { width: 820, height: 860 },
    window: { resizable: true, icon: "fa-solid fa-users-gear" },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      adjustLuck: LaundryTeamSheet.#onAdjustLuck,
      adjustThreat: LaundryTeamSheet.#onAdjustThreat
    }
  };

  static PARTS = {
    main: { template: "systems/the-laundry/templates/actor/team.hbs", scrollable: [""] }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const sys = this.actor.system;

    context.actor = this.actor;
    context.system = sys;
    context.fields = sys.schema.fields;
    context.editable = this.isEditable;

    context.luckTrack = Array.from({ length: sys.luck.max }, (_, i) => ({
      n: i + 1, active: i < sys.luck.value
    }));
    context.threatTrack = Array.from({ length: sys.threat.max }, (_, i) => ({
      n: i + 1, active: i < sys.threat.value
    }));

    const enrich = (html) => foundry.applications.ux.TextEditor.enrichHTML(html ?? "", {
      relativeTo: this.actor, secrets: this.actor.isOwner
    });
    context.enriched = {
      members: await enrich(sys.members),
      teamManager: await enrich(sys.teamManager),
      budget: await enrich(sys.budget),
      shortTermKPIs: await enrich(sys.shortTermKPIs),
      longTermKPIs: await enrich(sys.longTermKPIs),
      resources: await enrich(sys.resources),
      rumours: await enrich(sys.rumours),
      knownAllies: await enrich(sys.knownAllies),
      knownEnemies: await enrich(sys.knownEnemies)
    };
    return context;
  }

  static #onAdjustLuck(event, target) {
    const v = Number(target.dataset.value);
    const current = this.actor.system.luck.value;
    const next = current === v ? v - 1 : v;
    this.actor.update({ "system.luck.value": Math.max(0, next) });
  }

  static #onAdjustThreat(event, target) {
    const v = Number(target.dataset.value);
    const current = this.actor.system.threat.value;
    const next = current === v ? v - 1 : v;
    this.actor.update({ "system.threat.value": Math.max(1, next) });
  }
}
