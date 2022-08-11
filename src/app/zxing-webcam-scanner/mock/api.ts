export interface IQrCodeParam {
    readonly key: string;
    readonly value: string;
}

export class WikiPayApiService {
    wikiPayLaunchRoublePaymentOperationByQr2(qrCodeParams: IQrCodeParam[]) {
        console.trace(qrCodeParams)
    }
}

export class OperationRunService {
    startOperationByScenarioResultModal(params) {

    }
}
