import { Avatar, Button, Table, Spin, Modal } from "antd";
import { useEffect, useState } from "react";
import { FiTrash } from "react-icons/fi";
import { RiOrganizationChart, RiPencilFill } from "react-icons/ri";
import { toast } from "react-toastify";
import apiFactory from "../../../../api";
import { GeneralModal } from "../../../../components/modal/GeneralModal";
import {
  getAvatar,
  getColor,
  getColorFromInitial,
} from "../../../../utils/Utils";
import { useDirectoryContext } from "./DirectoryContext";
import { StoreOrgModal } from "../../../../components/modal/adminSetting/StoreOrgModal";
import { useInfoUser } from "../../../../store/UserStore";
import { ROLE_TYPE } from "../../../../config/Constant";

const ItemInfo = ({ memberGroupList, onDeleteItem }) => {
  const { languageMap } = useInfoUser();
  const [isRemoveOpenModal, setIsRemoveOpenModal] = useState(false);
  const [isEditOpenModal, setIsEditOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const { orgList, setOrgList, checkedList, setCheckedList } =
    useDirectoryContext();

  const showConfirm = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa ${record?.type === "PERSON" ? "người dùng" : "tổ chức"} này không?`,
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: () => handleOnConfirm(record),
    });
  };

  const handleOnConfirm = async (record) => {
    setIsLoading(true);
    try {
      const request = {
        objectId: record?.objectId,
        parentId: record?.parentId,
      };

      if (record?.type === "PERSON") {
        await removeUser(request);
      } else {
        await removeOrganization(request);
      }

      setOrgList([...orgList]);
      setCheckedList([...checkedList]);
      closeModalConfirm();
    } catch (error) {
      console.error("Error fetching alarm list data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (request) => {
    const result = await apiFactory.organizationUserApi.removeUser(request);

    if (result?.status !== 200) {
      toast.error(result?.data?.message);
      return;
    }

    updateListSuccessfully(request?.objectId, request?.parentId);
  };

  const removeOrganization = async (request) => {
    const result =
      await apiFactory.organizationUserApi.removeOrganization(request);

    if (result?.status !== 200) {
      toast.error(result?.data?.message);
      return;
    }

    result?.data?.forEach((e) =>
      updateListSuccessfully(e?.objectId, e?.parentId)
    );
  };

  const updateListSuccessfully = (objectId, parentId) => {
    const orgIndex = orgList?.findIndex(
      (org) => org?.objectId === objectId && org?.parentId === parentId
    );

    if (orgIndex > -1) {
      orgList?.splice(orgIndex, 1);
    }

    const checkedIndex = checkedList?.findIndex(
      (org) => org?.objectId === objectId && org?.parentId === parentId
    );

    if (checkedIndex > -1) {
      checkedList?.splice(checkedIndex, 1);
    }
  };

  const closeModalConfirm = () => {
    setIsRemoveOpenModal(false);
  };

  const columns = [
    {
      title: "",
      dataIndex: "avatar",
      // align: "center",
      width: "100px",
      render: (text, record) =>
        record.type === "PERSON" ? (
          <Avatar
            className="bg-[#87d068] w-[40px] h-[40px]"
            style={{
              backgroundColor: getColorFromInitial(record.name),
              color: getColor(record.name),
            }}
            src={getAvatar(record)}
          >
            {record.name?.[0]}
          </Avatar>
        ) : (
          <div className="flex justify-center items-center w-[40px] h-[40px]">
            <RiOrganizationChart size={25} color="#4db74d" />
          </div>
        ),
    },
    {
      title: languageMap?.["as.menu.organization.table.name"] ?? "Name",
      dataIndex: "name",
      render: (text) => <span className="font-bold text-[14px]">{text}</span>,
    },
    {
      title: languageMap?.["as.menu.organization.table.position"] ?? "Position",
      dataIndex: "position",
      align: "center",
      render: (text) => <span className="font-bold text-[14px]">{text}</span>,
    },
    {
      title: languageMap?.["as.menu.organization.table.action"] ?? "Actions",
      key: "actions",
      align: "center",
      render: (text, record) => (
        <div className="flex gap-[10px] justify-center">
          <Button
            className="bg-[#fa6914] text-[white]"
            onClick={() => setIsEditOpenModal(record)}
            icon={<RiPencilFill className="text-[18px]" />}
          />
          <Button
            disabled={record.name === ROLE_TYPE.SYSTEM}
            className="bg-[#e00d0d] text-[white]"
            onClick={() => showConfirm(record)}
            icon={<FiTrash className="text-[18px]" />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full" style={{ zoom: isMobile && "0.8" }}>
      <Table
        columns={columns}
        dataSource={memberGroupList?.map((group) => ({
          ...group[0],
        }))}
        rowKey={(record) => record.objectId}
        pagination={false}
        scroll={
          isMobile
            ? {
                x: 400,
                y: 450,
              }
            : {
                // x: 500,
                y: 700,
              }
        }
      />
      {isEditOpenModal && (
        <StoreOrgModal
          isModalOpen={isEditOpenModal}
          cancelModal={() => setIsEditOpenModal(false)}
          title={
            languageMap?.["as.menu.organization.titleUpdate"] ??
            "Update organization"
          }
          removeOrg={{ ...isEditOpenModal }}
          languageMap={languageMap}
        />
      )}
      {isLoading && (
        <div className="absolute top-[40%] w-full text-center">
          <Spin />
        </div>
      )}
    </div>
  );
};

export { ItemInfo };
