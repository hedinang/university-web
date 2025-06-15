import { LeftOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Select, Switch, Table, Tag } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { CreateCouncilModal } from "../../../components/modal/adminSetting/CreateCouncilModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useSideBarStore } from "../../../store/SideBarStore";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";
// import { CustomAvatar } from "../../../components/avatar/CustomAvatar";

const CouncilManagement = () => {
  const limit = 30;

  // const { isVerify } = useAdminSettingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const lastObserver = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);
  const { user, languageMap } = useInfoUser();
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);
  const [councilList, setCouncilList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [councilSearch, setCouncilSearch] = useState({
    limit: 4,
    page: 1,
    search: {
      councilName: null,
      year: null,
      memberId: null,
    },
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 4,
  });

  const [teacherList, setTeacherList] = useState([]);

  const tableRef = useRef(null);

  const columns = [
    // {
    //   title: `${languageMap?.["as.menu.user.table.userCode"] ?? "Council Id"}`,
    //   dataIndex: "councilId",
    //   key: "councilId",
    //   width: "150px",
    // },
    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Council Name"}`,
      dataIndex: "councilName",
      key: "councilName",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Year"}`,
      dataIndex: "year",
      key: "year",
    },
    // {
    //   title: `${languageMap?.["as.menu.user.table.phone"] ?? "Host"}`,
    //   dataIndex: "hostName",
    //   key: "host",
    // },
    {
      title: `${languageMap?.["as.menu.user.table.phone"] ?? "Member List"}`,
      dataIndex: "memberList",
      key: "memberList",
      render: (members, record) => {
        return (
          <Row>
            {members?.map((m) => (
              <Col span={8}>
                <Tag color={`${m?.councilRole === "HOST" ? "blue" : "green"}`}>
                  {m?.name}
                </Tag>
              </Col>
            ))}
          </Row>
        );
      },
    },
    // {
    //   title: `${languageMap?.["as.menu.user.table.birthday"] ?? "Birthday"}`,
    //   dataIndex: "birthday",
    //   key: "birthday",
    // },
    // {
    //   title: `${languageMap?.["a"] ?? "Language"}`,
    //   dataIndex: "language",
    //   key: "language",
    // },
    // {
    //   title: `${languageMap?.["as.menu.user.table.role"] ?? "Role"}`,
    //   dataIndex: "roleCode",
    //   key: "roleCode",
    // },
    // {
    //   title: `${languageMap?.["a"] ?? "Avatar"}`,
    //   dataIndex: "avatar",
    //   key: "avatar",
    // },
    // {
    //   title: `${languageMap?.["as.menu.user.table.action"] ?? "Action"}`,
    //   dataIndex: "action",
    //   key: "action",
    //   width: "100px",
    //   render: (text, record) =>
    //     record?.isActive ? (
    //       <Button
    //         className="bg-[#e00d0d] text-[white]"
    //         onClick={() => {
    //           setIsRemoveUserModal(true);
    //           setRemovingUserId(record?.userId);
    //         }}
    //         icon={<FiTrash className="text-[18px]" />}
    //       />
    //     ) : null,
    // },
  ];

  const handleResize = () => {
    setIsMobile(window.innerWidth < 860);
  };

  const cancelCreateModal = () => {
    setIsRemoveUserModal(false);
    setIsOpenUserModal(false);
    setSelectedCouncil(null);
  };

  const cancelRemoveModal = () => {
    setIsRemoveUserModal(false);
    setRemovingUserId(null);
  };

  const fetchCouncilList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    let data = [];

    try {
      const result = await apiFactory.councilApi.getCouncilList(councilSearch);

      if (result?.status === 200) {
        setCouncilList(result?.data?.items);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);

      setCouncilSearch((prev) => ({
        ...prev,
        skip: prev?.skip + data.length,
      }));
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

      const userIndex = councilList?.findIndex(
        (usr) => usr?.userId === removingUserId
      );

      councilList?.splice(userIndex, 1);
      setCouncilList([...councilList]);
      toast.success(result?.message);
      cancelRemoveModal();
    } catch (error) {
      toast.error("Something wrong!");
    }
  };

  const onDoubleClick = (record) => {
    setSelectedCouncil(record);
    setIsOpenUserModal(true);
  };

  const getSelectedColor = (record) => {
    if (record?.userId === selectedCouncil?.userId) return "bg-red";
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

  const debouncedCounciName = debounce((e) => {
    const councilName = e?.target?.value?.trim() || null;

    if (councilName?.length > 0) {
      setIsSearchMode(true);
    } else setIsSearchMode(false);

    setPagination((prev) => ({
      total: 0,
      current: 1,
      pageSize: 4,
    }));

    setCouncilSearch((prev) => ({
      ...prev,
      page: 1,
      search: {
        councilName: councilName,
      },
    }));
  }, 500);

  const onChangeLabel = (value) => {
    setPagination((prev) => ({
      total: 0,
      current: 1,
      pageSize: 4,
    }));

    setCouncilSearch({
      ...councilSearch,
      search: {
        ...councilSearch.search,
        memberId: value,
      },
    });
  };

  useEffect(() => {
    fetchCouncilList();
  }, [councilSearch?.search, councilSearch?.page]);

  useEffect(() => {
    fetchTeacherList();
  }, []);

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
          {languageMap?.["as.menu.user?.title"] ?? "Council"}
        </div>

        <div className="flex justify-between mb-[10px]">
          <div className="flex justify-center items-center">
            <Input
              className="w-full mr-2"
              placeholder={
                languageMap?.["as.menu.user?.placeHolderSearch"] ??
                "Search council name"
              }
              onChange={(e) => debouncedCounciName(e)}
              allowClear
            />
            <Select
              placeholder="teacher"
              onChange={onChangeLabel}
              allowClear
              value={councilSearch.search.memberId}
              className="w-[350px]"
              options={teacherList}
            />
            <Switch
              value={councilSearch?.isActive}
              style={{ zoom: isMobile && "0.7" }}
              className="ml-2 w-[10px]"
              onChange={(checked, e) => {
                scrollToTopTable();
                setIsLoadMoreData(true);
                setCouncilSearch({
                  ...councilSearch,
                  limit: 30,
                  skip: 0,
                  isActive: checked,
                });
              }}
              loading={isLoading}
            />
          </div>
          <Button
            className="ml-2"
            type="primary"
            onClick={onAdd}
            style={{ zoom: isMobile && "0.9" }}
          >
            {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create Council"}
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
              {councilList?.map((user, index) => (
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
                dataSource={councilList}
                pagination={pagination}
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
      {isOpenUserModal && (
        <CreateCouncilModal
          isModalOpen={isOpenUserModal}
          cancelModal={cancelCreateModal}
          title={
            selectedCouncil
              ? languageMap?.["as.menu.user.update.title"] ?? "Update Council"
              : languageMap?.["as.menu.user.btnCreateUser"] ?? "Create Council"
          }
          // setUserList={setUserList}
          // userList={userList}
          selectedCouncil={selectedCouncil}
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          isActive={councilSearch?.isActive}
          setCouncilList={setCouncilList}
        />
      )}
    </div>
  );
};

export { CouncilManagement };
