// Ensure Emscripten loader can resolve WASM/data files when using local swisseph build
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
(globalThis as any).Module = (globalThis as any).Module || {};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
(globalThis as any).Module.locateFile = (path: string, prefix: string) => {
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path;
  if (!path.endsWith('.wasm') && !path.endsWith('.data')) return `${prefix}${path}`;
  return `/${path}`;
};

import SwissEph from '../../swisseph-wasm-main/src/swisseph.js';
import type { BirthData } from '@/components/astrology/BirthDataForm';
import { City } from '@/data/cities';

const ZODIAC_SIGNS = [
  'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
  'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
];

const SIGN_RULERS: { [key: string]: string[] } = {
  'Овен': ['Марс'],
  'Телец': ['Венера'],
  'Близнецы': ['Меркурий'],
  'Рак': ['Луна'],
  'Лев': ['Солнце'],
  'Дева': ['Меркурий'],
  'Весы': ['Венера'],
  'Скорпион': ['Марс', 'Плутон'],
  'Стрелец': ['Юпитер'],
  'Козерог': ['Сатурн'],
  'Водолей': ['Сатурн', 'Уран'],
  'Рыбы': ['Юпитер', 'Нептун'],
};

export interface PlanetData {
  name: string;
  sign: string;
  degrees: number;
  house: number;
  longitude: number;
  speed: number;
  rulesHouses: number[];
}

export interface HouseCuspData {
  house: number;
  sign: string;
  degrees: number;
  longitude: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspectName: string;
  aspectSymbol: string;
  orb: number;
}

export interface NatalChartData {
  planets: PlanetData[];
  ascendant: { sign: string; degrees: number; longitude: number };
  houseCusps: HouseCuspData[];
  aspects: Aspect[];
}

const getSign = (longitude: number, swe: SwissEph): { sign: string; degrees: number } => {
  const lon = swe.degnorm(longitude);
  const signIndex = Math.floor(lon / 30);
  const degreesInSign = lon % 30;
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degrees: degreesInSign,
  };
};

const getHouseForPlanet = (planetLongitude: number, houseCusps: number[]): number => {
  const lon = (planetLongitude % 360 + 360) % 360;

  const cusps = [];
  for (let i = 1; i <= 12; i++) {
    cusps.push(houseCusps[i]);
  }

  for (let i = 0; i < 12; i++) {
    const cusp1 = cusps[i];
    const cusp2 = cusps[(i + 1) % 12];

    if (cusp2 < cusp1) {
      if (lon >= cusp1 || lon < cusp2) {
        return i + 1;
      }
    } else {
      if (lon >= cusp1 && lon < cusp2) {
        return i + 1;
      }
    }
  }
  
  return 1;
};

const calculateAspects = (planets: PlanetData[]): Aspect[] => {
  const aspectsFound: Aspect[] = [];
  const aspectTypes = [
    { name: 'Conjunction', angle: 0, orb: 8, symbol: '☌' },
    { name: 'Opposition', angle: 180, orb: 8, symbol: '☍' },
    { name: 'Trine', angle: 120, orb: 7, symbol: '△' },
    { name: 'Square', angle: 90, orb: 7, symbol: '□' },
    { name: 'Sextile', angle: 60, orb: 5, symbol: '⚹' },
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      let angle = Math.abs(p1.longitude - p2.longitude);
      if (angle > 180) {
        angle = 360 - angle;
      }

      for (const aspect of aspectTypes) {
        const orb = Math.abs(angle - aspect.angle);
        if (orb <= aspect.orb) {
          aspectsFound.push({
            planet1: p1.name,
            planet2: p2.name,
            aspectName: aspect.name,
            aspectSymbol: aspect.symbol,
            orb: orb,
          });
        }
      }
    }
  }
  return aspectsFound.sort((a, b) => a.orb - b.orb);
};


export const calculateNatalChart = async (birthData: BirthData, city: City): Promise<NatalChartData> => {
  const swe = new SwissEph();
  await swe.initSwissEph();

  try {
    const birthDate = new Date(birthData.date);
    const [hour, minute] = birthData.time.split(':').map(Number);
    
    const timezoneOffsetHours = city.timezone;
    const utcHour = hour - timezoneOffsetHours;
    
    const utcDate = new Date(Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate(), utcHour, minute));
    
    const jd_ut = swe.julday(utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(), utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60);

    const lon = city.longitude;
    const lat = city.latitude;

    const houseSystem = 'P'; // Placidus
    const housesData = swe.houses(jd_ut, lat, lon, houseSystem);
    
    if (!housesData) {
        throw new Error("Не удалось рассчитать дома гороскопа.");
    }
    
    const cusps = housesData.cusps;
    const ascmc = housesData.ascmc;

    const planetsToCalc = [
      { id: swe.SE_SUN, name: 'Солнце' },
      { id: swe.SE_MOON, name: 'Луна' },
      { id: swe.SE_MERCURY, name: 'Меркурий' },
      { id: swe.SE_VENUS, name: 'Венера' },
      { id: swe.SE_MARS, name: 'Марс' },
      { id: swe.SE_JUPITER, name: 'Юпитер' },
      { id: swe.SE_SATURN, name: 'Сатурн' },
      { id: swe.SE_URANUS, name: 'Уран' },
      { id: swe.SE_NEPTUNE, name: 'Нептун' },
      { id: swe.SE_PLUTO, name: 'Плутон' },
    ];

    const houseCuspsData: HouseCuspData[] = [];
    for (let i = 1; i <= 12; i++) {
      const cuspLon = cusps[i];
      const signInfo = getSign(cuspLon, swe);
      houseCuspsData.push({
        house: i,
        sign: signInfo.sign,
        degrees: signInfo.degrees,
        longitude: cuspLon,
      });
    }

    const planetRulerships: { [key: string]: number[] } = {};
    planetsToCalc.forEach(p => {
      planetRulerships[p.name] = [];
    });

    houseCuspsData.forEach(cusp => {
      const rulers = SIGN_RULERS[cusp.sign];
      if (rulers) {
        rulers.forEach(ruler => {
          if (planetRulerships[ruler]) {
            planetRulerships[ruler].push(cusp.house);
          }
        });
      }
    });

    const planetsData: PlanetData[] = [];

    for (const planet of planetsToCalc) {
        const pos = swe.calc_ut(jd_ut, planet.id, swe.SEFLG_SWIEPH | swe.SEFLG_SPEED);
        const longitude = pos[0];
        const speed = pos[3];
        
        const signInfo = getSign(longitude, swe);
        
        const house = getHouseForPlanet(longitude, cusps);

        planetsData.push({
            name: planet.name,
            sign: signInfo.sign,
            degrees: signInfo.degrees,
            house: house,
            longitude: longitude,
            speed: speed,
            rulesHouses: planetRulerships[planet.name] || [],
        });
    }

    const ascendantLon = housesData.ascmc[0];
    const ascendantSignInfo = getSign(ascendantLon, swe);

    const aspects = calculateAspects(planetsData);

    const chartData: NatalChartData = {
        planets: planetsData,
        ascendant: {
            sign: ascendantSignInfo.sign,
            degrees: ascendantSignInfo.degrees,
            longitude: ascendantLon,
        },
        houseCusps: houseCuspsData,
        aspects: aspects,
    };

    return chartData;
  } finally {
    swe.close();
  }
};