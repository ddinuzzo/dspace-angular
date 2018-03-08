import { NotificationAnimationsType } from './notification-animations-type';

export interface INotificationOptions {
  timeOut: number;
  clickToClose: boolean;
  animate: NotificationAnimationsType;
}

export class NotificationOptions implements INotificationOptions {
  public timeOut: number;
  public clickToClose: boolean;
  public animate: any;

  constructor(timeOut = 0,
              clickToClose = true,
              animate = NotificationAnimationsType.Scale) {

    this.timeOut = timeOut;
    this.clickToClose = clickToClose;
    this.animate = animate;
  }
}