import {
  Button,
  Col,
  ConfigProvider,
  Input,
  Popover,
  Row,
  Switch,
  Table,
  Tag,
} from "antd";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ImBin2 } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";
import { debounce } from "lodash";
import { CreateUserModal } from "../../../components/modal/adminSetting/CreateUserModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useAdminSettingContext } from "../../../context/AdminSettingContext";
import { LeftOutlined } from "@ant-design/icons";
import { useSideBarStore } from "../../../store/SideBarStore";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { CreateCouncilModal } from "../../../components/modal/adminSetting/CreateCouncilModal";
import SideBarQuestion from "../../../components/sideBar/SideBarQuestion";
// import { CustomAvatar } from "../../../components/avatar/CustomAvatar";
import TextArea from "antd/es/input/TextArea";
import { CreateQuestionModal } from "../../../components/modal/adminSetting/CreateQuestionModal";

export const TitleInput = memo(({ item, onBlurName }) => {
  const [value, setValue] = useState(item?.title || "");

  useEffect(() => {
    setValue(item?.title || "");
  }, [item]);

  const handleChange = (e) => {
    setValue(e?.target?.value);
  };

  const handleBlur = () => {
    onBlurName?.(item, value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleBlur();
  };

  const handlePreventAllEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <TextArea
      className="task-name w-full"
      maxLength={100}
      value={value}
      onChange={handleChange}
      onDoubleClick={handlePreventAllEvents}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoSize={{ minRows: 1, maxRows: 5 }}
    />
  );
});

