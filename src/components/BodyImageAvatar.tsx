import toraxMasc1 from "@/assets/body-images/torax-masc/1.png";
import toraxMasc2 from "@/assets/body-images/torax-masc/2.png";
import toraxMasc3 from "@/assets/body-images/torax-masc/3.png";
import toraxMasc4 from "@/assets/body-images/torax-masc/4.png";
import toraxMasc5 from "@/assets/body-images/torax-masc/5.png";
import toraxFem1  from "@/assets/body-images/torax-fem/1.png";
import toraxFem2  from "@/assets/body-images/torax-fem/2.png";
import toraxFem3  from "@/assets/body-images/torax-fem/3.png";
import toraxFem4  from "@/assets/body-images/torax-fem/4.png";
import toraxFem5  from "@/assets/body-images/torax-fem/5.png";
import abdomeMasc1 from "@/assets/body-images/abdome-masc/1.png";
import abdomeMasc2 from "@/assets/body-images/abdome-masc/2.png";
import abdomeMasc3 from "@/assets/body-images/abdome-masc/3.png";
import abdomeMasc4 from "@/assets/body-images/abdome-masc/4.png";
import abdomeMasc5 from "@/assets/body-images/abdome-masc/5.png";
import abdomeFem1  from "@/assets/body-images/abdome-fem/1.png";
import abdomeFem2  from "@/assets/body-images/abdome-fem/2.png";
import abdomeFem3  from "@/assets/body-images/abdome-fem/3.png";
import abdomeFem4  from "@/assets/body-images/abdome-fem/4.png";
import abdomeFem5  from "@/assets/body-images/abdome-fem/5.png";
import bustoFem1 from "@/assets/body-images/busto-fem/1.png";
import bustoFem2 from "@/assets/body-images/busto-fem/2.png";
import bustoFem3 from "@/assets/body-images/busto-fem/3.png";
import bustoFem4 from "@/assets/body-images/busto-fem/4.png";
import bustoFem5 from "@/assets/body-images/busto-fem/5.png";
import coxaMasc1 from "@/assets/body-images/coxa-quadril-masc/1.png";
import coxaMasc2 from "@/assets/body-images/coxa-quadril-masc/2.png";
import coxaMasc3 from "@/assets/body-images/coxa-quadril-masc/3.png";
import coxaMasc4 from "@/assets/body-images/coxa-quadril-masc/4.png";
import coxaMasc5 from "@/assets/body-images/coxa-quadril-masc/5.png";
import coxaFem1  from "@/assets/body-images/coxa-quadril-fem/1.png";
import coxaFem2  from "@/assets/body-images/coxa-quadril-fem/2.png";
import coxaFem3  from "@/assets/body-images/coxa-quadril-fem/3.png";
import coxaFem4  from "@/assets/body-images/coxa-quadril-fem/4.png";
import coxaFem5  from "@/assets/body-images/coxa-quadril-fem/5.png";
import gluteo1 from "@/assets/body-images/gluteo/1.png";
import gluteo2 from "@/assets/body-images/gluteo/2.png";
import gluteo3 from "@/assets/body-images/gluteo/3.png";
import gluteo4 from "@/assets/body-images/gluteo/4.png";
import gluteo5 from "@/assets/body-images/gluteo/5.png";

type Level = 1 | 2 | 3 | 4 | 5;

export type BodyRegion = "torax" | "abdome" | "busto" | "coxa" | "gluteo";

export interface BodyImageAvatarProps {
  sex: "m" | "f";
  region: BodyRegion;
  level: Level;
  width?: number;
}

const TORAX_MASC  = [toraxMasc1,  toraxMasc2,  toraxMasc3,  toraxMasc4,  toraxMasc5];
const TORAX_FEM   = [toraxFem1,   toraxFem2,   toraxFem3,   toraxFem4,   toraxFem5];
const ABDOME_MASC = [abdomeMasc1, abdomeMasc2, abdomeMasc3, abdomeMasc4, abdomeMasc5];
const ABDOME_FEM  = [abdomeFem1,  abdomeFem2,  abdomeFem3,  abdomeFem4,  abdomeFem5];
const BUSTO_FEM   = [bustoFem1,   bustoFem2,   bustoFem3,   bustoFem4,   bustoFem5];
const COXA_MASC   = [coxaMasc1,   coxaMasc2,   coxaMasc3,   coxaMasc4,   coxaMasc5];
const COXA_FEM    = [coxaFem1,    coxaFem2,    coxaFem3,    coxaFem4,    coxaFem5];
const GLUTEO      = [gluteo1,     gluteo2,     gluteo3,     gluteo4,     gluteo5];

function getImages(sex: "m" | "f", region: BodyRegion): string[] {
  switch (region) {
    case "torax":  return sex === "f" ? TORAX_FEM  : TORAX_MASC;
    case "abdome": return sex === "f" ? ABDOME_FEM : ABDOME_MASC;
    case "busto":  return BUSTO_FEM;
    case "coxa":   return sex === "f" ? COXA_FEM   : COXA_MASC;
    case "gluteo": return GLUTEO;
  }
}

// Renderiza apenas a imagem do nível ativo. O key muda junto com o nível,
// forçando o React a montar uma nova <img> que anima de opacity 0→1.
// Sem sobreposição de frames → sem interferência de posição durante a transição.
export function BodyImageAvatar({ sex, region, level, width = 140 }: BodyImageAvatarProps) {
  const images = getImages(sex, region);
  const src = images[level - 1];

  return (
    <div
      style={{
        position: "relative",
        width,
        height: width,
        backgroundColor: "white",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <img
        key={`${region}-${sex}-${level}`}
        src={src}
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          top: "-13%",
          left: 0,
          width: "100%",
          height: "113%",
          objectFit: "fill",
          animation: "bodyRegionFadeIn 0.25s ease",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
