import {ADMIN, AUTHEN} from './apiConstant';
import BaseApi from './baseApi';

class AuthApi extends BaseApi {
    login(body) {
        return this.post(AUTHEN + "/login", body);
    }

    register(body) {
        return this.post(AUTHEN + "/register", body);
    }

    getMe(token) {
        return this.post(`${ADMIN}/me`, {}, {
            headers: {
                Authorization: 'Bearer ' + token //the token is a variable which holds the token
            }
        })
    }
    logout(body) {
        return this.post(`${AUTHEN}/logout`, body)
    }
}

export default AuthApi;
