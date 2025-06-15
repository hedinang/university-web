import { LoadingOutlined } from "@ant-design/icons";
import { Avatar, Button, Checkbox, Col, Input, Modal, Row, Spin } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { useDirectoryContext } from "../../../pages/adminSetting/OrgManagement/directory/DirectoryContext";
import dayjs from "dayjs";
import { IoSearchOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";
import { getAvatar, getColor, getColorFromInitial } from "../../../utils/Utils";
import "./style.scss";

const ItemInfo = ({ user, isHost, isAdmin, onAddUser }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 860);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getClassNameByRole = () => {
    if (isHost) {
      return "bg-[red] w-[40px] h-[40px]";
    } else if (isAdmin) {
      return "bg-[#007fff] w-[40px] h-[40px]";
    } else return "bg-[#87d068] w-[40px] h-[40px]";
  };

  return (
    <Row
      gutter={[8, 0]}
      className={
        isMobile ? "w-[200%] mb-5 items-center" : "w-[100%] mb-5 items-center"
      }
    >
      {isMobile && (
        <Col span={1}>
          <Checkbox
            className="ml-2"
            checked={user?.checked}
            value={user?.checked}
            onChange={(e) => onAddUser(e?.target?.checked, user)}
          />
        </Col>
      )}
      <Col span={3} className="flex items-center justify-center">
        <Avatar
          className={getClassNameByRole()}
          style={{
            backgroundColor: getColorFromInitial(user?.name),
            color: getColor(user?.name),
          }}
          src={getAvatar(user)}
        >
          {user?.name?.[0]}
        </Avatar>
      </Col>
      <Col span={3}>
        <span className="text-[14px]">{user?.userCode}</span>
      </Col>
      <Col span={5}>
        <span className="font-bold text-[14px]">{user?.name}</span>
      </Col>
      <Col span={8}>
        <span className="text-[14px]">{user?.email || "_"}</span>
      </Col>
      <Col span={4}>
        <span className="font-bold text-[14px]">{user?.phone || "_"}</span>
      </Col>
      {!isMobile && (
        <Col span={1}>
          <Checkbox
            checked={user?.checked}
            value={user?.checked}
            onChange={(e) => onAddUser(e?.target?.checked, user)}
          />
        </Col>
      )}
    </Row>
  );
};

const UserList = ({ userList, setUserList, lastRecordRef, onSearch }) => {
  const { onDeleteItem, isCheckedList, isCheckedLoading, memberGroupList } =
    useDirectoryContext();
  const { languageMap } = useInfoUser();

  const onAddUser = (value, user) => {
    const indexUser = userList?.findIndex(
      (usr) => usr?.userId === user?.userId
    );
    userList[indexUser].checked = value;
    setUserList([...userList]);
    // userList?.filter(user=>user?.checked)?.length
  };

  return (
    <div
      className={
        isCheckedList
          ? "checked-list rounded-md"
          : "non-checked-list rounded-md w-full"
      }
    >
      <div className="p-[12px] flex justify-center gap-[10px] items-center">
        <div className="flex justify-between font-semibold w-full border-b text-lg">
          <div className="mb-[10px]">
            <Input
              className="w-full"
              placeholder={languageMap?.["menu.search.placeholder"] ?? "Search"}
              onChange={(event) => {
                onSearch(event.target.value.trim());
              }}
              prefix={<IoSearchOutline size={15} />}
              allowClear
            />
          </div>
          <div className="text-[#005ae0] float-right text-[12px]">
            {`${userList?.filter((user) => user?.checked)?.length} ${languageMap?.["modal.organization.viewPeoples"] ?? "Checked"}`}
          </div>
        </div>
      </div>
      <div className="relative overflow-y-auto h-[400px] custom-scrollbar">
        {userList?.map((usr, index) => (
          <div
            ref={index === userList?.length - 1 ? lastRecordRef : null}
            key={usr?.userId}
          >
            <ItemInfo
              user={usr}
              screenInfo={"CREATE_GROUP"}
              onDeleteItem={onDeleteItem}
              isView={true}
              onAddUser={onAddUser}
            />
          </div>
        ))}
        {isCheckedLoading && (
          <div className="absolute top-[40%] w-full text-center">
            <Spin indicator={<LoadingOutlined classID="text-[35px]" spin />} />
          </div>
        )}
      </div>
    </div>
  );
};

