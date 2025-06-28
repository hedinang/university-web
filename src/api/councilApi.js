import { COUNCIL } from "./apiConstant";
import BaseApi from "./baseApi";

class CouncilApi extends BaseApi {
  getCouncilList(param) {
    return this.post(`${COUNCIL}/page`, param);
  }

  getAll(param) {
    return this.post(`${COUNCIL}/all`, param);
  }

  storeCouncil(param) {
    return this.post(`${COUNCIL}/store`, param);
  }
}
export default CouncilApi;
