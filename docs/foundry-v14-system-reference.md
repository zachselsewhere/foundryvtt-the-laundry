# FoundryVTT v14 System Development — Retained Reference

Compiled reference for building this system on **Foundry VTT v14**. v14 continues the
ApplicationV2 + DataModel architecture (introduced/stabilised across v11–v13) and adds
the deprecations noted below. This is the architecture this system is built on.

## The headline v14 change
- **`template.json` is deprecated in v14.** Declare document sub-types in `system.json`
  under `documentTypes`, and define their data with `foundry.abstract.TypeDataModel`
  classes registered on `CONFIG.Actor.dataModels` / `CONFIG.Item.dataModels`.
  **This system uses that approach and ships no `template.json`.**
- **Runtime:** v14 requires **Node.js 24**.
- **TinyMCE removed** — **ProseMirror is the only rich-text editor**. Use the
  `{{editor ... engine="prosemirror"}}` Handlebars helper or `<prose-mirror>` elements.
- **`ActiveEffect#origin` is now a `DocumentUUIDField`** (was a plain string) — treat it
  as a UUID (`fromUuid`), and when creating effects set `origin: actor.uuid`.

## Manifest (`system.json`) essentials
- Required: `id` (must equal folder name, lowercase/hyphens), `title`, `description`,
  `version`.
- `compatibility: { minimum, verified, maximum }` — Foundry generation numbers.
  This system pins `minimum: "14", verified: "14", maximum: "14"`.
- `esmodules: []` (ES module entry points), `styles: []`, `languages: []`, `packs: []`.
- `documentTypes: { Actor: {...}, Item: {...} }` — each subtype may declare `htmlFields`
  (dot-paths under `system` holding rich HTML) and `filePathFields`.
- `primaryTokenAttribute` / `secondaryTokenAttribute` — dot-path to a `{value,max}` resource.
- `grid`, `initiative`, `url`, `manifest`, `download`.

## Data models — `foundry.abstract.TypeDataModel`
```js
const fields = foundry.data.fields;
export class MyData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      hp: new fields.SchemaField({
        value: new fields.NumberField({ integer: true, min: 0, initial: 10 }),
        max:   new fields.NumberField({ integer: true, min: 0, initial: 10 })
      }),
      biography: new fields.HTMLField({ blank: true })
    };
  }
  prepareBaseData() { /* pre-Active-Effects base values */ }
  prepareDerivedData() { /* post-Active-Effects derived values (may add non-schema props) */ }
  getRollData() { return { ...this }; }   // feeds @-substitutions
}
```
- Field types: `StringField, NumberField, BooleanField, SchemaField, ArrayField, SetField,
  ObjectField, HTMLField, FilePathField, ColorField, DocumentUUIDField, EmbeddedDataField…`
- Register in `init`: `CONFIG.Actor.dataModels.<subtype> = MyData;` — keys **must** match
  `documentTypes` in `system.json`.
- Lifecycle: `prepareBaseData()` → Active Effects → `prepareDerivedData()`. A field must
  exist in the schema (or be set in `prepareBaseData`) before effects can modify it.

## Sheets — ApplicationV2 + HandlebarsApplicationMixin
```js
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;   // ItemSheetV2 for items
export class MySheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["mysys", "sheet", "actor"],
    position: { width: 800, height: 800 },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: { doThing: MySheet.#onDoThing }   // data-action="doThing" -> static handler
  };
  static PARTS = { body: { template: "systems/mysys/templates/body.hbs" } };
  async _prepareContext(options) { const c = await super._prepareContext(options); /*…*/ return c; }
  static #onDoThing(event, target) { /* `this` = the sheet instance */ }
}
```
- **No jQuery** — `this.element` is a real `HTMLElement`; use `querySelector`, `dataset`,
  `addEventListener`. Post-render hook is `_onRender(context, options)`.
- **Actions** are `static` methods called with `this` bound to the instance; wire them via
  `data-action="name"` on elements. Receive `(event, target)`.
- **Form binding**: any control whose `name` is a document path (e.g.
  `name="system.hp.value"`) is written back automatically; with `submitOnChange:true`
  there's no submit button.
- Register in `init` via `foundry.documents.collections.{Actors,Items}`:
  ```js
  const { Actors, Items } = foundry.documents.collections;
  Actors.unregisterSheet("core", foundry.applications.sheets.ActorSheetV2);
  Actors.registerSheet("mysys", MySheet, { types: ["character"], makeDefault: true });
  ```

## Handlebars (v14 namespace)
- `foundry.applications.handlebars.loadTemplates(paths | {name: path})` — preload/partials.
- `{{editor enrichedHtml target="system.path" button=true editable=editable engine="prosemirror"}}`
  — rich-text editor with an explicit save target (used throughout this system).
- `{{formInput field value=…}}` / `{{formGroup field …}}` — schema-driven inputs.
- Built-in helpers: `{{localize}}`, `{{checked}}`, `{{selected}}`, `{{numberFormat}}`, …
- Tabs: content sections use `class="tab" data-group data-tab`; `.tab{display:none}` /
  `.tab.active{display:block}`. Never put `display:grid/flex` on the direct parent of `.tab`.

## Dice
```js
const roll = new Roll("Nd6", actor.getRollData());
await roll.evaluate();                       // async is mandatory
roll.dice[0].results;                        // [{result:…}, …]
await roll.toMessage({ speaker, flavor, content });
```

## Dialogs
`foundry.applications.api.DialogV2` — `DialogV2.prompt({ window, content, ok:{ callback } })`
resolves to the callback's return value. Parse form data with
`new foundry.applications.ux.FormDataExtended(form).object`.

## Namespace relocations to remember (bare globals are deprecated)
- `TextEditor` → `foundry.applications.ux.TextEditor`
- `FormDataExtended` → `foundry.applications.ux.FormDataExtended`
- `FilePicker` → `foundry.applications.apps.FilePicker` (instantiate via `.implementation`)
- `loadTemplates`/`renderTemplate` → `foundry.applications.handlebars.*`
- `Actors`/`Items` collections → `foundry.documents.collections.*`
- `DocumentSheetConfig` → `foundry.applications.apps.DocumentSheetConfig`

## Sources
Foundry official docs (System Development, System Data Models, Active Effects), the v14
release notes (Release 14.x), and the v13/v14 API docs for ApplicationV2, DocumentSheetV2,
ActorSheetV2, HandlebarsApplicationMixin, Roll, and `foundry.applications.handlebars`.
The ApplicationV2/DataModel API is identical between the v13-indexed docs and v14; only the
deprecations listed at the top of this file differ.
