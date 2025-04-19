import AuthApi from "./authApi";
import UserApi from "./userApi";

const apiFactory = {
  authApi: new AuthApi(),
  userApi: new UserApi(),
};

export default apiFactory;
