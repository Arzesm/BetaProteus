export default (SweModule) => ({
  pheno(julianDay, planet, flags) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_pheno',
      'number',
      ['number', 'number', 'number', 'pointer'],
      [julianDay, planet, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  pheno_ut(julianDay, planet, flags) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_pheno_ut',
      'number',
      ['number', 'number', 'number', 'pointer'],
      [julianDay, planet, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  azal(julianDay, geoLat, geoLon, altitude, planet) {
    const resultPtr = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_azalt',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, planet, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 4);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  azal_rev(julianDay, geoLat, geoLon, altitude, planet) {
    const resultPtr = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_azalt_rev',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, planet, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 4);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  rise_trans(julianDay, planet, longitude, latitude, altitude, flags) {
    const resultPtr = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_rise_trans',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, planet, longitude, latitude, altitude, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 4);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  rise_trans_true_hor(julianDay, planet, longitude, latitude, altitude, flags) {
    const resultPtr = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_rise_trans_true_hor',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, planet, longitude, latitude, altitude, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 4);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  heliacal_ut(julianDayStart, geoPos, atmosData, observerData, objectName, eventType, flags) {
    return SweModule.ccall(
      'swe_heliacal_ut',
      'number',
      ['number', 'array', 'array', 'array', 'string', 'number', 'number'],
      [julianDayStart, geoPos, atmosData, observerData, objectName, eventType, flags]
    );
  },

  heliacal_pheno_ut(julianDay, geoPos, atmosData, observerData, objectName, eventType, heliacalFlag) {
    return SweModule.ccall(
      'swe_heliacal_pheno_ut',
      'number',
      ['number', 'array', 'array', 'array', 'string', 'number', 'number'],
      [julianDay, geoPos, atmosData, observerData, objectName, eventType, heliacalFlag]
    );
  },

  vis_limit_mag(julianDay, geoPos, atmosData, observerData, objectName, heliacalFlag) {
    return SweModule.ccall(
      'swe_vis_limit_mag',
      'number',
      ['number', 'array', 'array', 'array', 'string', 'number'],
      [julianDay, geoPos, atmosData, observerData, objectName, heliacalFlag]
    );
  },
});