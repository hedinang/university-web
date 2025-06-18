import { Button, Input, Popover, Select, Switch, Table } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { CreateTopicModal } from "../../../components/modal/adminSetting/CreateTopicModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";

const pageSize = 4;
const topicType = [
  { label: "PROJECT", value: "PROJECT" },
  { label: "A", value: "A" },
];

const TopiclManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const { user, languageMap } = useInfoUser();
  const [topicList, setTopicList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [highLight, setHighLight] = useState(null);
  const [teacherList, setTeacherList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [topicSearch, setTopicSearch] = useState({
    limit: pageSize,
    page: 1,
    search: {
      title: null,
      topicType: null,
      studentId: null,
      teacherId: null,
      progress: null,
      score: null,
      status: "ACTIVE",
    },
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: pageSize,
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
    try {
      const result = await apiFactory.topicApi.getTopicList(topicSearch);

      if (result?.status === 200) {
        if (highLight) {
          const topicIndex = result?.data?.items?.findIndex(
            (topic) => topic?.topicId === highLight
          );

          if (topicIndex !== -1) {
            result.data.items[topicIndex].isNew = true;
          }
        }

        setTopicList([...result?.data?.items]);

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

  const debouncedTextSearch = debounce((e) => {
    const text = e?.target?.value?.trim() || null;

    setTopicSearch((prev) => ({
      ...prev,
      page: 1,
      search: {
        ...prev?.search,
        title: text,
      },
    }));
  }, 500);

  const onChangeLabel = (value, kind) => {
    setPagination((prev) => ({
      total: 0,
      current: 1,
      pageSize: pageSize,
    }));

    setTopicSearch({
      ...topicSearch,
      search: {
        ...topicSearch?.search,
        proposerId: kind === "STUDENT" ? value : topicSearch.search?.proposerId,
        approverId: kind === "TEACHER" ? value : topicSearch.search?.approverId,
        topicType:
          kind === "TOPIC_TYPE" ? value : topicSearch.search?.topicType,
      },
    });
  };

  const fetchStudentList = async () => {
    try {
      setIsLoading(true);
      const result = await apiFactory.userApi.listPerson({
        role: "STUDENT",
      });

      if (result?.status === 200) {
        setStudentList(
          result?.data?.map((r) => ({
            value: r?.userId,
            label: r?.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeacherList = async () => {
    try {
      setIsLoading(true);
      const result = await apiFactory.userApi.listPerson({
        role: "TEACHER",
      });

      if (result?.status === 200) {
        setTeacherList(
          result?.data?.map((r) => ({
            value: r?.userId,
            label: r?.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableChange = (value) => {
    setPagination((prev) => ({
      ...prev,
      current: value.current,
    }));

    setTopicSearch({ ...topicSearch, page: value.current });
  };

  useEffect(() => {
    fetchTopicList();
  }, [topicSearch?.search, topicSearch?.page, highLight]);

  useEffect(() => {
    fetchStudentList();
    fetchTeacherList();
  }, []);

  return (
    <div>
      <div className={`flex flex-col w-full p-[10px]`}>
        <div className="font-semibold text-[20px]   flex items-center">
          {languageMap?.["as.menu.user?.title"] ?? "Topic"}
        </div>
        <div className="flex justify-between mb-[10px]">
          <div className="flex justify-center items-center gap-[10px]">
            <Popover
              content={
                languageMap?.["as.menu.user?.placeHolderSearch"] ??
                "Search user code, username, email"
              }
              trigger="hover"
            >
              <Input
                className="w-full"
                placeholder={
                  languageMap?.["as.menu.user?.placeHolderSearch"] ??
                  "Search user code, username, email"
                }
                onChange={(e) => debouncedTextSearch(e)}
                allowClear
              />
            </Popover>
            {user?.roleCode === "TEACHER" && (
              <Select
                placeholder="student"
                onChange={(value) => onChangeLabel(value, "STUDENT")}
                allowClear
                value={topicSearch.search.proposerId}
                className="w-[350px]"
                options={studentList}
              />
            )}
            {user?.roleCode === "STUDENT" && (
              <Select
                placeholder="teacher"
                onChange={(value) => onChangeLabel(value, "TEACHER")}
                allowClear
                value={topicSearch.search.approverId}
                className="w-[350px]"
                options={teacherList}
              />
            )}
            <Select
              placeholder="topic type"
              onChange={(value) => onChangeLabel(value, "TOPIC_TYPE")}
              allowClear
              value={topicSearch.search.topicType}
              className="w-[350px]"
              options={topicType}
            />
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
                className="ml-2 w-[10px]"
                onChange={(checked, e) => {
                  scrollToTopTable();
                  setIsLoadMoreData(true);
                  setTopicSearch({
                    ...topicSearch,
                    limit: pageSize,
                    skip: 0,
                    isActive: checked,
                  });
                }}
                loading={isLoading}
              />
            </Popover>
          </div>
          {user?.roleCode === "TEACHER" && (
            <Button className="ml-2" type="primary" onClick={onAdd}>
              {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create Topic"}
            </Button>
          )}
        </div>
      </div>
      <div className="p-[10px]">
        <div className={`user-list`}>
          <div className="" ref={tableRef}>
            <Table
              columns={columns}
              dataSource={topicList}
              loading={isLoading}
              pagination={pagination}
              onChange={handleTableChange}
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
          topicSearch={topicSearch}
          topicList={topicList}
          setTopicList={setTopicList}
          setPagination={setPagination}
          pagination={pagination}
          setTopicSearch={setTopicSearch}
          setHighLight={setHighLight}
        />
      )}
    </div>
  );
};

export { TopiclManagement };
