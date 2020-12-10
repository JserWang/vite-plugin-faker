interface ResponseData<T> {
  code: number;
  msg: string;
  data: T;
}

class Request {
  get<T>(url: string, params?: Record<string, any>, opts?: Record<string, any>) {
    return new Promise<ResponseData<T>>((resolve) => {
      resolve();
    });
  }
}

export default new Request();
