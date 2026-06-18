export function isValidRUT(rut?: string): boolean {
  if (!rut) return false;

  const clean = rut.replace(/[^0-9Kk]/g, "").toUpperCase();

  if (!/^\d{7,9}[0-9K]$/.test(clean)) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected =
    remainder === 11 ? "0" : remainder === 10 ? "K" : remainder.toString();

  return dv === expected;
}

function computeRutDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  return remainder === 11 ? "0" : remainder === 10 ? "K" : remainder.toString();
}

export function formatRUT(rut: string): string {
  const clean = rut.replace(/[^0-9Kk]/g, "").toUpperCase();
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted}-${dv}`;
}

export function generateRUT(): string {
  while (true) {
    const digits = 7 + Math.floor(Math.random() * 2);
    let body = "";
    for (let i = 0; i < digits; i++) {
      body += Math.floor(Math.random() * 10).toString();
    }
    if (body[0] === "0") continue;
    const dv = computeRutDv(body);
    const rut = body + dv;
    if (isValidRUT(rut)) return rut;
  }
}

function generateRutWithKDv(): string {
  while (true) {
    const digits = 7 + Math.floor(Math.random() * 2);
    let body = "";
    for (let i = 0; i < digits; i++) body += Math.floor(Math.random() * 10);
    if (body[0] === "0") continue;
    if (computeRutDv(body) === "K") return body + "K";
  }
}

function generateRutWithBodyLength(length: 7 | 8 | 9): string {
  while (true) {
    let body = "";
    for (let i = 0; i < length; i++) body += Math.floor(Math.random() * 10);
    if (body[0] === "0") continue;
    const dv = computeRutDv(body);
    const rut = body + dv;
    if (isValidRUT(rut)) return rut;
  }
}

export type EdgeCase = { label: string; code: string; description: string };

export function generateChileEdgeCases(): EdgeCase[] {
  return [
    {
      label: "K verification digit",
      code: generateRutWithKDv(),
      description: "RUT where the checksum yields 'K' as the verification digit",
    },
    {
      label: "9-digit body",
      code: generateRutWithBodyLength(9),
      description: "RUT with a 9-digit body (largest valid form)",
    },
    {
      label: "7-digit body",
      code: generateRutWithBodyLength(7),
      description: "RUT with a 7-digit body (shortest valid form)",
    },
  ];
}
