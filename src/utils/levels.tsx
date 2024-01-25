import storage from "./storage";

let xp: number | null = null;

export async function addXp(amount: number) {
  let oldXp = await getXp();
  xp = oldXp + amount;
  storage.set("xp", xp);
  if (didLevelUp(oldXp, xp)) {
    return true;
  }
}

export async function getXp(): Promise<number> {
  if (xp == null) {
    xp = await storage.get("xp");
  }
  return xp || 0;
}

function didLevelUp(oldXp: number, newXp: number) {
  return getLevelOf(oldXp) > getLevelOf(newXp);
}

export async function getLevel() {
  return getLevelOf(await getXp());
}

function getLevelOf(xp: number): number {
  if (xp < 1000) {
    return Math.floor(xp / 100);
  } else {
    return Math.floor((xp - 1000) / 200) + 10;
  }
}
