// Cédula de Ciudadanía has no check digit. Since 2003 new numbers (NUIP) are 10 digits
// starting at 1.000.000.000; older ones were assigned by range and keep their number.
// The NIT (tax ID) is the cédula/company number plus a DIAN mod-11 check digit.
const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

export function computeNitDv(body: string): number {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum += parseInt(body[body.length - 1 - i], 10) * NIT_WEIGHTS[i];
  }
  const r = sum % 11;
  return r < 2 ? r : 11 - r;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function generateColombiaCedula(): string {
  // ponytail: upper bound approximates numbers issued so far, bump if it falls behind
  return randomInt(1_000_000_000, 1_099_999_999).toString();
}

function generateNit(min: number, max: number, wantDv?: number): string {
  while (true) {
    const body = randomInt(min, max).toString();
    const dv = computeNitDv(body);
    if (wantDv === undefined || dv === wantDv) return `${body}-${dv}`;
  }
}

export type EdgeCase = { label: string; code: string; description: string };

export function generateColombiaEdgeCases(): EdgeCase[] {
  return [
    {
      label: "Legacy cédula – male range",
      code: randomInt(1_000_000, 19_999_999).toString(),
      description: "Pre-2003 numbers 1 – 19.999.999 were assigned to men (7–8 digits)",
    },
    {
      label: "Legacy cédula – female range",
      code: randomInt(20_000_001, 69_999_999).toString(),
      description: "Pre-2003 numbers 20.000.001 – 69.999.999 were assigned to women",
    },
    {
      label: "Legacy cédula – 70M+ range",
      code: randomInt(70_000_001, 99_999_999).toString(),
      description: "Range used after male numbers ran out (70.000.001 – 99.999.999)",
    },
    {
      label: "Legacy cédula – 6 digits",
      code: randomInt(100_000, 999_999).toString(),
      description: "Very old, short cédulas — still valid, often rejected by length checks",
    },
    {
      label: "Company NIT",
      code: generateNit(800_000_000, 999_999_999),
      description: "9-digit legal entity NIT (8xx/9xx series) with DIAN check digit",
    },
    {
      label: "NIT – check digit 0",
      code: generateNit(800_000_000, 999_999_999, 0),
      description: "sum % 11 == 0 → check digit is the remainder itself (0)",
    },
    {
      label: "NIT – check digit 1",
      code: generateNit(800_000_000, 999_999_999, 1),
      description: "sum % 11 == 1 → check digit is 1, not 11 − 1 = 10",
    },
  ];
}
