import { Layout, Space } from "antd";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import apiFactory from "../../api";
import { useInfoUser } from "../../store/UserStore";
import { verifiedAccessToken } from "../../utils/Utils";
import { SideBarMenu } from "../sideBar/SideBarMenu";
import "./style.scss";

const CHAT_WEB = process.env.REACT_APP_CHAT_WEB || "http://localhost:3000";

const AuthLayout = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const { user, updateUser, updateLanguageMap } = useInfoUser();

  const getMe = async () => {
    if (user) return;

    const me = await apiFactory.userApi.getMe();
    if (me?.status === 200) {
      updateUser(me?.data);

      if (location?.pathname === "/" && me?.data?.roleCode === "TEACHER") {
        navigate("/topic");
      }

      if (location?.pathname === "/" && me?.data?.roleCode === "ADMIN") {
        navigate("/user");
      }

      if (location?.pathname === "/" && me?.data?.roleCode === "STUDENT") {
        navigate("/topic");
      }
    } else {
      toast.error(me?.message);
      updateUser(null);
      updateLanguageMap(null);
      Cookies.remove("access_token");
      navigate("/login");
    }
  };

  const process = async () => {
    const a = await verifiedAccessToken();

    setVerified(a);

    if (!a) {
      if (!searchParams.get("callback")) {
        navigate("/login");
      } else {
        navigate("/login?callback=" + searchParams.get("callback"));
      }
    } else {
      await getMe();
    }
  };

  useEffect(() => {
    process();
  }, []);

  return (
    <Space className="space-app" direction="vertical" size={[0, 48]}>
      {verified && (
        <Layout className="layout-app">
          <SideBarMenu />
          <Layout.Content>
            <Outlet />
          </Layout.Content>
        </Layout>
      )}
    </Space>
  );
};

export default AuthLayout;
