import {
  Button,
  Checkbox,
  Empty,
  Input,
  Modal,
  Popover,
  Tabs,
  Tooltip,
} from "antd";
import { debounce, reduce } from "lodash";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { IoSearchOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import apiFactory from "../../api";
import {
  CHATTING,
  MESSAGE_STATUS,
  role,
  typeConfirms,
} from "../../config/Constant";
import { useChatContext } from "../../context/ChatContext";
import { useInfoUser } from "../../store/UserStore";
import { BasicMemberInfo } from "../select/directory/BasicMemberInfo";
import { GeneralModal } from "./GeneralModal";
import { GrUserAdmin } from "react-icons/gr";

const MemberModal = ({
  selectedConversation,
  openModalShowMember,
  handleCancelModalShowMember,
  getListMemberInfo,
}) => {
  const { user, languageMap } = useInfoUser();
  const [memberGroupList, setMemberGroupList] = useState([]);
  const [memberPage, setMemberPage] = useState(1);
  const [memberNameSearch, setMemberNameSearch] = useState("");
  const [isMoreMember, setIsMoreMember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const { consumeEvent } = useChatContext();
  const [tabs, setTabs] = useState([]);
  const [openModalConfirm, setOpenModalConfirm] = useState(false);
  const [typeConfirm, setTypeConfirm] = useState("");
  const [contentConfirmModal, setContentConfirmModal] = useState("");
  const [titleConfirmModal, setTitleConfirmModal] = useState("");
  const [activeKey, setActiveKey] = useState("ALL");
  const [listSeenTs, setListSeenTs] = useState([]);

  const changeTab = (key) => {
    setActiveKey(key);
    setMemberGroupList([]);
    setSelectedUserIds([]);
    setMemberNameSearch("");
    setIsMoreMember(true);
    setMemberPage(1);
  };

  const openModal = (type) => {
    setOpenModalConfirm(true);
    if (type) {
      setTypeConfirm(type);
    } else return;
  };

  const closeModal = () => {
    setOpenModalConfirm(false);
    setTypeConfirm("");
  };

  const fetchMembers = async () => {
    setLoading(true);

    const result = await apiFactory?.userConversationApi?.getList({
      conversationId: selectedConversation?.conversationId,
      limit: CHATTING.MESSAGE_LIMIT,
      page: memberPage,
      search: {
        memberName: memberNameSearch,
        viewType: activeKey,
      },
      ts: moment(),
    });

    if (result?.status !== 200) {
      toast.error(result?.message);
      setLoading(false);
      return;
    }

    if (result?.data) {
      const memberList = result?.data?.items;
      const memberIds = memberList?.map((member) => member?.userId);
      const orgResponse =
        await apiFactory?.organizationApi?.getListOrganization(memberIds);

      const organizationList = orgResponse?.data;

      const memberGroups = memberList?.map((member) => {
        return organizationList
          ?.filter((org) => org?.objectId === member?.userId)
          ?.map((org) => ({
            ...member,
            paths: org?.paths,
          }));
      });

      if (result?.data?.totalItems < memberPage * CHATTING?.MESSAGE_LIMIT)
        setIsMoreMember(false);

      if (memberPage === 1) {
        setMemberGroupList([...memberGroups]);
      } else {
        setMemberGroupList([...memberGroupList, ...memberGroups]);
      }
    }

    setLoading(false);
  };

  const onScroll = async (event) => {
    if (
      event.currentTarget.scrollTop + event.currentTarget.clientHeight >=
        event.currentTarget.scrollHeight &&
      !loading
    ) {
      if (!isMoreMember) return;

      setTimeout(async () => {
        setMemberPage(memberPage + 1);
      }, 500);
    }
  };

  const debouncedSearchMember = debounce((memberName) => {
    setMemberNameSearch(memberName);
    setMemberPage(1);
  }, 500);

  const onChangeMembersCheckBox = (member) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      const updatedUserIds = [...prevSelectedUserIds];
      const index = updatedUserIds.indexOf(member?.userId);

      if (index !== -1) {
        updatedUserIds.splice(index, 1);
      } else {
        updatedUserIds.push(member?.userId);
      }
      return updatedUserIds;
    });
  };

  const getMemberName = () => {
    const memberMap = reduce(
      memberGroupList,
      (result, value) => {
        const userId = value[0]?.userId;
        const name = value[0]?.name;

        if (userId && name) {
          result[userId] = name;
        }
        return result;
      },
      {},
    );

    return selectedUserIds
      .map((userId) => {
        return memberMap[userId];
      })
      ?.join(", ");
  };

  const deleteMemberInGroup = async () => {
    if (selectedUserIds && selectedUserIds?.length > 0) {
      const removeUser = await apiFactory.userConversationApi.removeUser({
        userIds: selectedUserIds,
        conversationId: selectedConversation?.conversationId,
      });

      if (removeUser?.status === 200) {
        toast.success("Successfully kicked people out of the group");

        const requestUuid = uuidv4();
        const item = {
          requestUuid,
          content: getMemberName(),
          contentType: MESSAGE_STATUS.REMOVE_MEMBER,
          createdAt: moment().toISOString(),
          conversationId: selectedConversation?.conversationId,
          removeMemberCount: selectedUserIds?.length,
        };
        consumeEvent(item);

        const userInConversation = getListMemberInfo();

        if (userInConversation?.status === 200) {
          toast.success("Successfully kicked people out of the group");
        } else {
          toast.error(userInConversation?.message);
        }
      } else {
        toast.error(removeUser?.message);
      }
    } else {
      toast.error("Please select at least one user");
    }
  };

  const updateRoleForMember = async () => {
    if (selectedUserIds && selectedUserIds?.length > 0) {
      const param = {
        userIds: selectedUserIds,
        conversationId: selectedConversation?.conversationId,
        role: role.ADMIN,
      };
      const updatedUser =
        await apiFactory.userConversationApi.updateRoleForMember(param);

      if (updatedUser?.status !== 200) {
        toast.error(updatedUser?.message);
        return;
      }
    } else {
      toast.error("Please select at least one user");
      return;
    }
  };

  const handleConfirm = async () => {
    if (typeConfirm === typeConfirms.KICK_MEMBERS) {
      await deleteMemberInGroup();
      handleCancelModalShowMember();
    } else if (typeConfirm === typeConfirms.UPDATE_ROLE_ADMIN) {
      await updateRoleForMember();
      handleCancelModalShowMember();
    } else return;
  };

  const messageContentModal = () => {
    if (typeConfirm === typeConfirms.KICK_MEMBERS) {
      return setContentConfirmModal(
        "Do you want to kick these members out of the group?",
      );
    } else if (typeConfirm === typeConfirms.UPDATE_ROLE_ADMIN) {
      return setContentConfirmModal(
        "Do you want to update role Admin for these members?",
      );
    } else return setContentConfirmModal("");
  };

  const messageTitleModal = () => {
    if (typeConfirm === typeConfirms.KICK_MEMBERS) {
      return setTitleConfirmModal("Remove member in group");
    } else if (typeConfirm === typeConfirms.UPDATE_ROLE_ADMIN) {
      return setTitleConfirmModal("Update role Admin");
    } else return setTitleConfirmModal("");
  };

  const getLastSeenTs = (userId) => {
    let result = listSeenTs.find(
      (s) => s.userId === userId,
    )?.lastSeenTs;
    console.log(result);
    return result;
  };

  const generateTabs = () => {
    if (memberGroupList.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
      <div
        className="mt-5 modal-show-member-container overflow-y-scroll"
        onScroll={onScroll}
      >
        {" "}
        {memberGroupList.map((memberGroup) => (
          <BasicMemberInfo
            memberGroup={memberGroup}
            screenInfo="VIEW_MEMBER_IN_GROUP"
            isHost={memberGroup?.[0]?.role === "HOST"}
            isAdmin={memberGroup?.[0]?.role === "ADMIN"}
            isMe={memberGroup?.[0]?.userId === user?.userId}
            key={memberGroup?.[0]?.userId}
            isSelectedCombobox={selectedUserIds?.includes(
              memberGroup?.[0]?.userId,
            )}
            seenTsInMessage={getLastSeenTs(memberGroup?.[0]?.userId)}
            onChangeMembersCheckBox={onChangeMembersCheckBox}
          />
        ))}
      </div>
    );
  };

  const getListSeentTs = async () => {
    const res = await apiFactory.conversationApi.getListSeenTs(
      selectedConversation?.conversationId,
    );
    if (res?.status === 200) {
      setListSeenTs(res.data);
    }
  };

  const getMembersRole = () => {
    return reduce(
      memberGroupList,
      (result, value) => {
        const userId = value[0]?.userId;
        const role = value[0]?.role;

        if (userId && role) {
          result[userId] = role;
        }
        return result;
      },
      {},
    );
  };

  useEffect(() => {
    const tabsContent = generateTabs();
    if (selectedConversation.type === "NOTIFICATION") {
      const items = [
        {
          key: "ALL",
          label: "All",
          destroyInactiveTabPane: true,
          children: tabsContent,
        },
        {
          key: "RECIPIENT",
          label: "Recipient",
          destroyInactiveTabPane: true,
          children: tabsContent,
        },
        {
          key: "CC",
          label: "CC",
          destroyInactiveTabPane: true,
          children: tabsContent,
        },
      ];
      setTabs(items);
    } else {
      const items = [
        {
          key: "ALL",
          label: "All",
          destroyInactiveTabPane: true,
          children: tabsContent,
        },
        {
          key: "RECENT",
          label: "Recent",
          destroyInactiveTabPane: true,
          children: tabsContent,
        },
      ];
      setTabs(items);
    }
  }, [memberGroupList, selectedUserIds]);

  useEffect(() => {
    messageContentModal();
    messageTitleModal();
  }, [typeConfirm]);

  useEffect(() => {
    fetchMembers();
  }, [memberPage, memberNameSearch, activeKey]);

  useEffect(() => {
    if (selectedConversation.type === "NOTIFICATION") {
      getListSeentTs();
    }
  }, []);

  return (
    <>
      <Modal
        title={
          languageMap ? languageMap["modal.memberList.title"] : "Member List"
        }
        open={openModalShowMember}
        onCancel={handleCancelModalShowMember}
        width="500px"
        footer={false}
      >
        <div className="mt-4 flex flex-col justify-between">
          <div className="h-[450px]">
            <div className="mt-2 mb-2">
              <Input
                placeholder={
                  languageMap
                    ? languageMap["menu.search.placeholder"]
                    : "Search"
                }
                prefix={<IoSearchOutline size={15} />}
                onChange={(e) => debouncedSearchMember(e?.target?.value)}
              />
            </div>

            <Tabs
              defaultActiveKey="ALL"
              activeKey={activeKey}
              items={tabs}
              onChange={changeTab}
            />
          </div>
          <div className="flex justify-end mt-3">
            {selectedConversation.role === "HOST" &&
              selectedConversation.type !== "NOTIFICATION" &&
              memberGroupList?.length > 0 &&
              Object.values(getMembersRole()).some(
                (role) => role !== "HOST",
              ) && (
                <>
                  <Tooltip
                    placement="top"
                    title={"Update role admin for members"}
                    color={"#0091ff"}
                  >
                    <a
                      className="icon"
                      onClick={() => openModal(typeConfirms.UPDATE_ROLE_ADMIN)}
                    >
                      <GrUserAdmin size={20} color="green" />
                    </a>
                  </Tooltip>

                  <Tooltip
                    placement="top"
                    title={"Kick members"}
                    color={"#0091ff"}
                  >
                    <a
                      className="icon"
                      onClick={() => openModal(typeConfirms.KICK_MEMBERS)}
                    >
                      <FaTrash size={20} color="red" />
                    </a>
                  </Tooltip>
                </>
              )}
          </div>
        </div>
      </Modal>
      {openModalConfirm && (
        <GeneralModal
          open={openModalConfirm}
          onCancel={closeModal}
          content={contentConfirmModal}
          title={titleConfirmModal}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};
export { MemberModal };
