class Request {
  get<T>(url: string, params?: Record<string, any>, opts?: Record<string, any>) {
    return new Promise<T>((resolve) => {
      resolve();
    });
  }
}

export default new Request();
