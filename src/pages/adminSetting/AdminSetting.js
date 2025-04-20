import { LeftOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import adminSettingLogo from "../../assets/admin-setting.png";
import {
  KEY_MENU_ADMIN_SETTING,
  MENU_ADMIN_SETTING,
  MENU_WORK_MANAGEMENT,
} from "../../config/Constant";
import { useSideBarStore } from "../../store/SideBarStore";
import { useInfoUser } from "../../store/UserStore";
import "./style.scss";

const AdminSetting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { languageMap } = useInfoUser();
  const [chosedMenuItem, setChosedMenuItem] = useState("USER");
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);
  const [workManagementHeight, setWorkManagementHeight] = useState(
    window.innerHeight
  );
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const [isMobile, setIsMobile] = useState(false);

  const handleMenuItemClick = (menuItem) => {
    navigation(menuItem);
    switchIsWorkManagementOptions();
    setChosedMenuItem(menuItem);
  };

  const navigation = (menuItem) => {
    switch (menuItem) {
      case KEY_MENU_ADMIN_SETTING.SCHEDULE:
        return navigate("/admin-setting/schedule");
      case KEY_MENU_ADMIN_SETTING.COUNCIL:
        return navigate("/admin-setting/council");
      case KEY_MENU_ADMIN_SETTING.USER:
        return navigate("/admin-setting/user");
      default:
        return navigate("/admin-setting/user");
    }
  };

  const generateAminSettingMenu = (item) => {
    return (
      <div
        className={
          chosedMenuItem === item?.key
            ? "conversation bg-[#daeaff]"
            : "conversation"
        }
        onClick={() => handleMenuItemClick(item?.key)}
        key={item.key}
      >
        <div className="w-[100%]">
          <div className="menu-item">
            {item?.icon}
            <div className="name">
              {languageMap?.[
                `as.tab.${item?.name.toLowerCase().replace(" ", "_")}`
              ] ?? item?.name}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const calculateWorkManagementHeight = () => {
    setWorkManagementHeight(windowHeight);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 930);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const pathName = location?.pathname;
    const start =
      pathName?.indexOf("admin-setting/") + "admin-setting/"?.length;
    const end =
      pathName?.indexOf("/", start) !== -1
        ? pathName?.indexOf("/", start)
        : pathName?.length;
    const result = pathName?.substring(start, end)?.toUpperCase();

    setChosedMenuItem(result);
  }, [location]);

  useEffect(() => {
    calculateWorkManagementHeight();
  }, [windowHeight]);

  return (
    <>
      {!isMobile ? (
        <div className="desktop-work-management-menu">
          <div className="flex overflow-hidden">
            <div className="work-management-menu">
              <div className="work-management-list">
                <div
                  className="work-management-container"
                  style={{
                    maxHeight: `${workManagementHeight}px`,
                  }}
                  id="work-management-container"
                >
                  <div className="flex justify-center">
                    <img
                      src={adminSettingLogo}
                      alt="logo"
                      className="h-[77.22px]"
                    />
                  </div>
                  {MENU_ADMIN_SETTING.map((item) =>
                    generateAminSettingMenu(item)
                  )}
                </div>
              </div>
            </div>
            <div className="work-content h-[100vh] overflow-y-auto bg-white">
              <Outlet />
            </div>
          </div>
        </div>
      ) : (
        <div className="mobile-work-management-menu">
          <div className="flex overflow-hidden">
            <div
              className={`work-management-menu ${isWorkManagementOptions ? "block" : "hidden"}`}
            >
              <div className="work-management-list">
                {location?.pathname?.includes("/admin-setting") ? (
                  <div
                    className="work-management-container"
                    style={{
                      maxHeight: `${workManagementHeight}px`,
                    }}
                    id="work-management-container"
                  >
                    <div className="flex justify-around items-center">
                      <a
                        className="btn-back-to-work-management"
                        onClick={() => navigate("/conversation")}
                      >
                        <LeftOutlined size={25} />
                      </a>
                      <div className="w-[80%] flex justify-center items-center">
                        <img
                          src={adminSettingLogo}
                          alt="logo"
                          className="h-[77.22px]"
                        />
                      </div>
                    </div>

                    {MENU_ADMIN_SETTING.map((item) =>
                      generateAminSettingMenu(item)
                    )}
                  </div>
                ) : (
                  <div
                    className="work-management-container"
                    style={{
                      maxHeight: `${workManagementHeight}px`,
                    }}
                  >
                    <div className="flex justify-around items-center">
                      <a
                        className="btn-back-to-work-management"
                        onClick={() => navigate("/conversation")}
                      >
                        <LeftOutlined size={25} />
                      </a>
                      <img
                        src={adminSettingLogo}
                        alt=""
                        className="max-h-[80px]"
                      />
                      <span></span>
                    </div>
                    {MENU_WORK_MANAGEMENT.map((item) =>
                      generateAminSettingMenu(item)
                    )}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`work-content h-[100vh] overflow-y-auto bg-white ${isWorkManagementOptions ? "hidden" : "block"}`}
            >
              <Outlet />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default AdminSetting;
