import SwissEph from '../../swisseph-wasm-main/src/swisseph.js';
import type { BirthData } from '@/components/astrology/BirthDataForm';
import { City } from '@/data/cities';

// Ensure Emscripten loader can resolve WASM/data files from public/ in dev/prod (Vercel)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
(globalThis as any).Module = (globalThis as any).Module || {};
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
(globalThis as any).Module.locateFile = (path: string, prefix: string) => {
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  // Always return paths from /public directory (no hashing)
  if (path.endsWith('.wasm') || path.includes('swisseph.wasm')) {
    return '/swisseph.wasm';
  }
  if (path.endsWith('.data') || path.includes('swisseph.data')) {
    return '/swisseph.data';
  }
  return `${prefix}${path}`;
};

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
  isNode?: boolean;
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

export interface ChartConfiguration {
  name: string;
  type: 'grand_trine' | 't_square' | 'grand_cross' | 'yod' | 'kite' | 'stellium';
  participants: string[];
  description: string;
}

export interface NatalChartData {
  planets: PlanetData[];
  ascendant: { sign: string; degrees: number; longitude: number };
  houseCusps: HouseCuspData[];
  aspects: Aspect[];
  nodes: {
    north: PlanetData;
    south: PlanetData;
  };
  configurations: ChartConfiguration[];
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


const calculateConfigurations = (planets: PlanetData[], aspects: Aspect[]): ChartConfiguration[] => {
  const configurations: ChartConfiguration[] = [];

  const getAspect = (a: string, b: string) => aspects.find(aspect =>
    (aspect.planet1 === a && aspect.planet2 === b) ||
    (aspect.planet1 === b && aspect.planet2 === a)
  );

  const isAspectType = (a: string, b: string, type: string, maxOrb: number) => {
    const aspect = getAspect(a, b);
    if (!aspect) return false;
    return aspect.aspectName.toLowerCase() === type && aspect.orb <= maxOrb;
  };

  // Grand Trine (three mutual trines)
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const a = planets[i].name;
        const b = planets[j].name;
        const c = planets[k].name;
        if (planets[i].isNode || planets[j].isNode || planets[k].isNode) continue;
        if (isAspectType(a, b, 'trine', 6) && isAspectType(a, c, 'trine', 6) && isAspectType(b, c, 'trine', 6)) {
          configurations.push({
            name: 'Большой тригон',
            type: 'grand_trine',
            participants: [a, b, c],
            description: 'Три планеты образуют равносторонний треугольник, обеспечивая естественный поток талантов и поддержки.',
          });
        }
      }
    }
  }

  // T-Square (opposition plus two squares to a focal planet)
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const a = planets[i];
      const b = planets[j];
      if (a.isNode || b.isNode) continue;
      const opposition = getAspect(a.name, b.name);
      if (!opposition || opposition.aspectName.toLowerCase() !== 'opposition' || opposition.orb > 6) continue;

      for (let k = 0; k < planets.length; k++) {
        const apex = planets[k];
        if (apex.name === a.name || apex.name === b.name || apex.isNode) continue;
        if (isAspectType(apex.name, a.name, 'square', 5) && isAspectType(apex.name, b.name, 'square', 5)) {
          configurations.push({
            name: 'Тау-квадрат',
            type: 't_square',
            participants: [a.name, apex.name, b.name],
            description: 'Две планеты в оппозиции, обе образуют квадрат с третьей, создавая зону напряжения и возможностей роста.',
          });
        }
      }
    }
  }

  // Stellium (3+ planets in same house)
  const houseMap = new Map<number, PlanetData[]>();
  for (const planet of planets) {
    if (planet.isNode) continue;
    const list = houseMap.get(planet.house) || [];
    list.push(planet);
    houseMap.set(planet.house, list);
  }

  for (const [house, list] of houseMap.entries()) {
    if (list.length >= 3) {
      configurations.push({
        name: `Стеллиум в ${house} доме`,
        type: 'stellium',
        participants: list.map(p => p.name),
        description: 'Три и более планеты в одном доме усиливают влияние этой сферы жизни и требуют осознанного управления.',
      });
    }
  }

  return configurations;
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

    // Calculate nodes
    const northNodePos = swe.calc_ut(jd_ut, swe.SE_TRUE_NODE, swe.SEFLG_SWIEPH | swe.SEFLG_SPEED);
    const northLongitude = northNodePos[0];
    const northNodeSign = getSign(northLongitude, swe);
    const northHouse = getHouseForPlanet(northLongitude, cusps);
    const northNode: PlanetData = {
      name: 'Северный узел',
      sign: northNodeSign.sign,
      degrees: northNodeSign.degrees,
      house: northHouse,
      longitude: northLongitude,
      speed: northNodePos[3],
      rulesHouses: [],
      isNode: true,
    };

    const southLongitude = swe.degnorm(northLongitude + 180);
    const southNodeSign = getSign(southLongitude, swe);
    const southHouse = getHouseForPlanet(southLongitude, cusps);
    const southNode: PlanetData = {
      name: 'Южный узел',
      sign: southNodeSign.sign,
      degrees: southNodeSign.degrees,
      house: southHouse,
      longitude: southLongitude,
      speed: northNodePos[3] * -1,
      rulesHouses: [],
      isNode: true,
    };

    const bodiesForAspects = [...planetsData, northNode, southNode];
    const aspects = calculateAspects(bodiesForAspects);
    const configurations = calculateConfigurations(bodiesForAspects, aspects);

    const chartData: NatalChartData = {
        planets: planetsData,
        ascendant: {
            sign: ascendantSignInfo.sign,
            degrees: ascendantSignInfo.degrees,
            longitude: ascendantLon,
        },
        houseCusps: houseCuspsData,
        aspects: aspects,
        nodes: {
          north: northNode,
          south: southNode,
        },
        configurations,
    };

    return chartData;
  } finally {
    swe.close();
  }
};