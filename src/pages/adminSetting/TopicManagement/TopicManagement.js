import { LeftOutlined } from "@ant-design/icons";
import { Button, Input, Popover, Switch, Table } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { CreateTopicModal } from "../../../components/modal/adminSetting/CreateTopicModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useSideBarStore } from "../../../store/SideBarStore";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";
// import { CustomAvatar } from "../../../components/avatar/CustomAvatar";

const TopiclManagement = () => {
  const limit = 30;

  // const { isVerify } = useAdminSettingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const lastObserver = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);
  const { user, languageMap } = useInfoUser();
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);
  const [topicList, setTopicList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [topicSearch, setTopicSearch] = useState({
    limit,
    page: 1,
    userName: null,
    isActive: true,
  });

  const tableRef = useRef(null);

  const columns = [
    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Title"}`,
      dataIndex: "title",
      key: "title",
    },

    ...(user?.roleCode === "TEACHER"
      ? [
          {
            title: `${languageMap?.["as.menu.user.table.email"] ?? "Student"}`,
            dataIndex: "proposerName",
            key: "proposerName",
          },
        ]
      : [
          {
            title: `${languageMap?.["as.menu.user.table.email"] ?? "Teacher"}`,
            dataIndex: "approverName",
            key: "approverName",
          },
        ]),
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Topic type"}`,
      dataIndex: "topicType",
      key: "topicType",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Start time"}`,
      dataIndex: "startTime",
      key: "startTime",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "End time"}`,
      dataIndex: "endTime",
      key: "endTime",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Progress"}`,
      dataIndex: "progress",
      key: "progress",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Score"}`,
      dataIndex: "score",
      key: "score",
    },
  ];

  const cancelCreateModal = () => {
    setIsRemoveUserModal(false);
    setIsOpenUserModal(false);
    setSelectedTopic(null);
  };

  const cancelRemoveModal = () => {
    setIsRemoveUserModal(false);
    setRemovingUserId(null);
  };

  const fetchTopicList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    let data = [];

    try {
      const result = await apiFactory.topicApi.getTopicList(topicSearch);

      if (result?.status === 200) {
        setTopicList(result?.data?.items);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);

      setTopicSearch((prev) => ({
        ...prev,
        skip: prev?.skip + data.length,
      }));
    }
  };

  const onAdd = () => {
    setIsOpenUserModal(true);
  };

  const rowClassName = (record) => {
    return record?.isNew ? "bg-[#ffe678]" : "";
  };

  const onConfirmRemoveUser = async () => {
    try {
      if (!removingUserId) return;
      const result = await apiFactory.userApi.removeUser(removingUserId);

      if (result?.status !== 200) {
        toast.error(result?.message);
        return;
      }

      const userIndex = topicList?.findIndex(
        (usr) => usr?.userId === removingUserId
      );

      topicList?.splice(userIndex, 1);
      setTopicList([...topicList]);
      toast.success(result?.message);
      cancelRemoveModal();
    } catch (error) {
      toast.error("Something wrong!");
    }
  };

  const onDoubleClick = (record) => {
    if (user?.roleCode === "STUDENT") return;

    setSelectedTopic(record);
    setIsOpenUserModal(true);
  };

  const getSelectedColor = (record) => {
    if (record?.userId === selectedTopic?.userId) return "bg-red";
  };

  const scrollToTopTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  };

  const debouncedSetUsernameSearch = debounce((e) => {
    scrollToTopTable();
    setIsLoadMoreData(true);
    const userName = e?.target?.value?.trim() || null;

    if (userName?.length > 0) {
      setIsSearchMode(true);
    } else setIsSearchMode(false);

    setTopicSearch((prev) => ({
      ...prev,
      limit: 30,
      skip: 0,
      userName,
    }));
  }, 500);

  useEffect(() => {
    // if (isVerify) {
    fetchTopicList();
    // }
  }, [
    topicSearch.userName,
    // userSearch.isActive,
    //  isVerify
  ]);

  return (
    <div>
      <div
        className={`flex flex-col w-full p-[10px] ${isMobile && "fixed top-[0] left-[0] bg-[white] shadow-sm z-[10]"}`}
      >
        <div className="font-semibold text-[20px]   flex items-center">
          {!isWorkManagementOptions && (
            <a
              className="btn-back-to-work-management mr-2"
              onClick={switchIsWorkManagementOptions}
            >
              <LeftOutlined size={25} />
            </a>
          )}
          {languageMap?.["as.menu.user?.title"] ?? "Topic"}
        </div>

        <div className="flex justify-between mb-[10px]">
          <div className="flex justify-center items-center">
            <Popover
              content={
                languageMap?.["as.menu.user?.placeHolderSearch"] ??
                "Search user code, username, email"
              }
              trigger="hover"
            >
              <Input
                className="w-full mr-2"
                placeholder={
                  languageMap?.["as.menu.user?.placeHolderSearch"] ??
                  "Search user code, username, email"
                }
                onChange={(e) => debouncedSetUsernameSearch(e)}
                allowClear
              />
            </Popover>
            <Popover
              content={
                topicSearch?.isActive
                  ? languageMap?.["as.menu.user?.btnActive"] ?? "Active"
                  : languageMap?.["as.menu.user?.btnInactive"] ?? "Inactive"
              }
              trigger="hover"
            >
              <Switch
                value={topicSearch?.isActive}
                style={{ zoom: isMobile && "0.7" }}
                className="ml-2 w-[10px]"
                onChange={(checked, e) => {
                  scrollToTopTable();
                  setIsLoadMoreData(true);
                  setTopicSearch({
                    ...topicSearch,
                    limit: 30,
                    skip: 0,
                    isActive: checked,
                  });
                }}
                loading={isLoading}
              />
            </Popover>
          </div>
          {user?.roleCode === "TEACHER" && (
            <Button
              className="ml-2"
              type="primary"
              onClick={onAdd}
              style={{ zoom: isMobile && "0.9" }}
            >
              {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create Topic"}
            </Button>
          )}
        </div>
      </div>
      <div className="p-[10px]">
        <div
          className={`user-list ${isMobile ? "mt-[80px] p-0 border-none" : ""}`}
        >
          <div className="" ref={tableRef}>
            <Table
              columns={columns}
              dataSource={topicList}
              // pagination={false}
              loading={isLoading}
              size={"middle"}
              className="max-h-[1000px]"
              rowClassName={rowClassName}
              onRow={(record, index) => ({
                onDoubleClick: (e) => onDoubleClick(record),
                className: getSelectedColor(record),
                // ref:
                //   isLoadMoreData && index === userList?.length - 1
                //     ? lastRecordRef
                //     : null,
              })}
              scroll={
                isMobile
                  ? {
                      x: 700,
                      y: 420,
                    }
                  : {
                      x: 1000,
                      y: 700,
                    }
              }
            />
          </div>
        </div>
      </div>
      {isRemoveUserModal && (
        <GeneralModal
          title={
            languageMap?.["as.menu.user.confirmRemove"]
              ? `${languageMap["as.menu.user.confirmRemove"]} ${removingUserId}`
              : `Are you sure to remove userId: ${removingUserId}`
          }
          onCancel={cancelCreateModal}
          open={isRemoveUserModal}
          onConfirm={onConfirmRemoveUser}
        />
      )}
      {isOpenUserModal && (
        <CreateTopicModal
          isModalOpen={isOpenUserModal}
          cancelModal={cancelCreateModal}
          title={
            selectedTopic
              ? languageMap?.["as.menu.user.update.title"] ?? "Update Topic"
              : languageMap?.["as.menu.user.btnCreateUser"] ?? "Create Topic"
          }
          selectedTopic={selectedTopic}
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          isActive={topicSearch?.isActive}
          setTopicList={setTopicList}
        />
      )}
    </div>
  );
};

export { TopiclManagement };
