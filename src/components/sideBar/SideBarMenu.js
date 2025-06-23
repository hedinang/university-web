import { Avatar, Divider, Layout, Tooltip } from "antd";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa6";
import { GoProject } from "react-icons/go";
import { GrCircleQuestion } from "react-icons/gr";
import { MdGroups } from "react-icons/md";
import { SiGithubsponsors } from "react-icons/si";
import { useLocation, useNavigate } from "react-router-dom";
import apiFactory from "../../api";
import { useSideBarStore } from "../../store/SideBarStore";
import { useInfoUser } from "../../store/UserStore";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";
import { CustomAvatar } from "../avatar/CustomAvatar";
import "./style.scss";

const REACT_APP_AUTHENTICATION_WEB =
  process.env.REACT_APP_AUTHENTICATION_WEB || "http://localhost:4005";

const SideBarMenu = () => {
  const [isMobile, setIsMobile] = useState(false);
  // const [showProfile, setShowProfile] = useState(false);
  const [activeFeature, setActiveFeature] = useState("chat");
  const infoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isProfileDetail,
    switchIsProfileDetail,
    switchIsMsgDetail,
    switchIsMenuMemberBook,
    switchIsWorkManagement,
    switchIsAdminSetting,
    setIsNotification,
    setIsMenuSideBar,
  } = useSideBarStore((state) => state);

  const { user, updateUser, languageMap } = useInfoUser();

  const onChangeSideBar = (pathname) => {
    if (location?.pathname?.substring(1, pathname?.length + 1) === pathname) {
      switch (pathname) {
        case "user":
          switchIsMsgDetail(false);
          break;
        case "council":
          //   switchIsMenuMemberBook();
          navigate("/council");
          break;
        case "sponsorship":
          // switchIsWorkManagement();
          navigate("/sponsorship");
          break;
        case "topic":
          // switchIsAdminSetting();
          navigate("/topic");
          break;
        case "question":
          navigate("/question");
          // switchIsAdminSetting();
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
              // setIsMenuSideBar(false);
              // setShowProfile(!showProfile);
              switchIsProfileDetail();
            }}
          >
            <div className="flex cursor-pointer flex items-center">
              <CustomAvatar person={user} />
            </div>
          </button>
        </Tooltip>
      ),
      navigationItem: "",
    },
    {
      key: "user",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.sidebar.title.chat"] ?? "User"}
          color={"#0091ff"}
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("user");
              //   setIsMenuSideBar(false);
            }}
          >
            <FaUser size={25} color="white" />
          </button>
        </Tooltip>
      ),
    },
    {
      key: "sponsorship",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.sidebar.title.chat"] ?? "Sponsorship"}
          color={"#0091ff"}
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("sponsorship");
              //   setIsMenuSideBar(false);
            }}
          >
            <SiGithubsponsors size={25} color="white" />
          </button>
        </Tooltip>
      ),
    },

    {
      key: "council",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.sidebar.title.chat"] ?? "Council"}
          color={"#0091ff"}
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("council");
              //   setIsMenuSideBar(false);
            }}
          >
            <MdGroups size={25} color="white" />
          </button>
        </Tooltip>
      ),
    },
    {
      key: "topic",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.sidebar.title.chat"] ?? "Topic"}
          color={"#0091ff"}
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("topic");
              // setIsMenuSideBar(false);
            }}
          >
            <GoProject size={25} color="white" />
          </button>
        </Tooltip>
      ),
    },
    {
      key: "question",
      img: (
        <Tooltip
          placement="right"
          title={languageMap?.["menu.sidebar.title.chat"] ?? "Question"}
          color={"#0091ff"}
        >
          <button
            className="p-[12px] mb-[10px] flex items-center"
            onClick={() => {
              onChangeSideBar("question");
              // setIsMenuSideBar(false);
            }}
          >
            <GrCircleQuestion size={25} color="white" />
          </button>
        </Tooltip>
      ),
    },
  ];

  const handleClickOutside = (event) => {
    if (infoRef.current && !infoRef.current.contains(event.target)) {
      switchIsProfileDetail();
    }
  };

  const generateFeature = (feature) => {
    if (feature?.key === "user" && user?.roleCode !== "ADMIN") return;
    if (feature?.key === "council" && user?.roleCode !== "TEACHER") return;
    if (feature?.key === "sponsorship" && user?.roleCode !== "TEACHER") return;
    if (
      feature?.key === "topic" &&
      !["TEACHER", "STUDENT"].includes(user?.roleCode)
    )
      return;
    if (
      feature?.key === "question" &&
      !["TEACHER", "STUDENT"].includes(user?.roleCode)
    )
      return;

    return (
      <div className="flex justify-between">
        <div key={feature?.key}>{feature?.img}</div>
      </div>
    );
  };

  const logout = async () => {
    await apiFactory.userApi.logout({
      fcmToken: Cookies.get("fcm_token"),
      token: Cookies.get("access_token"),
    });
    // switchIsProfileDetail();
    Cookies.remove("access_token");
    updateUser(null);
    window.location.href = REACT_APP_AUTHENTICATION_WEB + "/login";
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

  return (
    <Layout.Sider
      //   className={
      //     isSelectedConversation || isNotification ? "hidden-sider" : "show-sider"
      //   }
      style={{
        backgroundColor: "#2a56b9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "100px",
        borderRadius: "0px 20px 0px 0px",
      }}
      width={70}
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
          <button className="profile-item" onClick={logout}>
            {languageMap?.["menu.profile.logout"] ?? "Logout"}
          </button>
        </div>
      )}
    </Layout.Sider>
  );
};

export { SideBarMenu };
