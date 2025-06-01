import { LeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import adminSettingLogo from "../../assets/admin-setting.png";
import { CustomAvatar } from "../../components/avatar/CustomAvatar";
import {
  KEY_MENU_ADMIN_SETTING,
  MENU_ADMIN_SETTING,
  MENU_WORK_MANAGEMENT,
} from "../../config/Constant";
import { useSideBarStore } from "../../store/SideBarStore";
import { useInfoUser } from "../../store/UserStore";
import "./style.scss";
import { Avatar, Divider } from "antd";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";

const AdminSetting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, languageMap } = useInfoUser();
  const [chosedMenuItem, setChosedMenuItem] = useState("USER");
  const {
    switchIsWorkManagementOptions,
    isWorkManagementOptions,
    isProfileDetail,
    switchIsProfileDetail,
  } = useSideBarStore((state) => state);
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
                  <div
                    className="flex justify-center p-[10px]"
                    onClick={() => {
                      switchIsProfileDetail();
                    }}
                  >
                    <CustomAvatar
                      person={{
                        name: "NGUYEN VAN A",
                        username: "NGUYEN VAN A",
                        avatar:
                          "https://ava-grp-talk.zadn.vn/9/9/b/3/6/360/8a42b70def9c6ec663113bbdd8dd66c2.jpg",
                      }}
                    />
                  </div>
                  {MENU_ADMIN_SETTING.map((item) =>
                    generateAminSettingMenu(item)
                  )}
                </div>
              </div>
            </div>
            {/* {isProfileDetail && (
              <div
                className="profile"
                // ref={infoRef}
              >
                <div className="flex bg-[#e2e3e5] p-2 w-full items-center">
                  <div className="me-3">
                    <div className="relative avatarWrapper inline-block ">
                      <Avatar
                        style={{
                          backgroundColor: getColorFromInitial(user?.name[0]),
                          color: getColor(user?.name[0]),
                        }}
                        size={80}
                        src={user?.avatar}
                      >
                        {user?.name[0]}
                      </Avatar>
                    </div>
                  </div>
                  <div>
                    <div>
                      <h3 className="text-base text-[#23497c] font-bold ">
                        {user?.name}
                      </h3>
                    </div>
                    <div className="mt-1">
                      <h6 className="text-xs text-[#23497c] break-all">
                        {user?.userId}
                      </h6>
                    </div>
                    <div className="mt-1">
                      <h6 className="text-xs text-[#23497c] break-all">
                        {user?.email}
                      </h6>
                    </div>
                    <div className="mt-1">
                      <h6 className="text-xs text-[#23497c] break-all">
                        {user?.phone}
                      </h6>
                    </div>
                    <div className="mt-1">
                      <h6 className="text-xs text-[#23497c] break-all">
                        {user?.mood}
                      </h6>
                    </div>
                  </div>
                </div>

                <Divider className=" mt-0" />
                <button
                  className="profile-item"
                  // onClick={() => setIsModalProfileOpen(true)}
                >
                  {languageMap?.["menu.profile.myProfile"] ?? "My Profile"}
                </button>
                <button
                  className="profile-item"
                  // onClick={openModalSettings}
                >
                  {languageMap?.["menu.profile.setting"] ?? "Setting"}
                </button>
                <Divider />
                <button
                  className="profile-item"
                  // onClick={logout}
                >
                  {languageMap?.["menu.profile.logout"] ?? "Logout"}
                </button>
              </div>
            )} */}
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
