import { LeftOutlined } from "@ant-design/icons";
import { Button, Input, Popover, Switch, Table } from "antd";
import { debounce } from "lodash";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import SideBarQuestion from "../../../components/sideBar/SideBarQuestion";
import { useSideBarStore } from "../../../store/SideBarStore";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";
// import { CustomAvatar } from "../../../components/avatar/CustomAvatar";
import TextArea from "antd/es/input/TextArea";
import { CreateQuestionModal } from "../../../components/modal/adminSetting/CreateQuestionModal";
import { formatDate } from "../../../utils/formatTime";

const pageSize = 4;

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
  const [highLight, setHighLight] = useState(null);
  const [questionSearch, setQuestionSearch] = useState({
    limit: pageSize,
    page: 1,
    search: {
      title: null,
      content: null,
      questionerName: null,
      recipientName: null,
    },
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: pageSize,
  });

  const tableRef = useRef(null);

  const columns = [
    // {
    //   title: `${languageMap?.["as.menu.user.table.userCode"] ?? "Council Id"}`,
    //   dataIndex: "councilId",
    //   key: "councilId",
    //   width: "150px",
    // },
    ...(user?.roleCode === "TEACHER"
      ? [
          {
            title: `${languageMap?.["as.menu.user.table.name"] ?? "Student name"}`,
            dataIndex: "questionerName",
            key: "questionerName",
          },
        ]
      : [
          {
            title: `${languageMap?.["as.menu.user.table.name"] ?? "Teacher name"}`,
            dataIndex: "recipientName",
            key: "recipientName",
          },
        ]),
    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Title"}`,
      dataIndex: "title",
      key: "title",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Question date"}`,
      dataIndex: "questionDate",
      key: "questionDate",
      render: (questionDate, record) => {
        return formatDate(questionDate);
      },
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Last comment date"}`,
      dataIndex: "lastCommentDate",
      key: "lastCommentDate",
      render: (lastCommentDate, record) => {
        return formatDate(lastCommentDate);
      },
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

  const handleTableChange = (value) => {
    setPagination((prev) => ({
      ...prev,
      current: value.current,
    }));

    setQuestionSearch({ ...questionSearch, page: value.current });
  };

  const fetchQuestionList = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const result =
        await apiFactory.questionApi.getQuestionList(questionSearch);

      if (result?.status === 200) {
        setQuestionList(result?.data?.items);
        setPagination({
          ...pagination,
          total: result?.data?.totalItems,
        });
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
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
    setHighLight(record?.questionId);
    setIsOpenTimelineDetail(true);
  };

  const getSelectedColor = (record) => {
    if (record?.questionId === selectedQuestion?.questionId)
      return "highlighted-row-clicked";
  };

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
    fetchQuestionList();
  }, [questionSearch?.search, questionSearch?.page, highLight]);

  // useEffect(() => {
  //   if (!selectedQuestion) return;

  //   const selectedIndex = questionList?.findIndex(
  //     (q) => q?.questionId === selectedQuestion?.questionId
  //   );

  //   if (selectedIndex === -1) return;

  //   questionList[selectedIndex].selected = true;
  //   setQuestionList([...questionList]);
  // }, [selectedQuestion]);

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
          {user?.roleCode === "STUDENT" && (
            <Button
              className="ml-2"
              type="primary"
              onClick={onAdd}
              style={{ zoom: isMobile && "0.9" }}
            >
              {languageMap?.["as.menu.user?.btnCreateUser"] ??
                "Create question"}
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
              dataSource={questionList}
              pagination={pagination}
              onChange={handleTableChange}
              loading={isLoading}
              size={"middle"}
              className="max-h-[1000px]"
              rowClassName={rowClassName}
              onRow={(record, index) => ({
                onDoubleClick: (e) => onDoubleClick(record),
                className: getSelectedColor(record),
              })}
              scroll={{
                x: 1000,
                y: 700,
              }}
            />
          </div>
        </div>
      </div>
      {isOpenTimelineDetail && (
        <SideBarQuestion
          isOpen={isOpenTimelineDetail}
          selectedQuestion={selectedQuestion}
          onClose={() => {
            setIsOpenTimelineDetail(false);
            setSelectedQuestion(null);
          }}
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
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          selectedQuestion={selectedQuestion}
          questionSearch={questionSearch}
          questionList={questionList}
          setQuestionList={setQuestionList}
          setPagination={setPagination}
          pagination={pagination}
          setQuestionSearch={setQuestionSearch}
          setHighLight={setHighLight}
        />
      )}
    </div>
  );
};

export { QuestionManagement };
