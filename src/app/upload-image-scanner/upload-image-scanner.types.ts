enum UploadImageScannerEventsType {
    UPLOAD_IMAGE = "UPLOAD_IMAGE",
    DECODE_SUCCESS = "DECODE_SUCCESS",
}

type UploadImageScannerEvents = {
    type: UploadImageScannerEventsType,
    payload: any
}
