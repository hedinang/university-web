import AuthApi from "./authApi";
import CommentApi from "./commentApi";
import CouncilApi from "./councilApi";
import QuestionApi from "./questionApi";
import SeenApi from "./seenApi";
import SponsorshipApi from "./sponsorshipApi";
import TopicApi from "./topicApi";
import UserApi from "./userApi";

const apiFactory = {
  authApi: new AuthApi(),
  userApi: new UserApi(),
  councilApi: new CouncilApi(),
  topicApi: new TopicApi(),
  questionApi: new QuestionApi(),
  commentApi: new CommentApi(),
  sponsorshipApi: new SponsorshipApi(),
  seenApi: new SeenApi(),
};

export default apiFactory;
