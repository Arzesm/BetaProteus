export default (SweModule) => ({
  set_ephe_path(path) {
    return SweModule.ccall('swe_set_ephe_path', 'string', ['string'], [path]);
  },

  set_jpl_file(filename) {
    const fileBuffer = SweModule._malloc(filename.length + 1);
    SweModule.stringToUTF8(filename, fileBuffer, filename.length + 1);
    const result = SweModule.ccall(
      'swe_set_jpl_file',
      'string',
      ['pointer'],
      [fileBuffer]
    );
    SweModule._free(fileBuffer);
    return result;
  },

  set_topo(longitude, latitude, altitude) {
    SweModule.ccall(
      'swe_set_topo',
      'void',
      ['number', 'number', 'number'],
      [longitude, latitude, altitude]
    );
  },

  set_sid_mode(sidMode, t0, ayanT0) {
    SweModule.ccall(
      'swe_set_sid_mode',
      'void',
      ['number', 'number', 'number'],
      [sidMode, t0, ayanT0]
    );
  },

  get_ayanamsa(julianDay) {
    return SweModule.ccall(
      'swe_get_ayanamsa',
      'number',
      ['number'],
      [julianDay]
    );
  },

  get_ayanamsa_ut(julianDay) {
    return SweModule.ccall(
      'swe_get_ayanamsa_ut',
      'number',
      ['number'],
      [julianDay]
    );
  },

  get_ayanamsa_ex(julianDay, ephemerisFlag) {
    const resultPtr = SweModule._malloc(8);
    const retFlag = SweModule.ccall(
      'swe_get_ayanamsa_ex',
      'number',
      ['number', 'number', 'pointer'],
      [julianDay, ephemerisFlag, resultPtr]
    );
    const result = SweModule.HEAPF64[resultPtr / 8];
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : result;
  },

  get_ayanamsa_ex_ut(julianDay, ephemerisFlag) {
    const resultPtr = SweModule._malloc(8);
    const retFlag = SweModule.ccall(
      'swe_get_ayanamsa_ex_ut',
      'number',
      ['number', 'number', 'pointer'],
      [julianDay, ephemerisFlag, resultPtr]
    );
    const result = SweModule.HEAPF64[resultPtr / 8];
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : result;
  },

  get_ayanamsa_name(siderealMode) {
    return SweModule.ccall(
      'swe_get_ayanamsa_name',
      'string',
      ['number'],
      [siderealMode]
    );
  },
});