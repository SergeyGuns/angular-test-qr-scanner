// ГОСТ Р 56042-2014
export enum CharSetPrefix {
    ST00011 = "ST00011",
    ST00012 = "ST00012",
    ST00013 = "ST00013",
  }

export class CHAR_SET_PREFIX_MATCH_ENCODER  {
    [CharSetPrefix.ST00011]: "Cp1251"
    [CharSetPrefix.ST00012]: "UTF8"
    [CharSetPrefix.ST00013]: "KOI8_R"
  };
