// CUIT/CUIL: 2-digit type prefix + 8-digit DNI + mod-11 check digit.
const WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

function remainder(base: string): number {
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(base[i], 10) * WEIGHTS[i];
  return sum % 11;
}

export function isValidCUIT(cuit?: string): boolean {
  if (!cuit) return false;
  const clean = cuit.replace(/[-.\s]/g, "");
  if (!/^(20|23|24|27|30|33|34)\d{9}$/.test(clean)) return false;
  const r = remainder(clean);
  // Remainder 1 would give check digit 10 — AFIP never issues those, it reassigns the prefix
  if (r === 1) return false;
  return parseInt(clean[10], 10) === (r === 0 ? 0 : 11 - r);
}

// When the check digit would be 10, AFIP swaps the prefix to 23 (people) or 33 (companies)
function buildCUIT(prefix: string, dni: string): string {
  const base = prefix + dni;
  const r = remainder(base);
  if (r === 1) return buildCUIT(prefix[0] === "3" ? "33" : "23", dni);
  return base + (r === 0 ? 0 : 11 - r);
}

// Backend personal code for ARS is the bare DNI: ^[1-9][0-9]{6,7}$
export function generateDNI(min = 10_000_000, max = 49_999_999): string {
  return (min + Math.floor(Math.random() * (max - min + 1))).toString();
}

function randomDni(min: number, max: number): string {
  return generateDNI(min, max).padStart(8, "0");
}

// Loops until the original prefix yields the wanted remainder (if any)
function generateCUITWhere(
  prefix: string,
  wantRemainder?: number,
  min = 10_000_000,
  max = 49_999_999,
): string {
  while (true) {
    const dni = randomDni(min, max);
    if (wantRemainder === undefined || remainder(prefix + dni) === wantRemainder)
      return buildCUIT(prefix, dni);
  }
}

export function formatCUIT(cuit: string): string {
  if (cuit.length !== 11) return cuit; // bare DNI
  return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
}

export type EdgeCase = { label: string; code: string; description: string };

export function generateArgentinaEdgeCases(): EdgeCase[] {
  return [
    {
      label: "DNI – 7 digits",
      code: generateDNI(1_000_000, 9_999_999),
      description: "Legacy short DNI, no leading-zero padding (shortest the backend accepts)",
    },
    {
      label: "DNI – foreign resident",
      code: generateDNI(92_000_000, 95_999_999),
      description: "Bare DNI in the 92–95 million range issued to foreigners",
    },
    {
      label: "Prefix 23 – reassigned male",
      code: generateCUITWhere("20", 1),
      description: "Prefix 20 would yield check digit 10 → reissued as 23, check digit 9",
    },
    {
      label: "Prefix 23 – reassigned female",
      code: generateCUITWhere("27", 1),
      description: "Prefix 27 would yield check digit 10 → reissued as 23, check digit 4",
    },
    {
      label: "Checksum yields 0",
      code: generateCUITWhere("20", 0),
      description: "sum % 11 == 0 → check digit is 0 (not 11)",
    },
    {
      label: "Company CUIT (prefix 30)",
      code: generateCUITWhere("30", undefined, 50_000_000, 71_999_999),
      description: "Legal entity — body is an AFIP-assigned number, not a DNI",
    },
    {
      label: "Company reassigned (prefix 33)",
      code: generateCUITWhere("30", 1, 50_000_000, 71_999_999),
      description: "Prefix 30 would yield check digit 10 → reissued as 33, check digit 9",
    },
    {
      label: "Foreign resident DNI",
      code: generateCUITWhere("20", undefined, 92_000_000, 95_999_999),
      description: "DNIs issued to foreigners sit in the 92–95 million range",
    },
    {
      label: "Short DNI – leading zero",
      code: generateCUITWhere("20", undefined, 1_000_000, 9_999_999),
      description: "7-digit legacy DNI padded to 8 digits with a leading 0",
    },
  ];
}
