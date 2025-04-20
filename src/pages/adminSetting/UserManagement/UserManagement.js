import { Button, ConfigProvider, Input, Popover, Switch, Table } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
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
// import { CustomAvatar } from "../../../components/avatar/CustomAvatar";

const UserManagement = () => {
  const limit = 30;

  // const { isVerify } = useAdminSettingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const lastObserver = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);
  const { user, languageMap } = useInfoUser();
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);
  const [userList, setUserList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [userSearch, setUserSearch] = useState({
    limit,
    skip: 0,
    userName: null,
    isActive: true,
  });

  const tableRef = useRef(null);

  const columns = [
    {
      title: `${languageMap?.["as.menu.user.table.userCode"] ?? "Username"}`,
      dataIndex: "username",
      key: "username",
      width: "150px",
    },
    {
      title: `${languageMap?.["as.menu.user.table.name"] ?? "Name"}`,
      dataIndex: "name",
      key: "name",
    },
    {
      title: `${languageMap?.["as.menu.user.table.email"] ?? "Email"}`,
      dataIndex: "email",
      key: "email",
    },
    {
      title: `${languageMap?.["as.menu.user.table.phone"] ?? "Phone"}`,
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: `${languageMap?.["as.menu.user.table.birthday"] ?? "Birthday"}`,
      dataIndex: "birthday",
      key: "birthday",
    },
    // {
    //   title: `${languageMap?.["a"] ?? "Language"}`,
    //   dataIndex: "language",
    //   key: "language",
    // },
    {
      title: `${languageMap?.["as.menu.user.table.role"] ?? "Role"}`,
      dataIndex: "roleCode",
      key: "roleCode",
    },
    // {
    //   title: `${languageMap?.["a"] ?? "Avatar"}`,
    //   dataIndex: "avatar",
    //   key: "avatar",
    // },
    {
      title: `${languageMap?.["as.menu.user.table.action"] ?? "Action"}`,
      dataIndex: "action",
      key: "action",
      width: "100px",
      render: (text, record) =>
        record?.isActive ? (
          <Button
            className="bg-[#e00d0d] text-[white]"
            onClick={() => {
              setIsRemoveUserModal(true);
              setRemovingUserId(record?.userId);
            }}
            icon={<FiTrash className="text-[18px]" />}
          />
        ) : null,
    },
  ];

  const handleResize = () => {
    setIsMobile(window.innerWidth < 860);
  };

  const cancelCreateModal = () => {
    setIsRemoveUserModal(false);
    setIsOpenUserModal(false);
    setSelectedUser(null);
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

  const fetchUserList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    let data = [];

    try {
      const result = await apiFactory.userApi.getUserList(userSearch);

      if (result?.status === 200) {
        if (result?.data?.length < limit) {
          setIsLoadMoreData(false);
        }

        setUserList(
          result?.data?.map((r) => ({
            ...r,
            birthday: r?.birthday
              ? dayjs(r?.birthday)?.format("YYYY-MM-DD")
              : null,
          }))
        );

        if (result?.data?.length > 0) data = result?.data;
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);

      setUserSearch((prev) => ({
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

      const userIndex = userList?.findIndex(
        (usr) => usr?.userId === removingUserId
      );

      userList?.splice(userIndex, 1);
      setUserList([...userList]);
      toast.success(result?.message);
      cancelRemoveModal();
    } catch (error) {
      toast.error("Something wrong!");
    }
  };

  const onDoubleClick = (record) => {
    setSelectedUser(record);
    setIsOpenUserModal(true);
  };

  const getSelectedColor = (record) => {
    if (record?.userId === selectedUser?.userId) return "bg-red";
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

    setUserSearch((prev) => ({
      ...prev,
      limit: 30,
      skip: 0,
      userName,
    }));
  }, 500);

  useEffect(() => {
    // if (isVerify) {
      fetchUserList();
    // }
  }, [userSearch.userName, 
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
          {languageMap?.["as.menu.user?.title"] ?? "User"}
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
                userSearch?.isActive
                  ? languageMap?.["as.menu.user?.btnActive"] ?? "Active"
                  : languageMap?.["as.menu.user?.btnInactive"] ?? "Inactive"
              }
              trigger="hover"
            >
              <Switch
                value={userSearch?.isActive}
                style={{ zoom: isMobile && "0.7" }}
                className="ml-2 w-[10px]"
                onChange={(checked, e) => {
                  scrollToTopTable();
                  setIsLoadMoreData(true);
                  setUserSearch({
                    ...userSearch,
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
            {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create User"}
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
              {userList?.map((user, index) => (
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
                dataSource={userList}
                pagination={false}
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
        <CreateUserModal
          isModalOpen={isOpenUserModal}
          cancelModal={cancelCreateModal}
          title={
            selectedUser
              ? languageMap?.["as.menu.user.update.title"] ?? "Update user"
              : languageMap?.["as.menu.user.btnCreateUser"] ?? "Create User"
          }
          setUserList={setUserList}
          userList={userList}
          editingUser={selectedUser}
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          isActive={userSearch?.isActive}
        />
      )}
    </div>
  );
};

export { UserManagement };
