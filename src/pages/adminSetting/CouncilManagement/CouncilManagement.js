import { Button, Col, Input, Row, Select, Switch, Table, Tag } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { CreateCouncilModal } from "../../../components/modal/adminSetting/CreateCouncilModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";

const columns = [
  {
    title: "Council Name",
    dataIndex: "councilName",
    key: "councilName",
    width: "500px",
  },
  {
    title: "Year",
    dataIndex: "year",
    key: "year",
    width: "100px",
  },
  {
    title: "Member List",
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
];
const pageSize = 4;

const CouncilManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedCouncil, setSelectedCouncil] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const { user, languageMap } = useInfoUser();

  const [councilList, setCouncilList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [highLight, setHighLight] = useState(null);
  const [councilSearch, setCouncilSearch] = useState({
    limit: pageSize,
    page: 1,
    search: {
      councilName: null,
      year: null,
      memberId: null,
      status: "ACTIVE",
    },
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: pageSize,
  });

  const [teacherList, setTeacherList] = useState([]);

  const tableRef = useRef(null);

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
    try {
      const result = await apiFactory.councilApi.getCouncilList(councilSearch);

      if (result?.status === 200) {
        if (highLight) {
          const councilIndex = result?.data?.items?.findIndex(
            (council) => council?.councilId === highLight
          );

          if (councilIndex !== -1) {
            result.data.items[councilIndex].isNew = true;
          }
        }

        setCouncilList([...result?.data?.items]);

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
      pageSize: pageSize,
    }));

    setCouncilSearch((prev) => ({
      ...prev,
      page: 1,
      search: {
        councilName: councilName,
      },
    }));
  }, 500);

  const handleTableChange = (value) => {
    setPagination((prev) => ({
      ...prev,
      current: value.current,
    }));

    setCouncilSearch({ ...councilSearch, page: value.current });
  };

  const onChangeLabel = (value) => {
    setPagination((prev) => ({
      total: 0,
      current: 1,
      pageSize: pageSize,
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
  }, [councilSearch?.search, councilSearch?.page, highLight]);

  useEffect(() => {
    fetchTeacherList();
  }, []);

  return (
    <div>
      <div className={`flex flex-col w-full p-[10px]`}>
        <div className="font-semibold text-[20px]   flex items-center">
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
          <Button className="ml-2" type="primary" onClick={onAdd}>
            {languageMap?.["as.menu.user?.btnCreateUser"] ?? "Create Council"}
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div className={`user-list`}>
          <div className="" ref={tableRef}>
            <Table
              columns={columns}
              dataSource={councilList}
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
        <CreateCouncilModal
          isModalOpen={isOpenUserModal}
          cancelModal={cancelCreateModal}
          title={
            selectedCouncil
              ? languageMap?.["as.menu.user.update.title"] ?? "Update Council"
              : languageMap?.["as.menu.user.btnCreateUser"] ?? "Create Council"
          }
          selectedCouncil={selectedCouncil}
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          setCouncilList={setCouncilList}
          councilList={councilList}
          setPagination={setPagination}
          pagination={pagination}
          setCouncilSearch={setCouncilSearch}
          councilSearch={councilSearch}
          setHighLight={setHighLight}
        />
      )}
    </div>
  );
};

export { CouncilManagement };
