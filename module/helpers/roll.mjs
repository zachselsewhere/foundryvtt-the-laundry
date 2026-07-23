/**
 * The Laundry Test resolution.
 *
 * A Test rolls a pool of d6 equal to Attribute + Skill Training (+ modifiers).
 * Each die whose result is >= the Difficulty Number (DN) is a success.
 * Focus points raise individual die results by +1 (applied here to maximise
 * successes). The Test passes if successes >= Complexity.
 */

const { DialogV2 } = foundry.applications.api;

/**
 * Prompt for Test parameters, roll, and post a chat card.
 * @param {object} opts
 * @param {Actor}  opts.actor
 * @param {string} opts.flavor    Label describing the Test.
 * @param {number} opts.pool      Base dice pool (Attribute + Training).
 * @param {number} [opts.focus]   Focus points available.
 */
export async function laundryTest({ actor, flavor, pool = 0, focus = 0 }) {
  const params = await promptTest({ flavor, pool, focus });
  if (!params) return null;

  const total = Math.max(0, params.pool + params.bonus);
  const dn = Math.clamp(params.dn, 1, 6);
  const complexity = Math.max(0, params.complexity);
  let focusPts = Math.max(0, params.focus);

  if (total < 1) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content: `<div class="laundry-roll"><h3>${flavor}</h3><p><em>No dice in the pool — the attempt fails automatically.</em></p></div>`
    });
    return null;
  }

  const roll = new Roll(`${total}d6`);
  await roll.evaluate();
  const raw = roll.dice[0].results.map(r => r.result);

  // Greedily spend Focus on the dice closest to the DN from below.
  const adjusted = raw.map(v => ({ base: v, value: v, boosted: 0 }));
  const candidates = adjusted
    .filter(d => d.value < dn)
    .sort((a, b) => (dn - b.value) - (dn - a.value)); // cheapest to convert last -> sort ascending cost
  candidates.sort((a, b) => (dn - a.value) - (dn - b.value));
  for (const die of candidates) {
    const need = dn - die.value;
    if (focusPts >= need) {
      die.value += need;
      die.boosted += need;
      focusPts -= need;
    }
  }

  const successes = adjusted.filter(d => d.value >= dn).length;
  const passed = successes >= complexity;

  const diceHtml = adjusted.map(d => {
    const cls = ["die", d.value >= dn ? "success" : "fail", d.boosted ? "boosted" : ""].join(" ").trim();
    const title = d.boosted ? `rolled ${d.base}, +${d.boosted} Focus` : `rolled ${d.base}`;
    return `<span class="${cls}" title="${title}">${d.value}</span>`;
  }).join("");

  const content = `
    <div class="laundry-roll">
      <h3>${flavor}</h3>
      <div class="laundry-roll-meta">DN ${dn}${complexity ? `:${complexity}` : ""} &middot; ${total}d6${params.focus ? ` &middot; Focus ${params.focus}` : ""}</div>
      <div class="laundry-dice">${diceHtml}</div>
      <div class="laundry-roll-result ${passed ? "passed" : "failed"}">
        ${successes} success${successes === 1 ? "" : "es"} &mdash; ${passed ? "PASS" : "FAIL"}
      </div>
    </div>`;

  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor,
    content
  }, { rollMode: game.settings.get("core", "rollMode") });

  return { successes, passed, dn, complexity };
}

/** Build and show the pre-roll dialog. Resolves to params or null. */
async function promptTest({ flavor, pool, focus }) {
  const content = `
    <form class="laundry-roll-dialog">
      <div class="form-group">
        <label>Dice Pool</label>
        <input type="number" name="pool" value="${pool}" min="0" step="1">
      </div>
      <div class="form-group">
        <label>Situational Dice (+/-)</label>
        <input type="number" name="bonus" value="0" step="1">
      </div>
      <div class="form-group">
        <label>Focus Points</label>
        <input type="number" name="focus" value="${focus}" min="0" step="1">
      </div>
      <div class="form-group">
        <label>Difficulty Number (DN)</label>
        <input type="number" name="dn" value="4" min="1" max="6" step="1">
      </div>
      <div class="form-group">
        <label>Complexity (successes needed)</label>
        <input type="number" name="complexity" value="1" min="0" step="1">
      </div>
    </form>`;

  return DialogV2.prompt({
    window: { title: `Test: ${flavor}`, icon: "fa-solid fa-dice-d6" },
    position: { width: 340 },
    content,
    ok: {
      label: "Roll",
      icon: "fa-solid fa-dice",
      callback: (event, button) => {
        const data = new foundry.applications.ux.FormDataExtended(button.form).object;
        return {
          pool: Number(data.pool) || 0,
          bonus: Number(data.bonus) || 0,
          focus: Number(data.focus) || 0,
          dn: Number(data.dn) || 4,
          complexity: Number(data.complexity) || 0
        };
      }
    },
    rejectClose: false
  });
}
