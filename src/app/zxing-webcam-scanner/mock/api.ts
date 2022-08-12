import { Injectable, NgModule } from "@angular/core";

export interface IQrCodeParam {
    readonly key: string;
    readonly value: string;
}
@Injectable({
    providedIn: 'root',
  })
export class WikiPayApiService {
    wikiPayLaunchRoublePaymentOperationByQr2(qrCodeParams: IQrCodeParam[]) {
        console.log(qrCodeParams)
    }
}
@Injectable({
    providedIn: 'root',
  })
export class OperationRunService {
    startOperationByScenarioResultModal(params) {

    }
}

