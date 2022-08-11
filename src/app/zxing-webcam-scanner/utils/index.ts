export enum CharSetPrefix {
  ST00011 = "ST00011",
  ST00012 = "ST00012",
  ST00013 = "ST00013",
}

export const invalidCharReg = new RegExp("[^ -~ ©«­®»ЁА-яё№]");
export const NSPKValidReg = new RegExp("https://qr.nspk.ru/.*$");
export const koi8rValidReg = new RegExp("[^а-яёА-ЯЁ][а-яё][А-ЯЁ]");

export const isNSPKValid = (text: string): RegExpMatchArray =>
  text.match(NSPKValidReg);
export const hasInvalidСharacters = (text: string): RegExpMatchArray =>
  text.match(invalidCharReg);
export const hasInvalidkoi8r = (text: string): RegExpMatchArray =>
  text.match(koi8rValidReg);

export enum CHEKING_STATUS {
  NSPK_OK = "NSPK_OK",
  INVALID_ERR = "INVALID_ERR",
  KOI8R_ERR = "KOI8R_ERR",
  GOST_OK = "GOST_OK",
}

/**
 * Если 2D имеет структуру, похожую на ГОСТ (начинается с ST0001..),
 * то вертикальным разделителем является символ на 7ой позиции,
 * начиная с 0, т.к. на практике некоторые коды содержат
 * вертикальный разделитель, отличный от "|".
 */
const GOST_SEPARATOR_INDEX = 7;

const reduceKeyValueBySeparator =
  (separator: string) =>
  (acc, keyValue): any => {
    const separetIndex = keyValue.indexOf(separator);
    const key = keyValue.slice(0, separetIndex);
    const value = keyValue.slice(separetIndex + 1);
    return { ...acc, [key?.trim()]: value?.trim() };
  };

const getSeparator = (text, separatorIndex = GOST_SEPARATOR_INDEX): string => {
  return text[separatorIndex] === " "
    ? getSeparator(text, separatorIndex + 1)
    : text[separatorIndex];
};

export function chekingCharsetStatus(text: string): CHEKING_STATUS {
  if (isNSPKValid(text)) {
    return CHEKING_STATUS.NSPK_OK;
  }
  if (hasInvalidСharacters(text)) {
    return CHEKING_STATUS.INVALID_ERR;
  }
  if (hasInvalidkoi8r(text)) {
    return CHEKING_STATUS.KOI8R_ERR;
  }
  return CHEKING_STATUS.GOST_OK;
}

export function stQrTextToJSON(text: string): any {
  const result = {
    RawQr: text,
  };
  let propertySeparator = "|";
  const keyValueSeparator = "=";
  const stMatch = (text: string): RegExpMatchArray => text.match(/(ST000\d\d)/);

  const stMatchResult = stMatch(text);
  if (stMatchResult === null) {
    return text;
  }
  propertySeparator = getSeparator(text);
  const [_, ...splited] = text.split(propertySeparator);
  return splited.reduce(reduceKeyValueBySeparator(keyValueSeparator), result);
}
 