import { NatalChartData } from "@/services/astrologyService";

// Lazy load SwissEph from local swisseph-wasm bundle (single shared instance to avoid WASM OOM)
let SwissEph: any = null;
let swissEphPromise: Promise<any> | null = null;
let sweInstance: any | null = null;
let sweReadyPromise: Promise<any> | null = null;

async function getSwissEphClass() {
  if (SwissEph) return SwissEph;
  if (swissEphPromise) return swissEphPromise;

  swissEphPromise = import("../../swisseph-wasm-main/src/swisseph.js").then((module) => {
    SwissEph = module.default;
    return SwissEph;
  });

  return swissEphPromise;
}

async function getSweInstance() {
  if (sweInstance) return sweInstance;
  if (sweReadyPromise) return sweReadyPromise;

  sweReadyPromise = (async () => {
    const SwissEphClass = await getSwissEphClass();
    const swe = new SwissEphClass();
    await swe.initSwissEph();
    sweInstance = swe;
    return sweInstance;
  })();

  return sweReadyPromise;
}

export interface TransitAspect {
  transitingPlanet: string;
  aspectName: string;
  natalPlanet: string;
  orb: number;
}

export async function calculateTransitsForNow(chart: NatalChartData): Promise<TransitAspect[]> {
  const swe = await getSweInstance();

    const now = new Date();
    const jd_ut = swe.julday(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      now.getUTCDate(),
      now.getUTCHours() + now.getUTCMinutes() / 60
    );

    const transitingPlanets = [
      { id: swe.SE_SUN, name: "Солнце" },
      { id: swe.SE_MOON, name: "Луна" },
      { id: swe.SE_MERCURY, name: "Меркурий" },
      { id: swe.SE_VENUS, name: "Венера" },
      { id: swe.SE_MARS, name: "Марс" },
      { id: swe.SE_JUPITER, name: "Юпитер" },
      { id: swe.SE_SATURN, name: "Сатурн" },
      { id: swe.SE_URANUS, name: "Уран" },
      { id: swe.SE_NEPTUNE, name: "Нептун" },
      { id: swe.SE_PLUTO, name: "Плутон" },
    ];

    const currentPositions = transitingPlanets.map((p) => ({
      ...p,
      longitude: swe.calc_ut(jd_ut, p.id, swe.SEFLG_SWIEPH)[0],
    }));

    const natalPlanets = chart.planets;
    const foundAspects: TransitAspect[] = [];

    const aspectTypes = [
      { name: "Conjunction", angle: 0, orb: 2 },
      { name: "Opposition", angle: 180, orb: 2 },
      { name: "Trine", angle: 120, orb: 2 },
      { name: "Square", angle: 90, orb: 2 },
      { name: "Sextile", angle: 60, orb: 2 },
    ];

    for (const tp of currentPositions) {
      for (const np of natalPlanets) {
        let angle = Math.abs(tp.longitude - np.longitude);
        if (angle > 180) angle = 360 - angle;

        for (const aspect of aspectTypes) {
          const orb = Math.abs(angle - aspect.angle);
          if (orb <= aspect.orb) {
            foundAspects.push({
              transitingPlanet: tp.name,
              aspectName: aspect.name,
              natalPlanet: np.name,
              orb,
            });
          }
        }
      }
    }

  // Сортируем по точности аспекта (меньший орб — важнее)
  return foundAspects.sort((a, b) => a.orb - b.orb);
}


