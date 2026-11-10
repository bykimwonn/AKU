/**
 * A one-slot handoff between "the page is frozen behind an overlay" and
 * "the page should end up in the next chapter".
 *
 * While an overlay is open the body is locked, so scrolling to a section
 * either does nothing or gets undone when the lock is released and the
 * visitor is put back where they were. That is why the letter's "Keep going"
 * button used to leave her staring at the same envelope.
 *
 * So a jump asked for during a lock is registered here by section id, and the
 * lock resolves it once the page can move again — measured after the unlock,
 * so the offset is accurate.
 */
let locks = 0;
let pendingId = null;

export const scrollHandoff = {
  addLock() {
    locks += 1;
  },

  releaseLock() {
    locks = Math.max(0, locks - 1);
  },

  isLocked() {
    return locks > 0;
  },

  /** Ask for the page to travel to this section when the overlay unlocks. */
  request(id) {
    pendingId = id == null ? null : String(id);
  },

  clear() {
    pendingId = null;
  },

  /** Read and consume the request — returns null when there isn't one. */
  take() {
    const id = pendingId;
    pendingId = null;
    return id;
  },
};

export default scrollHandoff;
