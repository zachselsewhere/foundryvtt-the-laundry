const fields = foundry.data.fields;

const html = () => new fields.HTMLField({ required: true, blank: true });

/**
 * Data model for the Team Sheet — a shared party resource tracker.
 * The Actor's name is the Team/Project Assigned Name.
 */
export class TeamData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { SchemaField, NumberField } = fields;
    return {
      members: html(),
      teamManager: html(),
      budget: html(),
      shortTermKPIs: html(),
      longTermKPIs: html(),
      resources: html(),
      rumours: html(),
      knownAllies: html(),
      knownEnemies: html(),

      // Spend Luck to bend fate; refills between missions.
      luck: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, max: 15, initial: 5 }),
        max: new NumberField({ required: true, integer: true, min: 0, max: 15, initial: 15 })
      }),

      // The rising cosmic / adversary Threat (floor of 1, ceiling of 10).
      threat: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 1, max: 10, initial: 1 }),
        max: new NumberField({ required: true, integer: true, min: 1, max: 10, initial: 10 })
      })
    };
  }
}
