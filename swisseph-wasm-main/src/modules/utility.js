export default (SweModule) => ({
  cotrans(xpo, eps) {
    return SweModule.ccall('swe_cotrans', 'void', ['array', 'number'], [xpo, eps]);
  },

  cotrans_sp(xpo, eps) {
    return SweModule.ccall('swe_cotrans_sp', 'void', ['array', 'number'], [xpo, eps]);
  },

  get_tid_acc() {
    return SweModule.ccall('swe_get_tid_acc', 'number', [], []);
  },

  set_tid_acc(acceleration) {
    SweModule.ccall('swe_set_tid_acc', 'void', ['number'], [acceleration]);
  },

  degnorm(x) {
    return SweModule.ccall('swe_degnorm', 'number', ['number'], [x]);
  },

  radnorm(x) {
    return SweModule.ccall('swe_radnorm', 'number', ['number'], [x]);
  },

  rad_midp(x1, x2) {
    return SweModule.ccall('swe_rad_midp', 'number', ['number', 'number'], [x1, x2]);
  },

  deg_midp(x1, x2) {
    return SweModule.ccall('swe_deg_midp', 'number', ['number', 'number'], [x1, x2]);
  },

  split_deg(ddeg, roundFlag) {
    const resultPtr = SweModule._malloc(5 * Float64Array.BYTES_PER_ELEMENT);
    SweModule.ccall('swe_split_deg', 'void', ['number', 'number', 'pointer'], [ddeg, roundFlag, resultPtr]);
    const result = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 5);
    SweModule._free(resultPtr);
    return {
      degree: result[0],
      min: result[1],
      second: result[2],
      fraction: result[3],
      sign: result[4],
    };
  },

  csnorm(p) {
    return SweModule.ccall('swe_csnorm', 'number', ['number'], [p]);
  },

  difcsn(p1, p2) {
    return SweModule.ccall('swe_difcsn', 'number', ['number', 'number'], [p1, p2]);
  },

  difdegn(p1, p2) {
    return SweModule.ccall('swe_difdegn', 'number', ['number', 'number'], [p1, p2]);
  },

  difcs2n(p1, p2) {
    return SweModule.ccall('swe_difcs2n', 'number', ['number', 'number'], [p1, p2]);
  },

  difdeg2n(p1, p2) {
    return SweModule.ccall('swe_difdeg2n', 'number', ['number', 'number'], [p1, p2]);
  },

  difrad2n(p1, p2) {
    return SweModule.ccall('swe_difrad2n', 'number', ['number', 'number'], [p1, p2]);
  },

  csroundsec(x) {
    return SweModule.ccall('swe_csroundsec', 'number', ['number'], [x]);
  },

  d2l(x) {
    return SweModule.ccall('swe_d2l', 'number', ['number'], [x]);
  },

  cs2timestr(t, sep, suppressZero) {
    return SweModule.ccall('swe_cs2timestr', 'string', ['number', 'number', 'number'], [t, sep, suppressZero]);
  },

  cs2lonlatstr(t, pChar, mChar) {
    return SweModule.ccall('swe_cs2lonlatstr', 'string', ['number', 'string', 'string'], [t, pChar, mChar]);
  },

  cs2degstr(t) {
    return SweModule.ccall('swe_cs2degstr', 'string', ['number'], [t]);
  },

  refrac(julianDay, geoLat, geoLon, altitude, pressure, temperature) {
    const resultPtr = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_refrac',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, pressure, temperature, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 4);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  refrac_extended(julianDay, geoLat, geoLon, altitude, pressure, temperature, distance) {
    const resultPtr = SweModule._malloc(4 * Float64Array.BYTES_PER_ELEMENT);
    const retFlag = SweModule.ccall(
      'swe_refrac_extended',
      'number',
      ['number', 'number', 'number', 'number', 'number', 'number', 'number', 'pointer'],
      [julianDay, geoLat, geoLon, altitude, pressure, temperature, distance, resultPtr]
    );
    const results = new Float64Array(SweModule.HEAPF64.buffer, resultPtr, 4);
    SweModule._free(resultPtr);
    return retFlag < 0 ? null : results;
  },

  set_lapse_rate(lapseRate) {
    SweModule.ccall(
      'swe_set_lapse_rate',
      'void',
      ['number'],
      [lapseRate]
    );
  },

  version() {
    return SweModule.ccall('swe_version', 'string', [], []);
  },
});