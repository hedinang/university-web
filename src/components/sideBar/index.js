import { LeftOutlined } from "@ant-design/icons";
import {
  Avatar,
  Divider,
  Drawer,
  Layout,
  Menu,
  Modal,
  Tooltip,
  Tour,
} from "antd";
import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import {
  IoChatbubbleEllipsesOutline,
  IoChatbubbleEllipsesSharp,
  IoSettingsOutline,
  IoSettingsSharp,
} from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import apiFactory from "../../api";
import { windowNames } from "../../config/Constant";
import { useSideBarStore } from "../../store/SideBarStore";
import { useInfoUser } from "../../store/UserStore";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";
import { ProfileModal } from "../modal/ProfileModal";
import { SettingsModal } from "../modal/SettingsModal";
import "./style.scss";
// import { CustomAvatar } from "../avatar/CustomAvatar";
import { BsCalendar2CheckFill, BsCalendar2Minus } from "react-icons/bs";
import { HiNewspaper, HiOutlineNewspaper } from "react-icons/hi";

const REACT_APP_AUTHENTICATION_WEB =
  process.env.REACT_APP_AUTHENTICATION_WEB || "http://localhost:4005";

const SideBar = () => {
  const [isOpenModalSettings, setIsOpenModalSettings] = useState(false);
  const [isModalProfileOpen, setIsModalProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeFeature, setActiveFeature] = useState("chat");
  const infoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isSelectedConversation,
    isNotification,
    isProfileDetail,
    switchIsProfileDetail,
    switchIsMsgDetail,
    switchIsMenuMemberBook,
    switchIsWorkManagement,
    switchIsAdminSetting,
    setIsNotification,
    isMenuSideBar,
    setIsMenuSideBar,
  } = useSideBarStore((state) => state);

  const { user, updateUser, languageMap, tour, updateTour } = useInfoUser();
  const [isOpenTour, setIsOpenTour] = useState(false);
  const [isClosingTour, setIsClosingTour] = useState(false);
  const tourStepRef0 = useRef(null);
  const tourStepRef1 = useRef(null);
  const tourStepRef2 = useRef(null);

  const stepsTour = [
    {
      title: "Profile detail",
      description: "Profile detail.",
      target: () => tourStepRef0?.current,
      closeIcon: false,
    },
    {
      title: "Chat manager",
      description: "Chat manager.",
      target: () => tourStepRef1?.current,
    },
    {
      title: "Project manager",
      description: "Project manager.",
      target: () => tourStepRef2?.current,
    },
  ].filter(Boolean);

  const handleCloseTour = async () => {
    if (isClosingTour) return;

    setIsClosingTour(true);
    try {
      const rs = await apiFactory.userScreenApi.updateScreen({
        screenName: windowNames.SIDEBAR_CHAT,
      });

      if (rs?.status === 200) {
        setIsOpenTour(false);
        updateTour({
          ...tour,
          SIDEBAR_CHAT: {
            ...tour?.[windowNames.SIDEBAR_CHAT],
            isViewed: false,
          },
          nextScreen: tour?.[windowNames.SIDEBAR_CHAT]?.nextScreen || null,
          step: tour?.["step"] + 1,
        });
      }
    } catch (error) {}

    setIsClosingTour(false);
  };

  const logout = async () => {
    await apiFactory.userApi.logout({
      fcmToken: Cookies.get("fcm_token"),
      token: Cookies.get("access_token"),
    });
    switchIsProfileDetail();
    Cookies.remove("access_token");
    Cookies.remove("access_token", { domain: "winivina.iptime.org" });
    Cookies.remove("access_token", { domain: "msgauth.winitech.com" });
    updateUser(null);
    window.location.href = REACT_APP_AUTHENTICATION_WEB + "/login";
  };

  const onChangeSideBar = (pathname) => {
    if (location?.pathname?.substring(1, pathname?.length + 1) === pathname) {
      switch (pathname) {
        case "chat":
          switchIsMsgDetail(false);
          break;
        case "member-book":
          switchIsMenuMemberBook();
          break;
        case "work-management":
          switchIsWorkManagement();
          break;
        case "admin-setting":
          switchIsAdminSetting();
          break;
        default:
          break;
      }
    } else {
      if (pathname === "chat") {
        setIsNotification(false);
      }

      if (pathname === "chat" && location?.pathname === "/conversation") {
        return;
      }

      navigate(pathname);
    }
  };

  const openModalSettings = () => {
    switchIsProfileDetail();
    setIsOpenModalSettings(true);
  };

  const handleOk = () => {
    setShowProfile(false);
  };

  const handleCancel = () => {
    setShowProfile(false);
  };

  // const renderLayoutProfileMobile = () => {
  //   const resultComponent = (
  //     <Modal
  //       title="My profile"
  //       open={showProfile}
  //       onOk={handleOk}
  //       onCancel={handleCancel}
  //       footer={false}
  //     >
  //       <div className="profile " ref={infoRef}>
  //         <div className="flex bg-[#e2e3e5] p-2 w-full">
  //           <div className="me-3">
  //             <div className="relative avatarWrapper inline-block ">
  //               <Avatar
  //                 style={{
  //                   backgroundColor: getColorFromInitial(user?.name[0]),
  //                   color: getColor(user?.name[0]),
  //                 }}
  //                 size={80}
  //                 src={user?.avatar ? getAvatar(user) : null}
  //               >
  //                 {user?.name[0]}
  //               </Avatar>
  //             </div>
  //           </div>
  //           <div>
  //             <div>
  //               <h3 className="text-base text-[#23497c] font-bold ">
  //                 {user?.name}
  //               </h3>
  //             </div>
  //             <div className="mt-1">
  //               <h6 className="text-xs text-[#23497c] break-all">
  //                 {user?.userId}
  //               </h6>
  //             </div>
  //             <div className="mt-1">
  //               <h6 className="text-xs text-[#23497c] break-all">
  //                 {user?.email}
  //               </h6>
  //             </div>
  //             <div className="mt-1">
  //               <h6 className="text-xs text-[#23497c] break-all">
  //                 {user?.phone}
  //               </h6>
  //             </div>
  //           </div>
  //         </div>

  //         <Divider className=" mt-0" />
  //         <div
  //           className="cursor-pointer profile-item"
  //           onClick={() => setIsModalProfileOpen(true)}
  //         >
  //           {languageMap?.["menu.profile.myProfile"] ?? "My Profile"}
  //         </div>
  //         <div
  //           className="cursor-pointer profile-item"
  //           onClick={openModalSettings}
  //         >
  //           {languageMap?.["menu.profile.setting"] ?? "Setting"}
  //         </div>
  //         <Divider />
  //         <div className="cursor-pointer profile-item" onClick={logout}>
  //           {languageMap?.["menu.profile.logout"] ?? "Logout"}
  //         </div>
  //       </div>
  //     </Modal>
  //   );
  //   return resultComponent;
  // };

  const featureList = [
    {
      key: "face",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.profile.myProfile"] ?? "My Profile"}
          color={"#0091ff"}
        >
          <button
            className="p-[12px]"
            onClick={() => {
              setIsMenuSideBar(false);
              setShowProfile(!showProfile);
              switchIsProfileDetail();
            }}
          >
            <div
              className="flex cursor-pointer flex items-center"
              ref={tourStepRef0}
            >
              {/* <CustomAvatar person={user} /> */}

              {isMobile && (
                <h2 className="text-black text-[16px] font-[600px] mx-[10px]">
                  {languageMap?.["menu.profile.myProfile"] ?? "My Profile"}
                </h2>
              )}
            </div>
          </button>
        </Tooltip>
      ),
      navigationItem: "",
    },
    {
      key: "chat",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.sidebar.title.chat"] ?? "Chat"}
          color={"#0091ff"}
          className={
            !isMobile && activeFeature === "conversation"
              ? "active-feature"
              : ""
          }
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("chat");
              setIsMenuSideBar(false);
            }}
            ref={tourStepRef1}
          >
            {!isMobile && activeFeature === "conversation" ? (
              <IoChatbubbleEllipsesSharp
                size={25}
                color={isMobile ? "black" : "white"}
              />
            ) : (
              <IoChatbubbleEllipsesOutline
                size={25}
                color={isMobile ? "black" : "white"}
              />
            )}

            {isMobile && (
              <h2 className="text-black text-[16px] font-[600px] mx-[10px]">
                {languageMap?.["menu.sidebar.title.chat"] ?? "Chat"}
              </h2>
            )}
          </button>
        </Tooltip>
      ),
      navigationItem: "chatting list",
    },
    {
      key: "work-management",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["event.title"] ?? "Event"}
          color={"#0091ff"}
          className={
            !isMobile && activeFeature === "work-management"
              ? "active-feature"
              : ""
          }
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("work-management/dashboard");
              setIsMenuSideBar(false);
            }}
            ref={tourStepRef2}
          >
            {!isMobile && activeFeature === "work-management" ? (
              <BsCalendar2CheckFill
                size={23}
                color={isMobile ? "black" : "white"}
              />
            ) : (
              <BsCalendar2Minus
                size={23}
                color={isMobile ? "black" : "white"}
              />
            )}
            {isMobile && (
              <h2 className="text-black text-[16px] font-[600px] mx-[10px]">
                {languageMap?.["event.title"] ?? "Event"}
              </h2>
            )}
          </button>
        </Tooltip>
      ),
      navigationItem: "event",
    },
    {
      key: "notice",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["notice.title"] ?? "Notice"}
          color={"#0091ff"}
          className={
            !isMobile && activeFeature === "notice" ? "active-feature" : ""
          }
        >
          <button className="p-[12px] mb-[10px] flex items-center">
            {!isMobile && activeFeature === "notice" ? (
              <HiNewspaper size={25} color={isMobile ? "black" : "white"} />
            ) : (
              <HiOutlineNewspaper
                size={25}
                color={isMobile ? "black" : "gray"}
              />
            )}
            {isMobile && (
              <h2 className="text-black text-[16px] font-[600px] mx-[10px]">
                {languageMap?.["notice.title"] ?? "Notice"}
              </h2>
            )}
          </button>
        </Tooltip>
      ),
      navigationItem: "notice",
    },
    {
      key: "admin-setting",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["admin-setting"] ?? "Admin setting"}
          color={"#0091ff"}
          className={
            !isMobile && activeFeature === "admin-setting"
              ? "active-feature"
              : ""
          }
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("admin-setting/user");
              setIsMenuSideBar(false);
            }}
            ref={tourStepRef2}
          >
            {!isMobile && activeFeature === "admin-setting" ? (
              <IoSettingsSharp size={25} color={isMobile ? "black" : "white"} />
            ) : (
              <IoSettingsOutline
                size={25}
                color={isMobile ? "black" : "white"}
              />
            )}
            {isMobile && (
              <h2 className="text-black text-[16px] font-[600px] mx-[10px]">
                {languageMap?.["admin-setting"] ?? "Admin setting"}
              </h2>
            )}
          </button>
        </Tooltip>
      ),
      navigationItem: "event",
    },
  ];

  const handleClickOutside = (event) => {
    if (infoRef.current && !infoRef.current.contains(event.target)) {
      switchIsProfileDetail();
    }
  };

  const closeModalSettings = () => {
    setIsOpenModalSettings(false);
  };

  const closeProfilerModal = () => {
    setIsModalProfileOpen(false);
  };

  const generateFeature = (feature) => {
    if (feature?.key === "admin-setting" && user?.roleCode !== "ADMIN") return;
    return <div key={feature?.key}>{feature?.img}</div>;
  };

  useEffect(() => {
    setActiveFeature(location?.pathname.split("/")[1]);
  }, [location]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(max-width: 930px)").matches) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onClose = () => {
    setIsMenuSideBar(false);
  };

  useEffect(() => {
    if (
      tour?.[windowNames.SIDEBAR_CHAT]?.isViewed &&
      tourStepRef0 &&
      (tour?.nextScreen === null ||
        tour?.nextScreen === windowNames.SIDEBAR_CHAT)
    ) {
      setIsOpenTour(true);
    }
  }, [tour?.["step"]]);

  const renderLayoutSider = () => {
    const resultComponent = (
      <Layout.Sider
        className={
          isSelectedConversation || isNotification
            ? "hidden-sider"
            : "show-sider"
        }
        style={{
          backgroundColor: "#2a56b9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "100px",
          borderRadius: "0px 20px 0px 0px",
        }}
        width={65}
        id="sidebar-layout-element"
      >
        {featureList.map((feature) => generateFeature(feature))}

        {isProfileDetail && (
          <div className="profile" ref={infoRef}>
            <div className="flex bg-[#e2e3e5] p-2 w-full items-center">
              <div className="me-3">
                <div className="relative avatarWrapper inline-block ">
                  <Avatar
                    style={{
                      backgroundColor: getColorFromInitial(user?.name[0]),
                      color: getColor(user?.name[0]),
                    }}
                    size={80}
                    src={user?.avatar ? getAvatar(user) : null}
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
                {/* <div className="mt-1">
                  <h6 className="text-xs text-[#23497c] break-all">
                    {user?.userId}
                  </h6>
                </div> */}
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
              onClick={() => setIsModalProfileOpen(true)}
            >
              {languageMap?.["menu.profile.myProfile"] ?? "My Profile"}
            </button>
            <button className="profile-item" onClick={openModalSettings}>
              {languageMap?.["menu.profile.setting"] ?? "Setting"}
            </button>
            <Divider />
            <button className="profile-item" onClick={logout}>
              {languageMap?.["menu.profile.logout"] ?? "Logout"}
            </button>
          </div>
        )}
      </Layout.Sider>
    );

    return resultComponent;
  };

  const renderLayoutSiderMobile = () => {
    const resultComponent = (
      <Drawer
        placement={"left"}
        closable={false}
        onClose={onClose}
        open={isMenuSideBar}
        width={330}
        className="drawer-visible modal-menu-sibar-mb"
        title={
          <div className="flex flex-row">
            <span className="drawer-label">
              <a
                onClick={() => {
                  setIsMenuSideBar(false);
                  setShowProfile(false);
                }}
              >
                <LeftOutlined className="drawer-btn-close" />
              </a>
              {languageMap?.["modal.menu"] ?? "Menu"}
            </span>
          </div>
        }
      >
        <Menu
          mode="inline"
          width={330}
          inlineCollapsed={false}
          className="py-4 overflow-y-auto space-y-2 font-medium"
          style={{ borderInlineEnd: "unset" }}
        >
          {featureList.map((feature) => (
            <div key={feature?.key}>
              <Menu.Item key="addMember" className="cursor-pointer">
                <div className="drawer-item">
                  <div className="ms-3">{feature?.img}</div>
                </div>
              </Menu.Item>
            </div>
          ))}
        </Menu>
      </Drawer>
    );
    return resultComponent;
  };

  return (
    <>
      {renderLayoutSider()}
      {isMenuSideBar && isMobile && renderLayoutSiderMobile()}
      {isMobile && renderLayoutProfileMobile()}

      {isOpenModalSettings && (
        <SettingsModal
          open={isOpenModalSettings}
          onCancel={closeModalSettings}
        />
      )}

      {isModalProfileOpen && (
        <ProfileModal
          closeModal={closeProfilerModal}
          isModalOpen={isModalProfileOpen}
        />
      )}
      {isOpenTour && (
        <Tour
          open={isOpenTour}
          onClose={handleCloseTour}
          steps={stepsTour}
          placement={"right"}
        />
      )}
    </>
  );
};

export { SideBar };
