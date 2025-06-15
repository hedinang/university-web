import BaseApi from "./baseApi";
import { TOPIC } from "./apiConstant";

class TopicApi extends BaseApi {
  getTopicList(param) {
    return this.post(`${TOPIC}/page`, param);
  }

  storeTopic(param) {
    return this.post(`${TOPIC}/store`, param);
  }
}
export default TopicApi;
