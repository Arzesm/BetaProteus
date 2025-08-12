export default (SweModule) => ({
  fixstar(star, julianDay, flags) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = SweModule._malloc(star.length + 1);
    SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = SweModule.ccall(
      'swe_fixstar',
      'number',
      ['pointer', 'number', 'number', 'pointer'],
      [starBuffer, julianDay, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    SweModule._free(starBuffer);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  fixstar_mag(star) {
    const magBuffer = SweModule._malloc(8);
    const starBuffer = SweModule._malloc(star.length + 1);
    SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = SweModule.ccall(
      'swe_fixstar_mag',
      'number',
      ['pointer', 'pointer'],
      [starBuffer, magBuffer]
    );
    const magnitude = SweModule.HEAPF64[magBuffer / 8];
    SweModule._free(starBuffer);
    SweModule._free(magBuffer);
    return retFlag < 0 ? null : magnitude;
  },

  fixstar2(star, julianDay, flags) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = SweModule._malloc(star.length + 1);
    SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = SweModule.ccall(
      'swe_fixstar2',
      'number',
      ['pointer', 'number', 'number', 'pointer'],
      [starBuffer, julianDay, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    SweModule._free(starBuffer);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  fixstar2_ut(star, julianDay, flags) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const starBuffer = SweModule._malloc(star.length + 1);
    SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = SweModule.ccall(
      'swe_fixstar2_ut',
      'number',
      ['pointer', 'number', 'number', 'pointer'],
      [starBuffer, julianDay, flags, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    SweModule._free(starBuffer);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  fixstar2_mag(star) {
    const magBuffer = SweModule._malloc(8);
    const starBuffer = SweModule._malloc(star.length + 1);
    SweModule.stringToUTF8(star, starBuffer, star.length + 1);
    const retFlag = SweModule.ccall(
      'swe_fixstar2_mag',
      'number',
      ['pointer', 'pointer'],
      [starBuffer, magBuffer]
    );
    const magnitude = SweModule.HEAPF64[magBuffer / 8];
    SweModule._free(starBuffer);
    SweModule._free(magBuffer);
    return retFlag < 0 ? null : magnitude;
  },
});