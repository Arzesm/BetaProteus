export default (SweModule) => ({
  calc_ut(julianDay, body, flags) {
    const buffer = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT); // Allocate space for 6 doubles
    const errorBuffer = SweModule._malloc(256);
    const retFlag = SweModule.ccall('swe_calc_ut', 'number', ['number', 'number', 'number', 'pointer', 'pointer'], [julianDay, body, flags, buffer, errorBuffer]);
    
    if (retFlag < 0) {
      const error = SweModule.UTF8ToString(errorBuffer);
      SweModule._free(buffer);
      SweModule._free(errorBuffer);
      throw new Error(`Error in swe_calc_ut: ${error}`);
    }

    // Create a new array with the first 4 values to avoid issues after freeing the buffer
    const result = new Float64Array(SweModule.HEAPF64.buffer, buffer, 4).slice(); 
    
    SweModule._free(buffer);
    SweModule._free(errorBuffer);
    
    return result;
  },

  calc(julianDay, body, flags) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    const errorBuffer = SweModule._malloc(256);
    const retFlag = SweModule.ccall(
      'swe_calc',
      'number',
      ['number', 'number', 'number', 'pointer', 'pointer'],
      [julianDay, body, flags, resultPtr, errorBuffer]
    );
    if (retFlag < 0) {
      const error = SweModule.UTF8ToString(errorBuffer);
      SweModule._free(resultPtr);
      SweModule._free(errorBuffer);
      throw new Error(`Error in swe_calc: ${error}`);
    }
    // Read the data from memory BEFORE freeing it
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    const finalResult = {
      longitude: results[0],
      latitude: results[1],
      distance: results[2],
      longitudeSpeed: results[3],
      latitudeSpeed: results[4],
      distanceSpeed: results[5],
    };
    // Now free the memory
    SweModule._free(resultPtr);
    SweModule._free(errorBuffer);
    return finalResult;
  },

  get_planet_name(planetId) {
    return SweModule.ccall(
      'swe_get_planet_name',
      'string',
      ['number'],
      [planetId]
    );
  },

  nod_aps(julianDay, planet, flags, method) {
    return SweModule.ccall(
      'swe_nod_aps',
      'number',
      ['number', 'number', 'number', 'number'],
      [julianDay, planet, flags, method]
    );
  },

  nod_aps_ut(julianDay, planet, flags, method) {
    return SweModule.ccall(
      'swe_nod_aps_ut',
      'number',
      ['number', 'number', 'number', 'number'],
      [julianDay, planet, flags, method]
    );
  },

  get_orbital_elements(julianDay, planet, flags) {
    return SweModule.ccall(
      'swe_get_orbital_elements',
      'number',
      ['number', 'number', 'number'],
      [julianDay, planet, flags]
    );
  },

  orbit_max_min_true_distance(julianDay, planet, flags) {
    return SweModule.ccall(
      'swe_orbit_max_min_true_distance',
      'number',
      ['number', 'number', 'number'],
      [julianDay, planet, flags]
    );
  },
});