const StoreUserModal = ({ isModalOpen, cancelModal, title, parentId }) => {
  const { languageMap } = useInfoUser();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [userList, setUserList] = useState([]);
  const lastObserver = useRef();
  const { orgList, setOrgList, checkedList, setCheckedList } =
    useDirectoryContext();

  const [userSearch, setUserSearch] = useState(null);

  const lastRecordRef = (node) => {
    if (!isLoadMoreData || isLoading) return;

    if (lastObserver.current) lastObserver.current.disconnect();

    lastObserver.current = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        setIsLoading(true);
        try {
          const result = await apiFactory.userApi.getUserList(userSearch);
          if (result?.status === 200) {
            setUserList([
              ...userList,
              ...result?.data?.map((r) => ({
                ...r,
                birthday: r?.birthday
                  ? dayjs(r?.birthday)?.format("YYYY-MM-DD")
                  : null,
              })),
            ]);
            setUserSearch({
              ...userSearch,
              skip: userSearch?.skip + result?.data?.length,
            });

            if (result?.data?.length < 30) {
              setIsLoadMoreData(false);
            }
          }
        } catch (error) {
          console.error("Error fetching project data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });

    if (node) lastObserver.current.observe(node);
  };

  const storeUser = async () => {
    setIsAdding(true);
    try {
      const request = {
        userIds: userList
          ?.filter((usr) => usr?.checked)
          ?.map((usr) => usr?.userId),
        parentId: parentId,
      };

      const result = await apiFactory.organizationUserApi.addUser(request);

      if (result?.status !== 200) {
        toast.error(result?.data?.message);
        return;
      }

      orgList?.push(...result?.data);
      setOrgList([...orgList]);
      checkedList?.push(...result?.data);
      setCheckedList([...checkedList]);
      toast.success("Add user successfully");
      cancelModal();
    } catch (error) {
      console.error("Error fetching alarm list data:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const fetchUserList = async () => {
    setIsLoading(true);
    try {
      const result = await apiFactory.userApi.getUserList(userSearch);
      if (result?.status === 200) {
        setUserList(
          result?.data?.map((r) => ({
            ...r,
            birthday: r?.birthday
              ? dayjs(r?.birthday)?.format("YYYY-MM-DD")
              : null,
          }))
        );

        setUserSearch({
          ...userSearch,
          skip: userSearch?.skip + result?.data?.length,
        });
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSearch = debounce(async (e) => {
    setIsLoadMoreData(true);
    setUserSearch({
      ...userSearch,
      skip: 0,
      userName: e,
    });
  }, 200);

  useEffect(() => {
    const excludingUserIds = checkedList
      ?.filter((checked) => checked?.type === "PERSON")
      ?.map((checked) => checked?.objectId);
    setUserSearch({
      isActive: true,
      limit: 30,
      skip: 0,
      userName: "",
      excludingUserIds: excludingUserIds,
    });
  }, [checkedList]);

  useEffect(() => {
    if (!userSearch) return;
    fetchUserList();
  }, [userSearch?.userName, userSearch?.excludingUserIds]);

  return (
    <Modal
      width="800px"
      open={isModalOpen}
      footer={false}
      closeIcon={false}
      onCancel={cancelModal}
      //   title={languageMap?.["modal.labelManagement.title"] ?? "Label management"}
      title={title}
      closable={true}
    >
      <UserList
        userList={userList}
        setUserList={setUserList}
        lastRecordRef={lastRecordRef}
        onSearch={onSearch}
      />
      {isAdding ? (
        <div className="flex justify-center mt-[10px]">
          <Spin indicator={<LoadingOutlined className="loader-icon" spin />} />
        </div>
      ) : (
        <div className="flex gap-[10px] justify-center mt-[15px]">
          <Button type="primary" className="bg-[grey]" onClick={cancelModal}>
            {languageMap?.["as.menu.organization.btnCancel"] ?? "Cancel"}
          </Button>
          <Button type="primary" className="bg-[#4db74d]" onClick={storeUser}>
            {languageMap?.["as.menu.organization.btnAdd"] ?? "Add"}
          </Button>
        </div>
      )}
    </Modal>
  );
};
export { StoreUserModal };
