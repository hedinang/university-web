import { LeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Input, Spin } from "antd";
import { groupBy, sortBy } from "lodash";
import { useMemo } from "react";
import { FaArrowCircleRight } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { StoreOrgModal } from "../../../../components/modal/adminSetting/StoreOrgModal";
import { StoreUserModal } from "../../../../components/modal/adminSetting/StoreUserModal";
import { useInfoUser } from "../../../../store/UserStore";
import { useDirectoryContext } from "./DirectoryContext";
import { Organization } from "./Organization";
import { ItemInfo } from "./ItemInfo";
import { useNavigate } from "react-router-dom";
import { useSideBarStore } from "../../../../store/SideBarStore";

const CheckedList = () => {
  const { languageMap } = useInfoUser();
  const {
    onDeleteItem,
    orgList,
    isCheckedList,
    setIsCheckedList,
    isCheckedLoading,
    checkedList,
    isCreateOrgModal,
    setIsCreateOrgModal,
    checkedParent,
    isAddUserModal,
    setIsAddUserModal,
    onBackOrgRoot,
    isMobile,
  } = useDirectoryContext();

  const memberGroupList = useMemo(() => {
    return sortBy(Object.values(groupBy(checkedList, "objectId")), [
      (o) => {
        return o?.[0]?.position;
      },
    ]);
  }, [checkedList]);

  const itemNumber = useMemo(() => {
    if (memberGroupList?.length === 0) return "";

    return `${memberGroupList?.length} ${languageMap?.["as.menu.organization.items"] ?? "items"}`;
  }, [memberGroupList, languageMap]);

  return (
    <div
      className={
        isCheckedList
          ? "checked-list rounded-md w-[100%] overflow-x-scroll"
          : "non-checked-list rounded-md w-[100%] overflow-x-scroll"
      }
    >
      <div className="p-[12px] flex justify-center gap-[10px] items-center">
        {/* <button
          className="checked-list-icon items-start justify-start"
          onClick={() => setIsCheckedList(false)}
        >
          <FaArrowCircleLeft size={20} />
        </button> */}
        <div
          className="flex justify-between font-semibold w-full border-b text-lg"
          style={{
            zoom: isMobile && "0.8",
          }}
        >
          {/* {languageMap?.["modal.organization.checkedList"] ??
            "Selected member list"} */}
          <div className="flex gap-[10px] ">
            {!isMobile && checkedParent && (
              <button className="mb-[15px]" onClick={onBackOrgRoot}>
                <IoMdArrowRoundBack size={20} color="grey" />
              </button>
            )}

            {isMobile && (
              <button
                className="mb-[15px]"
                onClick={() => {
                  setIsCheckedList(false);
                }}
              >
                <IoMdArrowRoundBack size={20} color="grey" />
              </button>
            )}
            <Button
              type="primary"
              className="mb-[15px]"
              onClick={() => setIsCreateOrgModal(!isCreateOrgModal)}
            >
              {languageMap?.["as.menu.organization.btnCreate"] ??
                "Create organization"}
            </Button>
            {checkedParent && (
              <Button
                type="primary"
                className="bg-[#4db74d]"
                onClick={() => setIsAddUserModal(!isAddUserModal)}
              >
                {languageMap?.["as.menu.organization.btnAddUser"] ?? "Add user"}
              </Button>
            )}
          </div>
          <div className="text-[#005ae0] float-right text-[12px]">
            {itemNumber}
          </div>
        </div>
      </div>
      <div className="relative">
        <ItemInfo
          memberGroupList={memberGroupList}
          screenInfo={"CREATE_GROUP"}
          key={memberGroupList[0]?.id}
          onDeleteItem={onDeleteItem}
          isView={true}
        />
        {isCheckedLoading && (
          <div className="absolute top-[40%] w-full text-center">
            <Spin indicator={<LoadingOutlined classID="text-[35px]" spin />} />
          </div>
        )}
      </div>
    </div>
  );
};

const Directory = () => {
  const { languageMap } = useInfoUser();
  const {
    debouncedFilterOrg,
    isCheckedList,
    setIsCheckedList,
    conversationId,
    isCreateOrgModal,
    setIsCreateOrgModal,
    checkedParent,
    isAddUserModal,
    setIsAddUserModal,
    memberGroupList,
    setMemberGroupList,
    setAvailableUserList,
  } = useDirectoryContext();

  const onCloseCreateOrgModal = () => {
    setIsCreateOrgModal(false);
  };

  const onCloseAddUserModal = () => {
    memberGroupList?.forEach((mg) =>
      mg?.forEach((item) => (item.checked = false))
    );
    setMemberGroupList([...memberGroupList]);
    setAvailableUserList([...memberGroupList]);
    setIsAddUserModal(false);
  };

  return (
    <div className="p-[10px] flex rounded-lg !text-[12px] overflow-hidden">
      <div
        className={
          isCheckedList
            ? "non-box-search rounded-md mr-2 min-w-[30%]"
            : "box-search rounded-md pe-2 mt-0 mr-[12px]  min-w-[30%]"
        }
      >
        <div className="flex items-center mt-[13px] gap-[10px]">
          <Input
            placeholder={languageMap?.["menu.search.placeholder"] ?? "Search"}
            onChange={(event) => {
              debouncedFilterOrg(event.target.value.trim(), conversationId);
            }}
            prefix={<IoSearchOutline size={15} />}
            allowClear
          />
          <div
            className="checked-list-icon"
            onClick={() => setIsCheckedList(true)}
          >
            <FaArrowCircleRight size={20} />
          </div>
        </div>
        <Organization />
      </div>
      <CheckedList />
      {isCreateOrgModal && (
        <StoreOrgModal
          isModalOpen={isCreateOrgModal}
          cancelModal={onCloseCreateOrgModal}
          title={
            languageMap?.["as.menu.organization.titleCreate"] ??
            "Create organization"
          }
          parentId={checkedParent}
          languageMap={languageMap}
        />
      )}
      {isAddUserModal && (
        <StoreUserModal
          isModalOpen={isAddUserModal}
          cancelModal={onCloseAddUserModal}
          title={languageMap?.["as.menu.organization.btnAddUser"] ?? "Add user"}
          parentId={checkedParent}
        />
      )}
    </div>
  );
};

export { Directory };
