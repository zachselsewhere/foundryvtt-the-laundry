import { LAUNDRY } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/** Sheet for all Laundry item types (body template branches on type). */
export class LaundryItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["the-laundry", "sheet", "item"],
    position: { width: 520, height: 520 },
    window: { resizable: true, icon: "fa-solid fa-file-lines" },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      editImage: LaundryItemSheet.#onEditImage
    }
  };

  static PARTS = {
    header: { template: "systems/the-laundry/templates/item/item-header.hbs" },
    body: { template: "systems/the-laundry/templates/item/item-body.hbs", scrollable: [""] }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const item = this.document;

    context.item = item;
    context.system = item.system;
    context.fields = item.system.schema.fields;
    context.editable = this.isEditable;
    context.config = LAUNDRY;
    context.typeLabel = LAUNDRY.itemTypes[item.type] ?? "";

    // Choice lists for select controls
    context.skillChoices = LAUNDRY.skills;
    context.talentTypes = LAUNDRY.talentTypes;
    context.attackTypes = { melee: "LAUNDRY.AttackType.melee", ranged: "LAUNDRY.AttackType.ranged" };

    context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
      item.system.description ?? "", { relativeTo: item, secrets: item.isOwner }
    );
    if ("effect" in item.system) {
      context.enrichedEffect = await foundry.applications.ux.TextEditor.enrichHTML(
        item.system.effect ?? "", { relativeTo: item, secrets: item.isOwner }
      );
    }
    return context;
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
}
