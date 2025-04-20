import AuthApi from "./authApi";
import CouncilApi from "./councilApi";
import UserApi from "./userApi";

const apiFactory = {
  authApi: new AuthApi(),
  userApi: new UserApi(),
  councilApi: new CouncilApi(),
};

export default apiFactory;
