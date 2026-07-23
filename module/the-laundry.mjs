/**
 * The Laundry Roleplaying Game — FoundryVTT system entry point.
 * Targets Foundry VTT v13/v14 (ApplicationV2 + DataModel architecture).
 */
import { LAUNDRY } from "./config.mjs";
import { CharacterData } from "./data/actor-character.mjs";
import { TeamData } from "./data/actor-team.mjs";
import { TalentData, WeaponData, EquipmentData, SpellData, ITGearData } from "./data/items.mjs";
import { LaundryActor } from "./documents/actor.mjs";
import { LaundryItem } from "./documents/item.mjs";
import { LaundryCharacterSheet } from "./sheets/character-sheet.mjs";
import { LaundryTeamSheet } from "./sheets/team-sheet.mjs";
import { LaundryItemSheet } from "./sheets/item-sheet.mjs";
import { preloadTemplates } from "./helpers/templates.mjs";
import { registerHandlebarsHelpers } from "./helpers/handlebars.mjs";

Hooks.once("init", () => {
  console.log("the-laundry | Initialising The Laundry Roleplaying Game system");

  // Expose config
  CONFIG.LAUNDRY = LAUNDRY;

  // Document classes
  CONFIG.Actor.documentClass = LaundryActor;
  CONFIG.Item.documentClass = LaundryItem;

  // Data models — keys must match documentTypes in system.json
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Actor.dataModels.npc = CharacterData;
  CONFIG.Actor.dataModels.team = TeamData;
  CONFIG.Item.dataModels.talent = TalentData;
  CONFIG.Item.dataModels.weapon = WeaponData;
  CONFIG.Item.dataModels.equipment = EquipmentData;
  CONFIG.Item.dataModels.spell = SpellData;
  CONFIG.Item.dataModels.itgear = ITGearData;

  // Static initiative — the value is derived on the character (Mind + Awareness + Reflexes)
  CONFIG.Combat.initiative = { formula: "@combat.initiative.value", decimals: 0 };

  // Conditions -> token status effects
  CONFIG.statusEffects = LAUNDRY.conditions.map(c => ({ id: c.id, name: c.name, img: c.img }));
  // Keep core "special" behaviours pointed at valid Laundry condition ids.
  Object.assign(CONFIG.specialStatusEffects, {
    DEFEATED: "unconscious",
    BLIND: "blinded"
  });

  // Sheets
  const { Actors, Items } = foundry.documents.collections;
  const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;

  Actors.unregisterSheet("core", ActorSheetV2);
  Actors.registerSheet("the-laundry", LaundryCharacterSheet, {
    types: ["character", "npc"],
    makeDefault: true,
    label: "LAUNDRY.SheetLabel.character"
  });
  Actors.registerSheet("the-laundry", LaundryTeamSheet, {
    types: ["team"],
    makeDefault: true,
    label: "LAUNDRY.SheetLabel.team"
  });

  Items.unregisterSheet("core", ItemSheetV2);
  Items.registerSheet("the-laundry", LaundryItemSheet, {
    makeDefault: true,
    label: "LAUNDRY.SheetLabel.item"
  });

  // Handlebars
  registerHandlebarsHelpers();
  return preloadTemplates();
});

Hooks.once("ready", () => {
  console.log("the-laundry | Ready");
});
