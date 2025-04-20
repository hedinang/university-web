import { Layout, Space } from "antd";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SideBar } from "../sideBar";
import { verifiedAccessToken } from "../../utils/Utils";
import "./style.scss";

const CHAT_WEB = process.env.REACT_APP_CHAT_WEB || "http://localhost:3000";

const AuthLayout = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  const process = async () => {
    const a = await verifiedAccessToken()

    setVerified(a);

    if (!a) {
      if (!searchParams.get("callback")) {
        navigate("/login");
      } else {
        navigate("/login?callback=" + searchParams.get("callback"));
      }
    } else {
      // await getMe();
      //stompConnect();
      if (location?.pathname === "/") {
        navigate("/admin-setting/user");
      }
      //  else {
      //   if (redirectToken) {
      //     let finalRedirectUrl = window.location.href.replace(
      //       "?token=" + redirectToken,
      //       ""
      //     );

      //     finalRedirectUrl = finalRedirectUrl.replace(
      //       "&&token=" + redirectToken,
      //       ""
      //     );

      //     window.location.href = finalRedirectUrl;
      //   }
      // }
    }
  };

  useEffect(() => {
    process();
  }, []);

  return (
    <Space className="space-app" direction="vertical" size={[0, 48]}>
      {verified && (
        <Layout className="layout-app">
          {/* <SideBar /> */}
          <Layout.Content>
            <Outlet />
          </Layout.Content>
        </Layout>
      )}
    </Space>
  );
};

export default AuthLayout;
