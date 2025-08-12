export default (SweModule) => ({
  julday(year, month, day, hour) {
    return SweModule.ccall('swe_julday', 'number', ['number', 'number', 'number', 'number', 'number'], [year, month, day, hour, 1]);
  },

  deltat(julianDay) {
    return SweModule.ccall('swe_deltat', 'number', ['number'], [julianDay]);
  },

  time_equ(julianDay) {
    return SweModule.ccall('swe_time_equ', 'number', ['number'], [julianDay]);
  },

  sidtime0(julianDay, eps, nut) {
    return SweModule.ccall('swe_sidtime0', 'number', ['number', 'number', 'number'], [julianDay, eps, nut]);
  },

  sidtime(julianDay) {
    return SweModule.ccall('swe_sidtime', 'number', ['number'], [julianDay]);
  },

  date_conversion(year, month, day, hour, gregflag) {
    const julianDay = SweModule.ccall(
      'swe_date_conversion',
      'number',
      ['number', 'number', 'number', 'number', 'number'],
      [year, month, day, hour, gregflag]
    );
    return julianDay;
  },

  revjul(julianDay, gregflag) {
    const buffer = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.ccall(
      'swe_revjul',
      'void',
      ['number', 'number', 'pointer'],
      [julianDay, gregflag, buffer]
    );
    const result = new Float64Array(SweModule.HEAPF64.buffer, buffer, 4);
    SweModule._free(buffer);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
    };
  },

  utc_to_jd(year, month, day, hour, minute, second, gregflag) {
    const resultPtr = SweModule._malloc(2 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.ccall(
      'swe_utc_to_jd',
      'void',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [year, month, day, hour, minute, second, gregflag, resultPtr]
    );
    const result = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 2);
    SweModule._free(resultPtr);
    return {
      julianDayET: result[0],
      julianDayUT: result[1],
    };
  },

  jdet_to_utc(julianDay, gregflag) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.ccall(
      'swe_jdet_to_utc',
      'void',
      ['number', 'number', 'pointer'],
      [julianDay, gregflag, resultPtr]
    );
    const result = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    SweModule._free(resultPtr);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
      minute: result[4],
      second: result[5],
    };
  },

  jdut1_to_utc(julianDay, gregflag) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.ccall(
      'swe_jdut1_to_utc',
      'void',
      ['number', 'number', 'pointer'],
      [julianDay, gregflag, resultPtr]
    );
    const result = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    SweModule._free(resultPtr);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
      minute: result[4],
      second: result[5],
    };
  },

  utc_time_zone(year, month, day, hour, minute, second, timezone) {
    const resultPtr = SweModule._malloc(6 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.ccall(
      'swe_utc_time_zone',
      'void',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [year, month, day, hour, minute, second, timezone, resultPtr]
    );
    const result = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 6);
    SweModule._free(resultPtr);
    return {
      year: result[0],
      month: result[1],
      day: result[2],
      hour: result[3],
      minute: result[4],
      second: result[5],
    };
  },

  day_of_week(julianDay) {
    return SweModule.ccall('swe_day_of_week', 'number', ['number'], [julianDay]);
  },
});