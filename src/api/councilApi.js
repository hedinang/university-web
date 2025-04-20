import BaseApi from "./baseApi";
import { COUNCIL } from "./apiConstant";

class CouncilApi extends BaseApi {
  getCouncilList(param) {
    return this.post(`${COUNCIL}/page`, param);
  }
}
export default CouncilApi;
