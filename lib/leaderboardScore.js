/**
 * Trust Lesson — Leaderboard Scoring & Juror Sortition Logic
 *
 * Implements:
 * 1. Opsi B: Capped stake bonus to prevent buying rankings
 *    stakeBonus = min(stake, 250) * 0.1 (max 25 pts)
 *    Score = stakeBonus + (Completed Sessions * 25) + (Rating * 20)
 * 2. Pure null rating for mentors with 0 completed sessions (no fabricated default 4.8)
 * 3. 4-criteria aligned Juror eligibility check (dispute-architecture.md)
 * 4. Merged student score (sessions * 80) removing SBT double-counting
 */

/**
 * Calculate mentor leaderboard score (Opsi B).
 * @param {object} params
 * @param {number} params.stakeAmount - Current stake in USDC
 * @param {number} params.completedSessions - Number of sessions with COMPLETED status
 * @param {number|null} params.rating - Average star rating (1.0 - 5.0) or null if 0 sessions
 * @returns {number}
 */
export function calculateMentorScore({ stakeAmount = 0, completedSessions = 0, rating = null }) {
  const stake = Number(stakeAmount) || 0;
  const sessions = Number(completedSessions) || 0;

  // Capped stake bonus: max 25 pts (min(stake, 250) * 0.1)
  // Ensures capital commitment provides a modest booster but can NEVER outrank actual teaching history
  const stakeBonus = Math.min(stake, 250) * 0.1;

  // Rating contribution is strictly 0 if mentor has 0 sessions or null rating
  const ratingVal = (sessions > 0 && rating !== null && rating !== undefined) ? Number(rating) : 0;
  const ratingScore = ratingVal * 20;

  return Math.round(stakeBonus + (sessions * 25) + ratingScore);
}

/**
 * Check Dispute Council Juror eligibility.
 * Spec reference: docs/dispute-architecture.md
 * - Criterion 1: Economic Stake >= 100 USDC in MentorStaking.sol
 * - Criterion 2: Track record of >= 5 completed sessions with rating >= 4.8
 *
 * @param {object} params
 * @param {number} params.stakeAmount
 * @param {number} params.completedSessions
 * @param {number|null} params.rating
 * @returns {boolean}
 */
export function isJurorEligible({ stakeAmount = 0, completedSessions = 0, rating = null }) {
  const stake = Number(stakeAmount) || 0;
  const sessions = Number(completedSessions) || 0;
  const r = (sessions > 0 && rating !== null && rating !== undefined) ? Number(rating) : null;

  return stake >= 100 && sessions >= 5 && r !== null && r >= 4.8;
}

/**
 * Calculate student leaderboard score.
 * Per docs/systematics.md, exactly 1 Soulbound Credential (SBT) is minted per completed session.
 * Merged into (sessions * 80) to eliminate redundant double-counting of the same completion event.
 *
 * @param {object} params
 * @param {number} params.completedSessions
 * @returns {number}
 */
export function calculateStudentScore({ completedSessions = 0 }) {
  const sessions = Number(completedSessions) || 0;
  return sessions * 80;
}
