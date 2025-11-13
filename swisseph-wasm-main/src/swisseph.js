/**
 * Swiss Ephemeris WebAssembly Library
 *
 * A high-precision astronomical calculation library for JavaScript,
 * compiled from the renowned Swiss Ephemeris C library to WebAssembly.
 *
 * @author prolaxu
 * @version 0.0.3
 * @license GPL-3.0-or-later
 */

import WasamSwissEph from '../wsam/swisseph.js';
import * as constants from './modules/constants.js';
import createConfigModule from './modules/config.js';
import createEclipsesModule from './modules/eclipses.js';
import createHousesModule from './modules/houses.js';
import createPhenomenaModule from './modules/phenomena.js';
import createPlanetsModule from './modules/planets.js';
import createStarsModule from './modules/stars.js';
import createTimeModule from './modules/time.js';
import createUtilityModule from './modules/utility.js';

class SwissEph {
  constructor() {
    Object.assign(this, constants);
  }
  
  async initSwissEph() {
    // Pass window.Module to Emscripten so our locateFile is used
    const moduleConfig = typeof window !== 'undefined' && window.Module ? window.Module : {};
    console.log('📦 Passing Module config to WasamSwissEph:', moduleConfig);
    this.SweModule = await WasamSwissEph(moduleConfig);
    
    const config = createConfigModule(this.SweModule);
    const eclipses = createEclipsesModule(this.SweModule);
    const houses = createHousesModule(this.SweModule);
    const phenomena = createPhenomenaModule(this.SweModule);
    const planets = createPlanetsModule(this.SweModule);
    const stars = createStarsModule(this.SweModule);
    const time = createTimeModule(this.SweModule);
    const utility = createUtilityModule(this.SweModule);

    Object.assign(
      this,
      config,
      eclipses,
      houses,
      phenomena,
      planets,
      stars,
      time,
      utility
    );

    this.set_ephe_path('sweph');
  }

  close() {
    this.SweModule.ccall('swe_close', 'void', [], []);
  }
}

export default SwissEph;