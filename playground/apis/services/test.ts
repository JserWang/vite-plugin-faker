import Request from '../../utils/Request';
import type { MResult } from '../models/test';

class PlayGroundService {
  private api = {
    normal: '/api/normal',
    array: '/api/array',
    void: '/api/void',
    withIf: '/api/withIf',
    withIfElseIf: '/api/withIfElseIf',
    withIfElse: '/api/withIfElse',
  };

  normal(phone: string) {
    return Request.get<MResult>(this.api.normal, { phone });
  }

  array() {
    return Request.get<MResult[]>(this.api.array);
  }

  /**
   * such as common logout
   */
  void() {
    const a = 1;
    Request.get<MResult>(this.api.void);
  }

  useString() {
    return Request.get<MResult>('/user/string');
  }

  withIf() {
    if (1 === 1) {
      Request.get<MResult>(this.api.withIf);
    } else if (2 === 2) {
      Request.get<MResult>(this.api.withIfElseIf);
    } else {
      Request.get<MResult>(this.api.withIfElse);
    }
  }
}

export default new PlayGroundService();