const QuestionManagement = () => {
  const limit = 30;

  // const { isVerify } = useAdminSettingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenQuestionModal, setIsOpenQuestionModal] = useState(false);
  const [isOpenTimelineDetail, setIsOpenTimelineDetail] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const lastObserver = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);
  const { user, languageMap } = useInfoUser();
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);
  const [questionList, setQuestionList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [questionSearch, setQuestionSearch] = useState({
    limit: 4,
    page: 1,
    search: {
      title: null,
      content: null,
      questionerName: null,
      recipientName: null,
    },
  });

  const tableRef = useRef(null);

  const columns = [
    // {
    //   title: `${languageMap?.["as.menu.user.table.userCode"] ?? "Council Id"}`,
    //   dataIndex: "councilId",
    //   key: "councilId",
    //   width: "150px",
    // },

    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Questioner name"}`,
      dataIndex: "title",
      key: "title",
    },
    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Recipient name"}`,
      dataIndex: "questionerName",
      key: "questionerName",
    },
    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Title"}`,
      dataIndex: "title",
      key: "title",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Question date"}`,
      dataIndex: "questionDate",
      key: "questionDate",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Last comment date"}`,
      dataIndex: "lastCommentDate",
      key: "lastCommentDate",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Unread"}`,
      dataIndex: "unread",
      key: "unread",
      render: (unread, record) => {
        return (
          <div className="bg-[red] w-[30px] h-[30px] rounded-[50%] text-white flex justify-center items-center">
            {unread < 99 ? unread : `${unread}+`}
          </div>
        );
      },
    },
  ];

  const handleResize = () => {
    setIsMobile(window.innerWidth < 860);
  };

  const cancelCreateModal = () => {
    setIsRemoveUserModal(false);
    setIsOpenQuestionModal(false);
    // setSelectedCouncil(null);
  };

  const cancelRemoveModal = () => {
    setIsRemoveUserModal(false);
    setRemovingUserId(null);
  };

  // const lastRecordRef = (node) => {
  //   if (!isLoadMoreData || isLoading || isSearchMode) return;

  //   if (lastObserver.current) lastObserver.current.disconnect();

  //   lastObserver.current = new IntersectionObserver(async (entries) => {
  //     if (entries[0].isIntersecting) {
  //       setIsLoading(true);
  //       try {
  //         const result = await apiFactory.userApi.getUserList(userSearch);

  //         if (result?.status === 200) {
  //           setUserList([
  //             ...userList,
  //             ...result?.data?.map((r) => ({
  //               ...r,
  //               birthday: r?.birthday
  //                 ? dayjs(r?.birthday)?.format("YYYY-MM-DD")
  //                 : null,
  //             })),
  //           ]);

  //           setUserSearch({
  //             ...userSearch,
  //             skip: userSearch?.skip + result?.data?.length,
  //           });

  //           if (result?.data?.length < limit) {
  //             setIsLoadMoreData(false);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error fetching project data:", error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     }
  //   });

  //   if (node) lastObserver.current.observe(node);
  // };

  const fetchQuestionList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    let data = [];

    try {
      const result =
        await apiFactory.questionApi.getQuestionList(questionSearch);

      if (result?.status === 200) {
        setQuestionList(result?.data?.items);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);

      setQuestionSearch((prev) => ({
        ...prev,
        skip: prev?.skip + data.length,
      }));
    }
  };

  const onAdd = () => {
    setIsOpenQuestionModal(true);
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

      const userIndex = questionList?.findIndex(
        (usr) => usr?.userId === removingUserId
      );

      questionList?.splice(userIndex, 1);
      setQuestionList([...questionList]);
      toast.success(result?.message);
      cancelRemoveModal();
    } catch (error) {
      toast.error("Something wrong!");
    }
  };

  const onDoubleClick = (record) => {
    setSelectedQuestion(record);
    setIsOpenTimelineDetail(true);
  };

  const getSelectedColor = (record) => {
    if (record?.userId === selectedQuestion?.userId) return "bg-red";
  };

  // useEffect(() => {
  //   window.addEventListener("resize", handleResize);

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  const handleResetPassword = async () => {
    setIsOpenModalResetPW(false);

    try {
      const rs = await apiFactory.userApi.resetPassword(user?.userId);

      if (rs?.status === 200) {
        toast.success("Reset password was successful");
      } else {
        toast.success("Reset password unsuccessfully");
      }
    } catch (error) {
      console.error("Error reset password:", error);
    }
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

    setQuestionSearch((prev) => ({
      ...prev,
      limit: 30,
      skip: 0,
      userName,
    }));
  }, 500);

  useEffect(() => {
    // if (isVerify) {
    fetchQuestionList();
    // }
  }, [
    questionSearch.userName,
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
          {languageMap?.["as.menu.user?.title"] ?? "Question"}
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
                questionSearch?.isActive
                  ? languageMap?.["as.menu.user?.btnActive"] ?? "Active"
                  : languageMap?.["as.menu.user?.btnInactive"] ?? "Inactive"
              }
              trigger="hover"
            >
              <Switch
                value={questionSearch?.isActive}
                style={{ zoom: isMobile && "0.7" }}
                className="ml-2 w-[10px]"
                onChange={(checked, e) => {
                  scrollToTopTable();
                  setIsLoadMoreData(true);
                  setQuestionSearch({
                    ...questionSearch,
                    limit: 30,
                    skip: 0,
                    isActive: checked,
                  });
                }}
                loading={isLoading}
              />
            </Popover>
          </div>
          <Button
            className="ml-2"
            type="primary"
            onClick={onAdd}
            style={{ zoom: isMobile && "0.9" }}
          >
            {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create question"}
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div
          className={`user-list ${isMobile ? "mt-[80px] p-0 border-none" : ""}`}
        >
          {isMobile ? (
            <div
              className={`flex flex-col gap-3 overflow-y-auto p-2 max-h-[78%]`}
              ref={tableRef}
            >
              {questionList?.map((user, index) => (
                <div
                  key={user?.userId}
                  className={`flex items-start gap-4 p-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition cursor-pointer relative ${getSelectedColor(user)}`}
                  onDoubleClick={() => onDoubleClick(user)}
                  // ref={index === userList?.length - 1 ? lastRecordRef : null}
                >
                  {/* <CustomAvatar
                    className="w-14 h-14 rounded-full object-cover border"
                    person={user}
                  /> */}
                  <div className="w-full">
                    <div className="flex-1">
                      {user?.name && (
                        <div className="font-semibold text-[16px] text-gray-800 flex justify-between">
                          <span>{user?.name}</span>
                          <div>
                            <span
                              className={`px-[5px] text-sm rounded-full ${
                                user?.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {user?.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      )}

                      {user?.email && (
                        <div className="text-sm text-gray-500">
                          {" "}
                          {user?.email}
                        </div>
                      )}

                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {user?.userCode && (
                          <div>
                            <strong>User code:</strong> {user?.userCode}
                          </div>
                        )}
                        {user?.phone && (
                          <div>
                            <strong>Phone:</strong> {user?.phone}
                          </div>
                        )}
                        {user?.birthday && (
                          <div>
                            <strong>Birthday:</strong> {user?.birthday}
                          </div>
                        )}
                        {user?.roleCode && (
                          <div>
                            <strong>Role:</strong> {user?.roleCode}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {user?.isActive && (
                        <Button
                          type="primary"
                          danger
                          icon={<FiTrash className="text-red-500" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsRemoveUserModal(true);
                            setRemovingUserId(user?.userId);
                          }}
                          className="flex-1"
                        >
                          Xóa
                        </Button>
                      )}
                      <Button
                        type="primary"
                        icon={<FiEdit2 />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDoubleClick(user);
                        }}
                        className="flex-1"
                      >
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="" ref={tableRef}>
              <Table
                columns={columns}
                dataSource={questionList}
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
          )}
        </div>
      </div>
      {isOpenTimelineDetail && (
        <SideBarQuestion
          // onClose={() => {
          //   setIsOpenTimelineDetail(false);
          //   setSelectedTask(null);
          // }}
          isOpen={isOpenTimelineDetail}
          selectedQuestion={selectedQuestion}
          onClose={() => {
            setIsOpenTimelineDetail(false);
            setSelectedQuestion(null);
          }}
          // data={selectedTask}
          // allDataTimeline={data}
          // unwindTaskList={unwindTaskList}
          // setUnwindTaskList={setUnwindTaskList}
          // projectProgressList={projectProgressList}
          // changeDate={changeDate}
          // onBlurTask={onBlurTask}
          // changeProgressRate={changeProgressRate}
          // onBlurProgressRate={onBlurProgressRate}
          // onBlurStatus={onBlurStatus}
          // handleAddMember={handleAddMember}
          // deleteTask={deleteTask}
          // permissionCurrentUser={permissionCurrentUser}
          // generateParticipant={generateParticipant}
          // currentProjectDetail={projectDetail}
        />
      )}

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
      {isOpenModalResetPW && (
        <GeneralModal
          title={
            languageMap?.["as.menu.user.resetPassword"]
              ? `${languageMap["as.menu.user.resetPassword"]}`
              : `You want to confirm reset password}`
          }
          onCancel={() => setIsOpenModalResetPW(false)}
          open={isOpenModalResetPW}
          onConfirm={handleResetPassword}
        />
      )}
      {isOpenQuestionModal && (
        <CreateQuestionModal
          isModalOpen={isOpenQuestionModal}
          cancelModal={cancelCreateModal}
          title={
            selectedQuestion
              ? languageMap?.["as.menu.user.update.title"] ?? "Update question"
              : languageMap?.["as.menu.user.btnCreateUser"] ?? "Create question"
          }
          // setUserList={setUserList}
          // userList={userList}
          selectedCouncil={selectedQuestion}
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          isActive={questionSearch?.isActive}
          setQuestionList={setQuestionList}
        />
      )}
    </div>
  );
};

export { QuestionManagement };
