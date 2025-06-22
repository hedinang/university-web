import BaseApi from "./baseApi";
import { SEEN } from "./apiConstant";

class SeenApi extends BaseApi {
  resetUnread(param) {
    return this.post(`${SEEN}/reset-unread`, param);
  }
}
export default SeenApi;
