import BaseApi from "./baseApi";
import { SPONSORSHIP } from "./apiConstant";

class SponsorshipApi extends BaseApi {
  getSponsorshipList(param) {
    return this.post(`${SPONSORSHIP}/page`, param);
  }

  storeSponsorship(param) {
    return this.post(`${SPONSORSHIP}/store`, param);
  }
}
export default SponsorshipApi;
