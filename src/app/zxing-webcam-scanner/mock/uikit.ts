export const ALERTING_CONTEXT = 'ALERTING_CONTEXT'


export class AlertingService {
    error(context:string, error:string) {
        console.warn(error)
    }
}