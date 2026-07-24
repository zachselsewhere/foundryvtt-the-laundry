import { LAUNDRY } from "../config.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Assignment charactermancer — pick a Department → Assignment (or Custom),
 * allocate the skill-XP budget (guided point-buy), choose 2 optional Talents,
 * and apply as the character's entry-level base (preserving XP-earned advancement).
 */
export class Charactermancer extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    const cur = actor.system.assignment;
    if (cur && cur !== "custom" && LAUNDRY.assignments[cur]) {
      this.deptKey = LAUNDRY.assignments[cur].department;
      this.#initAssignment(cur);
    } else {
      this.deptKey = null;
      this.assignmentKey = null;
      this.attrs = { body: 2, mind: 2, spirit: 2 };
      this.alloc = {};
      this.chosenTalents = new Set();
    }
  }

  static DEFAULT_OPTIONS = {
    id: "laundry-charactermancer-{id}",
    classes: ["the-laundry", "charactermancer"],
    position: { width: 620, height: 780 },
    window: { title: "Assignment Charactermancer", icon: "fa-solid fa-id-badge", resizable: true },
    actions: {
      stepSkill: Charactermancer.#onStepSkill,
      apply: Charactermancer.#onApply,
      cancel: Charactermancer.#onCancel
    }
  };

  static PARTS = {
    body: { template: "systems/the-laundry/templates/apps/charactermancer.hbs", scrollable: [""] }
  };

  /** Seed the working state from an assignment. Core skill starts at free Training 1 / Focus 1.
   *  Re-opening the character's *current* assignment preserves their existing entry allocation. */
  #initAssignment(key) {
    const a = LAUNDRY.assignments[key];
    const isCurrent = key === this.actor.system.assignment;
    this.assignmentKey = key;
    this.attrs = isCurrent ? { ...this.actor.system.entry.attributes } : { ...a.attributes };
    this.alloc = {};
    for (const s of new Set([a.coreSkill, ...a.skillList])) {
      const src = isCurrent ? this.actor.system.entry.skills[s] : null;
      this.alloc[s] = { training: src?.training ?? 0, focus: src?.focus ?? 0 };
    }
    // Core skill always carries its free Training 1 / Focus 1 baseline.
    this.alloc[a.coreSkill].training = Math.max(1, this.alloc[a.coreSkill].training);
    this.alloc[a.coreSkill].focus = Math.max(1, this.alloc[a.coreSkill].focus);
    this.chosenTalents = new Set();
  }

  get isCustom() { return this.deptKey === "custom"; }

  async _prepareContext() {
    const ctx = { departments: [], deptKey: this.deptKey, isCustom: this.isCustom };
    ctx.departments.push({ key: "custom", label: "— Custom (manual) —", selected: this.deptKey === "custom" });
    for (const [key, label] of Object.entries(LAUNDRY.departments)) {
      ctx.departments.push({ key, label, selected: key === this.deptKey });
    }

    if (this.deptKey && !this.isCustom) {
      ctx.assignments = Object.values(LAUNDRY.assignments)
        .filter(a => a.department === this.deptKey)
        .map(a => ({ key: a.key, name: a.name, sub: a.subdepartment, selected: a.key === this.assignmentKey }));
    }

    const a = (!this.isCustom && this.assignmentKey) ? LAUNDRY.assignments[this.assignmentKey] : null;
    if (a) {
      const cap = LAUNDRY.maxSkillRank;
      const tri = LAUNDRY.skillLevelCost;
      const eligible = [...new Set([a.coreSkill, ...a.skillList])];

      ctx.assignment = a;
      ctx.subdepartment = a.subdepartment;
      ctx.coreSkillLabel = LAUNDRY.skills[a.coreSkill];
      ctx.attrRows = ["body", "mind", "spirit"].map(k => ({ key: k, label: LAUNDRY.attributes[k], value: this.attrs[k] }));

      ctx.skillRows = eligible.map(key => {
        const al = this.alloc[key] ?? { training: 0, focus: 0 };
        return {
          key, label: LAUNDRY.skills[key], isCore: key === a.coreSkill,
          training: al.training, focus: al.focus,
          trainingPips: Array.from({ length: cap }, (_, i) => ({ filled: i < al.training })),
          focusPips: Array.from({ length: cap }, (_, i) => ({ filled: i < al.focus }))
        };
      });

      let spent = 0;
      for (const key of eligible) {
        const al = this.alloc[key] ?? { training: 0, focus: 0 };
        spent += tri(al.training) + tri(al.focus);
      }
      spent -= 2; // core skill's free Training 1 + Focus 1
      ctx.budget = a.skillXP;
      ctx.spent = spent;
      ctx.remaining = a.skillXP - spent;
      ctx.overspent = ctx.remaining < 0;

      ctx.coreTalent = a.coreTalent;
      ctx.coreTalentNote = a.coreTalentNote;
      ctx.optionalTalents = a.optionalTalents.map(name => ({ name, chosen: this.chosenTalents.has(name) }));
      ctx.chosenCount = this.chosenTalents.size;
      ctx.equipment = a.equipment;
      ctx.canApply = this.chosenTalents.size === 2 && ctx.remaining >= 0;
    }
    return ctx;
  }

  /** Wire change events once (selects, attribute inputs, talent checkboxes). */
  _onFirstRender(context, options) {
    super._onFirstRender?.(context, options);
    this.element.addEventListener("change", this.#onChange.bind(this));
  }

  #onChange(event) {
    const t = event.target;
    const kind = t.dataset?.cm;
    if (!kind) return;
    if (kind === "dept") {
      this.deptKey = t.value || null;
      this.assignmentKey = null;
      this.alloc = {};
      this.chosenTalents = new Set();
      this.render();
    } else if (kind === "assignment") {
      if (t.value) this.#initAssignment(t.value);
      this.render();
    } else if (kind === "attr") {
      this.attrs[t.dataset.attr] = Math.max(0, Number(t.value) || 0);
      // no re-render (avoid disrupting the field while typing)
    } else if (kind === "talent") {
      const name = t.dataset.name;
      if (t.checked) {
        if (this.chosenTalents.size >= 2) { t.checked = false; return; }
        this.chosenTalents.add(name);
      } else {
        this.chosenTalents.delete(name);
      }
      this.render();
    }
  }

  static #onStepSkill(event, target) {
    if (this.isCustom || !this.assignmentKey) return;
    const a = LAUNDRY.assignments[this.assignmentKey];
    const { skill, track } = target.dataset;
    const dir = Number(target.dataset.dir) || 0;
    const cap = LAUNDRY.maxSkillRank;
    const tri = LAUNDRY.skillLevelCost;
    const al = this.alloc[skill] ?? { training: 0, focus: 0 };
    const cur = al[track];
    const min = skill === a.coreSkill ? 1 : 0;

    if (dir > 0) {
      if (cur >= cap) return;
      // remaining budget check
      const eligible = [...new Set([a.coreSkill, ...a.skillList])];
      let spent = -2;
      for (const k of eligible) { const x = this.alloc[k] ?? { training: 0, focus: 0 }; spent += tri(x.training) + tri(x.focus); }
      const incCost = cur + 1;
      if (a.skillXP - spent < incCost) return; // not enough XP
      al[track] = cur + 1;
    } else if (dir < 0) {
      if (cur <= min) return;
      al[track] = cur - 1;
    }
    this.alloc[skill] = al;
    this.render();
  }

  static async #onApply() {
    if (this.isCustom) {
      await this.actor.applyCustom();
      return this.close();
    }
    if (!this.assignmentKey) return;
    const a = LAUNDRY.assignments[this.assignmentKey];
    const talents = [a.coreTalent, ...this.chosenTalents];
    await this.actor.applyAssignment({
      assignmentKey: this.assignmentKey,
      attributes: this.attrs,
      skills: this.alloc,
      talents,
      equipment: a.equipment
    });
    ui.notifications?.info(`Applied assignment: ${a.name}. XP-earned advancement was preserved.`);
    this.close();
  }

  static #onCancel() { this.close(); }
}
