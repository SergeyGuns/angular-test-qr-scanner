// ГОСТ Р 56042-2014
export enum CharSetPrefix {
    ST00011 = "ST00011",
    ST00012 = "ST00012",
    ST00013 = "ST00013",
};

export const invalidCharReg = new RegExp('[^ -~ ©«­®»ЁА-яё]')
export const NSPKValidReg = new RegExp('https\:\/\/qr\.nspk\.ru\/.*$')
export const koi8rValidReg = new RegExp('[^а-яёА-ЯЁ][а-яё][А-ЯЁ]')

export const isNSPKValid = text =>  text.match(NSPKValidReg)
export const hasInvalidСharacters = text => text.match(invalidCharReg)
export const hasInvalidkoi8r = text => text.match(koi8rValidReg)



export enum CHEKING_STATUS {
  NSPK_OK='NSPK_OK',
  INVALID_ERR='INVALID_ERR',
  KOI8R_ERR='KOI8R_ERR',
  GOST_OK='GOST_OK',
}



export function chekingCharSet(text:string) {
  if(isNSPKValid(text)) {
    return CHEKING_STATUS.NSPK_OK
  }
  if(hasInvalidСharacters(text)) {
    return CHEKING_STATUS.INVALID_ERR
  }
  if(hasInvalidkoi8r(text)) {
    return CHEKING_STATUS.KOI8R_ERR
  }
  return CHEKING_STATUS.GOST_OK
}
