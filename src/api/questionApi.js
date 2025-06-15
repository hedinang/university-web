import BaseApi from "./baseApi";
import { QUESTION } from "./apiConstant";

class QuestionApi extends BaseApi {
  getQuestionList(param) {
    return this.post(`${QUESTION}/page`, param);
  }

  storeQuestion(param) {
    return this.post(`${QUESTION}/store`, param);
  }
}
export default QuestionApi;
