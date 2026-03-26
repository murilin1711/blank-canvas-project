const fs = require('fs');

const MIN_EASE = {
  "agasalho":        22,
  "agasalho-tectel":  8,
  "camisa-m":        10,
  "camisa-bege":     10,
  "camisete-f":       2,
  "camiseta":         4,
  "tunica-f":         4,
  "tunica-m":         2,
  "saia":             1,
  "calca":            1,
};

function estimateBody(altura, peso, gender, caimento) {
  const h = altura / 100;
  const bmi = peso / (h * h);
  const g = gender ?? "m";

  let chest;
  let waist;

  if (g === "m") {
    chest = 91 + (bmi - 22) * 1.4 + (altura - 175) * 0.2;
    waist = 76 + (bmi - 22) * 2.6;
  } else {
    chest = 88 + (bmi - 21) * 2.2 + (altura - 165) * 0.2;
    waist = 68 + (bmi - 21) * 2.3;
  }

  if (caimento === "justo") {
    chest -= 2;
    waist -= 2;
  } else if (caimento === "oversize") {
    chest += 2;
    waist += 4;
  }

  chest = Math.max(78, Math.min(145, chest));
  waist = Math.max(56, Math.min(130, waist));

  return { chest, waist, halfWaist: waist / 2, bmi };
}

function genericLetterSize(bmi, gender, caimento, availableSizes) {
  const order = ["PPP", "PP", "P", "M", "G", "GG", "EXG", "EXGG"];
  const g = gender ?? "m";
  const adj = g === "f" ? -0.5 : 0;
  const fitAdj = caimento === "justo" ? -1 : caimento === "oversize" ? 1 : 0;
  const score = bmi + adj + fitAdj;

  let target;
  if (score < 18.5)     target = "PP";
  else if (score < 21)  target = "P";
  else if (score < 24)  target = "M";
  else if (score < 27)  target = "G";
  else if (score < 30)  target = "GG";
  else                  target = "EXGG";
  return target;
}

const body = estimateBody(174, 81, "m", "regular");
console.log("Body Chest:", body.chest);
console.log("Body Waist:", body.waist);
console.log("Target Camiseta:", Math.round(body.chest) + MIN_EASE["camiseta"], "-> expects M (104)");
console.log("Target Camisa Bege:", Math.round(body.chest) + MIN_EASE["camisa-bege"], "-> expects P (108)");
console.log("Target Agasalho Tectel:", Math.round(body.chest) + MIN_EASE["agasalho-tectel"], "-> expects M (110)");
console.log("Target Agasalho Gabardine:", Math.round(body.chest) + MIN_EASE["agasalho"], "-> expects G (122)");
console.log("Target Calca:", Math.round(body.halfWaist) + MIN_EASE["calca"], "-> expects 46");
console.log("Target Generic:", genericLetterSize(body.bmi, "m", "regular"), "-> expects G");
