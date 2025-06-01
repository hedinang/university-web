import BaseApi from "./baseApi";
import { COUNCIL } from "./apiConstant";

class CouncilApi extends BaseApi {
  getCouncilList(param) {
    return this.post(`${COUNCIL}/page`, param);
  }

  storeCouncil(param){
    return this.post(`${COUNCIL}/store`, param);
  }
}
export default CouncilApi;
