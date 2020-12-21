declare type CallbackType = (...args: any) => void;

class EventHub {
  private list: Record<string, Array<CallbackType>>;

  constructor() {
    this.list = {};
  }

  pub(eventName: string, ...args: any) {
    const events = this.list[eventName];
    events.forEach((cb) => {
      cb(...args);
    });
  }

  sub(eventName: string, callback: CallbackType) {
    const events = this.list[eventName] || [];
    events.push(callback);
    this.list[eventName] = events;
  }
}

export const eventHub = new EventHub();
