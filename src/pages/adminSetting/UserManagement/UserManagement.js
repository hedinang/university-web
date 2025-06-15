import { Button, Input, Popover, Select, Switch, Table } from "antd";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { CreateUserModal } from "../../../components/modal/adminSetting/CreateUserModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";

const roleList = [
  {
    label: "TEACHER",
    value: "TEACHER",
  },
  {
    label: "STUDENT",
    value: "STUDENT",
  },
  {
    label: "ADMIN",
    value: "ADMIN",
  },
];

const pageSize = 14;

const UserManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const { user, languageMap } = useInfoUser();
  const [userList, setUserList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [highLight, setHighLight] = useState(null);
  const [userSearch, setUserSearch] = useState({
    limit: pageSize,
    page: 1,
    search: {
      textSearch: null,
      role: null,
      isActive: true,
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

  const cancelCreateModal = () => {
    setIsRemoveUserModal(false);
    setIsOpenUserModal(false);
    setSelectedUser(null);
  };

  const cancelRemoveModal = () => {
    setIsRemoveUserModal(false);
    setRemovingUserId(null);
  };

  const fetchUserList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await apiFactory.userApi.getUserList(userSearch);

      if (result?.status === 200) {
        if (highLight) {
          const userIndex = result?.data?.items?.findIndex(
            (u) => u?.userId === highLight
          );

          if (userIndex !== -1) {
            result.data.items[userIndex].isNew = true;
          }
        }

        setUserList(
          result?.data?.items?.map((r) => ({
            ...r,
            birthday: r?.birthday
              ? dayjs(r?.birthday)?.format("YYYY-MM-DD")
              : null,
          }))
        );

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

  const debouncedUsername = debounce((e) => {
    const userName = e?.target?.value?.trim() || null;

    if (userName?.length > 0) {
      setIsSearchMode(true);
    } else setIsSearchMode(false);

    setPagination((prev) => ({
      total: 0,
      current: 1,
      pageSize: pageSize,
    }));

    setUserSearch((prev) => ({
      ...prev,
      page: 1,
      search: {
        textSearch: userName,
      },
    }));
  }, 500);

  const handleTableChange = (value) => {
    setPagination((prev) => ({
      ...prev,
      current: value.current,
    }));

    setUserSearch({ ...userSearch, page: value.current });
  };

  const onChangeLabel = (value) => {
    setPagination((prev) => ({
      total: 0,
      current: 1,
      pageSize: pageSize,
    }));

    setUserSearch({
      ...userSearch,
      search: {
        ...userSearch.search,
        role: value,
      },
    });
  };

  useEffect(() => {
    fetchUserList();
  }, [userSearch?.search, userSearch?.page, highLight]);

  // useEffect(() => {
  //   if (!highLight) return;

  //   const userIndex = userList?.findIndex(
  //     (usr) => usr?.userId === highLight
  //   );

  //   if (userIndex === -1) return;

  //   userList[userIndex].isNew = true;
  //   setUserList([...userList]);
  // }, [highLight]);

  return (
    <div>
      <div className={`flex flex-col w-full p-[10px]`}>
        <div className="font-semibold text-[20px]   flex items-center">
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
                onChange={(e) => debouncedUsername(e)}
                allowClear
              />
            </Popover>
            <Select
              placeholder="user role"
              onChange={onChangeLabel}
              allowClear
              value={userSearch.search.role}
              className="w-[250px]"
              options={roleList}
            />
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
                className="ml-2 w-[10px]"
                onChange={(checked, e) => {
                  scrollToTopTable();
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
          <Button className="ml-2" type="primary" onClick={onAdd}>
            {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create User"}
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div className={`user-list`}>
          <div className="" ref={tableRef}>
            <Table
              columns={columns}
              dataSource={userList}
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
          isActive={userSearch?.search?.isActive}
          setPagination={setPagination}
          pagination={pagination}
          setUserSearch={setUserSearch}
          setHighLight={setHighLight}
        />
      )}
    </div>
  );
};

export { UserManagement };
