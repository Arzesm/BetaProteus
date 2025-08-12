export default (SweModule) => ({
  house_pos(armc, geoLat, eps, hsys, xpin) {
    const xpinPtr = SweModule._malloc(2 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.HEAPF64.set(xpin, xpinPtr / 8);
    const housePos = SweModule.ccall(
      'swe_house_pos',
      'number',
      ['number', 'number', 'number', 'number', 'pointer', 'pointer'],
      [armc, geoLat, eps, hsys, xpinPtr, 0]
    );
    SweModule._free(xpinPtr);
    return housePos;
  },

  houses(julianDay, geoLat, geoLon, houseSystem) {
    const cuspsPtr = SweModule._malloc(13 * Float64Array.BYTES_PER_ELEMENT);
    const ascmcPtr = SweModule._malloc(10 * Float64Array.BYTES_PER_ELEMENT);
    const hsysChar = typeof houseSystem === 'string' ? houseSystem.charCodeAt(0) : houseSystem;
    const ret = SweModule.ccall('swe_houses','number',['number', 'number', 'number', 'number', 'pointer', 'pointer'],[julianDay, geoLat, geoLon, hsysChar, cuspsPtr, ascmcPtr]);
    if (ret < 0) { SweModule._free(cuspsPtr); SweModule._free(ascmcPtr); return null; }
    const cusps = Array.from(new Float64Array(SweModule.HEAPF64.buffer, cuspsPtr, 13));
    const ascmc = Array.from(new Float64Array(SweModule.HEAPF64.buffer, ascmcPtr, 10));
    SweModule._free(cuspsPtr); SweModule._free(ascmcPtr);
    return { cusps, ascmc };
  },

  houses_ex(julianDay, iflag, geoLat, geoLon, houseSystem) {
    const cuspsPtr = SweModule._malloc(37 * Float64Array.BYTES_PER_ELEMENT);
    const ascmcPtr = SweModule._malloc(10 * Float64Array.BYTES_PER_ELEMENT);
    const hsysChar = typeof houseSystem === 'string' ? houseSystem.charCodeAt(0) : houseSystem;
    const ret = SweModule.ccall('swe_houses_ex','number',['number', 'number', 'number', 'number', 'number', 'pointer', 'pointer'],[julianDay, iflag, geoLat, geoLon, hsysChar, cuspsPtr, ascmcPtr]);
    if (ret < 0) { SweModule._free(cuspsPtr); SweModule._free(ascmcPtr); return null; }
    const cusps = Array.from(new Float64Array(SweModule.HEAPF64.buffer, cuspsPtr, 37));
    const ascmc = Array.from(new Float64Array(SweModule.HEAPF64.buffer, ascmcPtr, 10));
    SweModule._free(cuspsPtr); SweModule._free(ascmcPtr);
    return { cusps, ascmc };
  },

  houses_ex2(julianDay, iflag, geoLat, geoLon, houseSystem) {
    return this.houses_ex(julianDay, iflag, geoLat, geoLon, houseSystem);
  },

  houses_armc(armc, geoLat, eps, houseSystem) {
    const cuspsPtr = SweModule._malloc(37 * Float64Array.BYTES_PER_ELEMENT);
    const ascmcPtr = SweModule._malloc(10 * Float64Array.BYTES_PER_ELEMENT);
    const hsysChar = typeof houseSystem === 'string' ? houseSystem.charCodeAt(0) : houseSystem;
    const ret = SweModule.ccall('swe_houses_armc','number',['number', 'number', 'number', 'number', 'pointer', 'pointer'],[armc, geoLat, eps, hsysChar, cuspsPtr, ascmcPtr]);
    if (ret < 0) { SweModule._free(cuspsPtr); SweModule._free(ascmcPtr); return null; }
    const cusps = Array.from(new Float64Array(SweModule.HEAPF64.buffer, cuspsPtr, 37));
    const ascmc = Array.from(new Float64Array(SweModule.HEAPF64.buffer, ascmcPtr, 10));
    SweModule._free(cuspsPtr); SweModule._free(ascmcPtr);
    return { cusps, ascmc };
  },

  houses_armc_ex2(armc, geoLat, eps, houseSystem) {
    return this.houses_armc(armc, geoLat, eps, houseSystem);
  },
});