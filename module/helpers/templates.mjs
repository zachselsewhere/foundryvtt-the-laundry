const SYS = "systems/the-laundry/templates";

/** Preload and register Handlebars templates & named partials. */
export function preloadTemplates() {
  const paths = [
    // Actor: character (Personnel Record)
    `${SYS}/actor/character-header.hbs`,
    `${SYS}/actor/character-dossier.hbs`,
    `${SYS}/actor/character-file.hbs`,
    `${SYS}/actor/character-effects.hbs`,
    // Actor: team
    `${SYS}/actor/team.hbs`,
    // Items
    `${SYS}/item/item-header.hbs`,
    `${SYS}/item/item-body.hbs`
  ];

  // Named partials referenced as {{> laundry.skillRow}} etc.
  const partials = {
    "laundry.skillRow": `${SYS}/partials/skill-row.hbs`
  };

  return foundry.applications.handlebars.loadTemplates(paths)
    .then(() => foundry.applications.handlebars.loadTemplates(partials));
}
