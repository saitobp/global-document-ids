export function isValidEcuadorPersonalCode(code?: string): boolean {
  if (!code) return false;
  if (!/^\d{10}$/.test(code)) return false;

  const provinceCode = parseInt(code.slice(0, 2), 10);
  const isValidProvince =
    (provinceCode >= 1 && provinceCode <= 24) || provinceCode === 30;
  if (!isValidProvince) return false;

  if (provinceCode !== 30 && parseInt(code[2], 10) > 5) return false;

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let product = parseInt(code[i], 10) * coefficients[i];
    if (product >= 10) product -= 9;
    sum += product;
  }

  const expected = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return expected === parseInt(code[9], 10);
}

export function generateEcuadorCedula(): string {
  while (true) {
    const province = Math.floor(Math.random() * 24) + 1;
    const p = province.toString().padStart(2, "0");
    const thirdDigit = Math.floor(Math.random() * 6);
    let partial = p + thirdDigit.toString();
    for (let i = 0; i < 6; i++) {
      partial += Math.floor(Math.random() * 10).toString();
    }

    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let product = parseInt(partial[i], 10) * coefficients[i];
      if (product >= 10) product -= 9;
      sum += product;
    }
    const checksum = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    const code = partial + checksum.toString();
    if (isValidEcuadorPersonalCode(code)) return code;
  }
}

function generateWithProvince30ThirdDigit6(): string {
  while (true) {
    let partial = "306";
    for (let i = 0; i < 6; i++) partial += Math.floor(Math.random() * 10);
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let p = parseInt(partial[i], 10) * coefficients[i];
      if (p >= 10) p -= 9;
      sum += p;
    }
    const checksum = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    const code = partial + checksum;
    if (isValidEcuadorPersonalCode(code)) return code;
  }
}

function generateProvince30Standard(): string {
  while (true) {
    const thirdDigit = Math.floor(Math.random() * 6);
    let partial = "30" + thirdDigit;
    for (let i = 0; i < 6; i++) partial += Math.floor(Math.random() * 10);
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let p = parseInt(partial[i], 10) * coefficients[i];
      if (p >= 10) p -= 9;
      sum += p;
    }
    const checksum = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    const code = partial + checksum;
    if (isValidEcuadorPersonalCode(code)) return code;
  }
}

function generateAnyProvinceThirdDigit(digit: 6 | 9): string {
  const province = Math.floor(Math.random() * 24) + 1;
  const p = province.toString().padStart(2, "0");
  let partial = p + digit;
  for (let i = 0; i < 6; i++) partial += Math.floor(Math.random() * 10);
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let prod = parseInt(partial[i], 10) * coefficients[i];
    if (prod >= 10) prod -= 9;
    sum += prod;
  }
  const checksum = sum % 10 === 0 ? 0 : 10 - (sum % 10);
  return partial + checksum;
}

function generateChecksumZero(): string {
  while (true) {
    const province = Math.floor(Math.random() * 24) + 1;
    const p = province.toString().padStart(2, "0");
    const thirdDigit = Math.floor(Math.random() * 6);
    let partial = p + thirdDigit;
    for (let i = 0; i < 6; i++) partial += Math.floor(Math.random() * 10);
    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let prod = parseInt(partial[i], 10) * coefficients[i];
      if (prod >= 10) prod -= 9;
      sum += prod;
    }
    if (sum % 10 === 0) {
      const code = partial + "0";
      if (isValidEcuadorPersonalCode(code)) return code;
    }
  }
}

export type EdgeCase = { label: string; code: string; description: string };

export function generateEcuadorEdgeCases(): EdgeCase[] {
  return [
    {
      label: "Province 30 – third digit 6",
      code: generateWithProvince30ThirdDigit6(),
      description: "Foreign residents (province 30) bypass the third-digit ≤ 5 restriction",
    },
    {
      label: "Province 30 – standard",
      code: generateProvince30Standard(),
      description: "Foreign residents province code (30), valid standard form",
    },
    {
      label: "Any province – third digit 6",
      code: generateAnyProvinceThirdDigit(6),
      description: "Province 1–24 with third digit 6 — valid checksum but fails the ≤ 5 rule",
    },
    {
      label: "Any province – third digit 9",
      code: generateAnyProvinceThirdDigit(9),
      description: "Province 1–24 with third digit 9 — valid checksum but fails the ≤ 5 rule",
    },
    {
      label: "Checksum yields 0",
      code: generateChecksumZero(),
      description: "sum % 10 == 0 → verification digit is 0",
    },
  ];
}
