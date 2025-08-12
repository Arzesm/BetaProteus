export default (SweModule) => ({
  sol_eclipse_where(julianDay, flags) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_sol_eclipse_where',
      'number',
      ['number', 'number', 'pointer'],
      [julianDay, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  lun_occult_where(julianDay, planet, starName, flags) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = SweModule._malloc(starName.length + 1);
    SweModule.stringToUTF8(starName, starBuffer, starName.length + 1);
    const retFlag = SweModule.ccall(
      'swe_lun_occult_where',
      'number',
      ['number', 'number', 'pointer', 'number', 'pointer'],
      [julianDay, planet, starBuffer, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(starBuffer);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  sol_eclipse_how(julianDay, flags, longitude, latitude, altitude) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_sol_eclipse_how',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, flags, longitude, latitude, altitude, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  sol_eclipse_when_loc(julianDayStart, flags, longitude, latitude, altitude, backward) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_sol_eclipse_when_loc',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, longitude, latitude, altitude, backward, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  lun_occult_when_loc(julianDayStart, planet, starName, flags, longitude, latitude, altitude, backward) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = SweModule._malloc(starName.length + 1);
    SweModule.stringToUTF8(starName, starBuffer, starName.length + 1);
    const retFlag = SweModule.ccall(
      'swe_lun_occult_when_loc',
      'number',
      ['number', 'number', 'pointer', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, planet, starBuffer, flags, longitude, latitude, altitude, backward, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(starBuffer);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  sol_eclipse_when_glob(julianDayStart, flags, eclipseType, backward) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_sol_eclipse_when_glob',
      'number',
      ['number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, eclipseType, backward, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  lun_occult_when_glob(julianDayStart, planet, starName, flags, eclipseType, backward) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = SweModule._malloc(starName.length + 1);
    SweModule.stringToUTF8(starName, starBuffer, starName.length + 1);
    const retFlag = SweModule.ccall(
      'swe_lun_occult_when_glob',
      'number',
      ['number', 'number', 'pointer', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, planet, starBuffer, flags, eclipseType, backward, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(starBuffer);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  lun_eclipse_how(julianDay, flags, longitude, latitude, altitude) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_lun_eclipse_how',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, flags, longitude, latitude, altitude, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  lun_eclipse_when(julianDayStart, flags, eclipseType, backward) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_lun_eclipse_when',
      'number',
      ['number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, eclipseType, backward, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  lun_eclipse_when_loc(julianDayStart, flags, longitude, latitude, altitude, backward) {
    const resultPtr = SweModule._malloc(8 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_lun_eclipse_when_loc',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDayStart, flags, longitude, latitude, altitude, backward, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 8);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },
});