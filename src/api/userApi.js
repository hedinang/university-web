import { USER } from "./apiConstant";
import BaseApi from "./baseApi";

class UserApi extends BaseApi {
  getMe() {
    return this.get(`${USER}/getMe`);
  }

  logout() {
    return this.post(`${USER}/logout`);
  }

  checkExistedUser(param) {
    return this.get(`${USER}/existed-user/${param}`);
  }

  createUser(param) {
    return this.post(`${USER}/admin/create`, param);
  }

  updateUser(param) {
    return this.post(`${USER}/admin/update`, param);
  }

  listPerson(param) {
    return this.post(`${USER}/admin/list`, param);
  }

  getByEmail(param) {
    return this.post(`${USER}/find`, param);
  }
  upload(file) {
    return this.post(`${USER}/upload`, file);
  }

  saveMe(param) {
    return this.post(`${USER}/save-me`, param);
  }

  getUserList(param) {
    return this.post(`${USER}/admin/page`, param);
  }

  resetPassword(param) {
    return this.post(`${USER}/admin/reset-password/${param}`);
  }
}
export default UserApi;
