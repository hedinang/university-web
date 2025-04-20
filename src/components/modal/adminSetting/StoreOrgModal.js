import { LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Spin } from "antd";
import React, { useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { useDirectoryContext } from "../../../pages/adminSetting/OrgManagement/directory/DirectoryContext";
import {useInfoUser} from "../../../store/UserStore";

const StoreOrgModal = ({
  isModalOpen,
  cancelModal,
  title,
  parentId,
  removeOrg,
  languageMap,
}) => {

  const [isLoading, setIsLoading] = useState(false);
  const { orgList, setOrgList, checkedList, setCheckedList } =
    useDirectoryContext();
  const [organization, setOrganization] = useState({
    organizationId: removeOrg?.objectId,
    organizationName: removeOrg?.name,
    position: removeOrg?.position || 1,
  });

  const [form] = Form.useForm();

  const onCreate = async (request) => {
    const result =
      await apiFactory.organizationUserApi.createOrganization(request);

    if (result?.status !== 200) {
      toast.error(result?.message);
      return;
    }

    orgList?.push(result?.data);
    setOrgList([...orgList]);
    checkedList?.push(result?.data);
    setCheckedList([...checkedList]);
    cancelModal();
  };

  const onUpdate = async (request) => {
    let result;

    if (removeOrg?.type === "PERSON") {
      result = await apiFactory.organizationUserApi.updateUser(request);
    } else {
      result = await apiFactory.organizationUserApi.updateOrganization(request);
    }

    if (result?.status !== 200) {
      toast.error(result?.message);
      return;
    }

    const orgIndex = orgList?.findIndex(
      (org) => org?.objectId === result?.data?.objectId
    );
    orgList[orgIndex].name = result?.data?.name;
    setOrgList([...orgList]);

    const checkedIndex = checkedList?.findIndex(
      (checkedItem) => checkedItem?.objectId === result?.data?.objectId
    );
    checkedList[checkedIndex].name = result?.data?.name;
    checkedList[checkedIndex].position = result?.data?.position;
    setCheckedList([...checkedList]);
    cancelModal();
  };

  const onFinish = async (values) => {
    if (!values?.organizationName?.trim()) {
      toast.warn(languageMap?.["as.menu.organization.enterName"] ?? "please enter Organization name!");
      return;
    }
    if (values?.position <= 0) {
      toast.warn(languageMap?.["as.menu.organization.positionMust"] ?? "Position must be greater than 0!");
      return;
    }
    setIsLoading(true);

    try {
      const request = {
        ...values,
        organizationName: values?.organizationName?.trim(),
        parentId: parentId || removeOrg?.parentId,
        position: Math.max(1, values?.position),
      };

      if (removeOrg) {
        await onUpdate(request);
      } else {
        await onCreate(request);
      }
    } catch (error) {
      console.error("Error fetching alarm list data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      width="600px"
      open={isModalOpen}
      footer={false}
      closeIcon={false}
      onCancel={cancelModal}
      //   title={languageMap?.["modal.labelManagement.title"] ?? "Label management"}
      title={title}
      closable={true}
    >
      <div>
        <Form
          onFinish={onFinish}
          initialValues={organization}
          autoComplete="off"
          layout="vertical"
          form={form}
          // onKeyDown={preventSubmitOnEnter}
        >
          <Form.Item
            label={removeOrg?.type === "PERSON" ? languageMap?.["as.menu.organization.userId"] ?? "User id" : languageMap?.["as.menu.organization.orgId"] ?? "Organization id"}
            name="organizationId"
            rules={[
              {
                required: true,
                message: languageMap?.["as.menu.organization.organizationId"] ?? "Please input organization name!",
              },
            ]}
          >
            <Input
              type="text"
              className="w-[100%]"
              disabled={removeOrg}
              maxLength={30}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item
            label={removeOrg?.type === "PERSON" ? languageMap?.["as.menu.organization.fullName"] ?? "Full name" : languageMap?.["as.menu.organization.name"] ?? "Organization name"}
            name="organizationName"
            rules={[
              {
                required: true,
                message: languageMap?.["as.menu.organization.organizationName"] ?? "Please input organization name!",
              },
            ]}
            normalize={(value) => (value ? value.toUpperCase() : "")}
          >
            <Input
              // value={conversationName}
              disabled={removeOrg?.type === "PERSON"}
              type="text"
              className="w-[100%]"
              maxLength={50}
            />
          </Form.Item>
          <Form.Item
            label={languageMap?.["as.menu.organization.position"] ?? "Position"}
            name="position"
            // rules={[
            //   {
            //     required: true,
            //     message: "Please input organization id!",
            //   },
            // ]}
          >
            <Input
              type="text"
              className="w-[100%]"
              maxLength={5}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />
          </Form.Item>

          {isLoading ? (
            <div className="flex justify-center mt-[10px]">
              <Spin
                indicator={<LoadingOutlined className="loader-icon" spin />}
              />
            </div>
          ) : (
            <div className="flex gap-[10px] justify-center mt-[10px]">
              <Button
                type="primary"
                className="bg-[grey]"
                onClick={cancelModal}
              >
                {languageMap?.["as.menu.organization.btnCancel"] ?? "Cancel"}
              </Button>
              <Button type="primary" className="bg-[#4db74d]" htmlType="submit">
                {removeOrg ? languageMap?.["as.menu.organization.btnUpdate"] ?? "Update": languageMap?.["as.menu.organization.btnCreate"] ?? "Create"}
              </Button>
            </div>
          )}
        </Form>
      </div>
    </Modal>
  );
};
export { StoreOrgModal };
