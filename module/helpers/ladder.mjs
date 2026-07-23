import { LAUNDRY } from "../config.mjs";

/**
 * Convert a numeric total into a Ladder band.
 * @param {number} total
 * @returns {{key:string,label:string,step:number}}
 */
export function ratingFromTotal(total) {
  let result = LAUNDRY.ladder[0];
  for (const band of LAUNDRY.ladder) {
    if (total >= band.min) result = band;
  }
  return result;
}

/** The integer step of a Ladder band (poor=0 … unprecedented=6). */
export function stepFromTotal(total) {
  return ratingFromTotal(total).step;
}

/**
 * The Difficulty Number for an attack, comparing the attacker's combat step
 * (Melee or Accuracy) against the defender's Defence step.
 * @param {number} attackStep
 * @param {number} defenceStep
 * @returns {number} DN from 2 (much stronger) to 6 (much weaker)
 */
export function attackDN(attackStep, defenceStep) {
  const diff = attackStep - defenceStep;
  if (diff >= 2) return 2;
  if (diff === 1) return 3;
  if (diff === 0) return 4;
  if (diff === -1) return 5;
  return 6;
}
