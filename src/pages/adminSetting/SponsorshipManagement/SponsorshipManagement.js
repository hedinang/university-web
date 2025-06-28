import { Button, Col, Input, Row, Switch, Table, Tag } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { CreateSponsorshipModal } from "../../../components/modal/adminSetting/CreateSponsorshipModal";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useInfoUser } from "../../../store/UserStore";
import "./style.scss";

const columns = [
  {
    title: "Topic Name",
    dataIndex: "topicName",
    key: "topicName",
  },
  {
    title: "Council Name",
    dataIndex: "councilName",
    key: "councilName",
    width: "150px",
  },
  {
    title: "Student",
    dataIndex: "proposer",
    key: "proposer",
    render: (proposer, record) => {
      return proposer?.name;
    },
    width: "150px",
  },
  {
    title: "Teacher",
    dataIndex: "approver",
    key: "approver",
    render: (approver, record) => {
      return approver?.name;
    },
    width: "150px",
  },
  {
    title: "Council list",
    dataIndex: "memberList",
    key: "memberList",
    render: (memberList, record) => {
      return (
        <Row>
          {memberList?.map((m) => (
            <Col span={8} key={m?.userId}>
              <Tag color={`${m?.councilRole === "HOST" ? "blue" : "green"}`}>
                {m?.name}
              </Tag>
            </Col>
          ))}
        </Row>
      );
    },
    width: "500px",
  },

  {
    title: "Budget",
    dataIndex: "budget",
    key: "budget",
    width: "150px",
  },
];
const pageSize = 4;

const SponsorshipManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadMoreData, setIsLoadMoreData] = useState(true);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [isRemoveUserModal, setIsRemoveUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);
  const [selectedSponsorship, setSelectedSponsorship] = useState(null);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const { user, languageMap } = useInfoUser();

  const [sponsorshipList, setSponsorshipList] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [highLight, setHighLight] = useState(null);
  const [sponsorshipSearch, setSponsorshipSearch] = useState({
    limit: pageSize,
    page: 1,
    search: {
      councilName: null,
      status: "ACTIVE",
    },
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: pageSize,
  });

  const tableRef = useRef(null);

  const cancelCreateModal = () => {
    setIsRemoveUserModal(false);
    setIsOpenUserModal(false);
    setSelectedSponsorship(null);
  };

  const cancelRemoveModal = () => {
    setIsRemoveUserModal(false);
    setRemovingUserId(null);
  };

  const fetchSponsorshipList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result =
        await apiFactory.sponsorshipApi.getSponsorshipList(sponsorshipSearch);

      if (result?.status === 200) {
        if (highLight) {
          const councilIndex = result?.data?.items?.findIndex(
            (council) => council?.councilId === highLight
          );

          if (councilIndex !== -1) {
            result.data.items[councilIndex].isNew = true;
          }
        }

        setSponsorshipList([...result?.data?.items]);

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

      const userIndex = sponsorshipList?.findIndex(
        (usr) => usr?.userId === removingUserId
      );

      sponsorshipList?.splice(userIndex, 1);
      setSponsorshipList([...sponsorshipList]);
      toast.success(result?.message);
      cancelRemoveModal();
    } catch (error) {
      toast.error("Something wrong!");
    }
  };

  const onDoubleClick = (record) => {
    setSelectedSponsorship(record);
    setIsOpenUserModal(true);
  };

  const getSelectedColor = (record) => {
    if (record?.userId === selectedSponsorship?.userId) return "bg-red";
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

    setSponsorshipSearch((prev) => ({
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

    setSponsorshipSearch({ ...sponsorshipSearch, page: value.current });
  };

  useEffect(() => {
    fetchSponsorshipList();
  }, [sponsorshipSearch?.search, sponsorshipSearch?.page, highLight]);

  return (
    <div>
      <div className={`flex flex-col w-full p-[10px]`}>
        <div className="font-semibold text-[20px]   flex items-center">
          {languageMap?.["as.menu.user?.title"] ?? "Sponsorship"}
        </div>

        <div className="flex justify-between mb-[10px]">
          <div className="flex justify-center items-center">
            <Input
              className="w-full mr-2"
              placeholder={
                languageMap?.["as.menu.user?.placeHolderSearch"] ??
                "Search council name or topic name"
              }
              onChange={(e) => debouncedCounciName(e)}
              allowClear
            />
            <Switch
              value={sponsorshipSearch?.isActive}
              className="ml-2 w-[10px]"
              onChange={(checked, e) => {
                scrollToTopTable();
                setIsLoadMoreData(true);
                setSponsorshipSearch({
                  ...sponsorshipSearch,
                  limit: 30,
                  skip: 0,
                  isActive: checked,
                });
              }}
              loading={isLoading}
            />
          </div>
          <Button className="ml-2" type="primary" onClick={onAdd}>
            {languageMap?.["as.menu.user?.btnCreateUser"] ??
              "Create Sponsorship"}
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div className={`user-list`}>
          <div className="" ref={tableRef}>
            <Table
              columns={columns}
              dataSource={sponsorshipList}
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
        <CreateSponsorshipModal
          isModalOpen={isOpenUserModal}
          cancelModal={cancelCreateModal}
          title={
            selectedSponsorship
              ? languageMap?.["as.menu.user.update.title"] ?? "Update Council"
              : languageMap?.["as.menu.user.btnCreateUser"] ?? "Create Council"
          }
          selectedSponsorship={selectedSponsorship}
          setIsOpenModalResetPW={setIsOpenModalResetPW}
          setSponsorshipList={setSponsorshipList}
          sponsorshipList={sponsorshipList}
          setPagination={setPagination}
          pagination={pagination}
          setSponsorshipSearch={setSponsorshipSearch}
          sponsorshipSearch={sponsorshipSearch}
          setHighLight={setHighLight}
        />
      )}
    </div>
  );
};

export { SponsorshipManagement };
