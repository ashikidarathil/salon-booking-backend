export interface ISmsService {
  sendSms(params: { to: string; message: string }): Promise<void>;
}
