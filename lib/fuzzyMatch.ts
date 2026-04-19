import { distance } from "fastest-levenshtein";

/**
 * Normalise une chaîne pour comparaison fuzzy :
 *  - trim, lowercase
 *  - décomposition NFD + suppression des diacritiques (é → e)
 *  - suppression de la ponctuation et des espaces
 */
export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacritiques
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "") // ponctuation, espaces, underscores…
    .trim();
}

/**
 * Tolérance Levenshtein en fonction de la longueur de la cible normalisée.
 *  ≤ 4  : 0
 *  5-7  : 1
 *  8-12 : 2
 *  > 12 : 3
 */
export function adaptiveTolerance(targetLen: number): number {
  if (targetLen <= 4) return 0;
  if (targetLen <= 7) return 1;
  if (targetLen <= 12) return 2;
  return 3;
}

/**
 * Match fuzzy robuste :
 *  1. Normalise input et target.
 *  2. Si input contient target en substring exact → succès (ex: "c'est Armin Arlert").
 *  3. Sinon compare distance de Levenshtein <= tolérance adaptative.
 */
export function fuzzyMatch(input: string, target: string): boolean {
  const a = normalize(input);
  const b = normalize(target);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b)) return true;
  const tol = adaptiveTolerance(b.length);
  return distance(a, b) <= tol;
}
