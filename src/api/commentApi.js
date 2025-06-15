import BaseApi from "./baseApi";
import { COMMENT } from "./apiConstant";

class CommentApi extends BaseApi {
  getCommentList(param) {
    return this.post(`${COMMENT}/page`, param);
  }

  storeComment(param) {
    return this.post(`${COMMENT}/store`, param);
  }
}
export default CommentApi;
