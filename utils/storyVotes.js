const VOTES_STORAGE_KEY = "pt_votes";

export function loadUserVotes() {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VOTES_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveUserVotes(votes) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
}

/** Returns { upDelta, downDelta, nextVote } where nextVote is 'up' | 'down' | undefined. */
export function computeVoteDelta(prevVote, target) {
  let upDelta = 0;
  let downDelta = 0;
  let next = prevVote;

  if (target === "up") {
    if (prevVote === "up") {
      upDelta = -1;
      next = undefined;
    } else if (prevVote === "down") {
      upDelta = 1;
      downDelta = -1;
      next = "up";
    } else {
      upDelta = 1;
      next = "up";
    }
  } else if (prevVote === "down") {
    downDelta = -1;
    next = undefined;
  } else if (prevVote === "up") {
    downDelta = 1;
    upDelta = -1;
    next = "down";
  } else {
    downDelta = 1;
    next = "down";
  }

  return { upDelta, downDelta, nextVote: next };
}
