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
        return qrCodeParams
    }
}
@Injectable({
    providedIn: 'root',
  })
export class OperationRunService {
    _launchedQRCodeParams: any
    getTaunchedQRCodeParams() {
        return this._launchedQRCodeParams
    }
    set launchedQRCodeParams(params) {
        this._launchedQRCodeParams = params
    }
    startOperationByScenarioResultInline(params) {
        this.launchedQRCodeParams = params
        console.log('operation launch with', params)
    }
}

