import { LoadingOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
} from "antd";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { ROLE_TYPE } from "../../../config/Constant";
import { useInfoUser } from "../../../store/UserStore";
import { GeneralModal } from "../GeneralModal";

const CreateCouncilModal = ({
  isModalOpen,
  cancelModal,
  title,
  editingUser,
  setUserList,
  userList,
  isActive,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const [isOpenModalConfirmSave, setIsOpenModalConfirmSave] = useState(null);
  const { languageMap } = useInfoUser();
  const [council, setCouncil] = useState({
    ...editingUser,
    memberList: [
      {
        councilId: "6183e1e4-660d-4783-8df5-156a5d143f28",
        userId: "8f713281-5722-4530-bb1d-563c33583a50",
        name: "TRẦN THỊ BBBB",
        status: "ACTIVE",
        councilRole: "MEMBER",
      },
    ],
    roleCode: editingUser ? editingUser?.roleCode : "STUDENT",
    birthday: editingUser?.birthday ? dayjs(editingUser?.birthday) : null,
  });

  const [form] = Form.useForm();

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onCreate = async (request) => {
    try {
      const result = await apiFactory.userApi.createUser(request);

      if (result?.status !== 200) {
        toast.error(result?.message);
        return;
      }

      if (!isActive) {
        const filteredUserList = userList?.filter(
          (user) => user?.userId !== result?.data?.userId
        );
        setUserList([...filteredUserList]);
        cancelModal();
        return;
      }

      if (userList?.some((user) => user?.userId === result?.data?.userId)) {
        const updatedUserList = userList?.map((user) => {
          if (user?.userId === result?.data?.userId) {
            return {
              ...result?.data,
              birthday: result?.data?.birthday
                ? dayjs(result?.data?.birthday)?.format("YYYY-MM-DD")
                : null,
              isNew: true,
            };
          }

          return { ...user, isNew: false };
        });

        setUserList([...updatedUserList]);
      } else {
        const updatedUserList = userList?.map(({ isNew, ...rest }) => rest);

        updatedUserList?.unshift({
          ...result?.data,
          birthday: result?.data?.birthday
            ? dayjs(result?.data?.birthday)?.format("YYYY-MM-DD")
            : null,
          isNew: true,
        });

        setUserList([...updatedUserList]);
      }

      cancelModal();
    } catch (error) {}
  };

  const onUpdate = async (request) => {
    const result = await apiFactory.userApi.updateUser(request);

    if (result?.status !== 200) {
      toast.error(result?.message);
      return;
    }

    const updatedUserList = userList?.map(({ isNew, ...rest }) => rest);

    const userIndex = updatedUserList?.findIndex(
      (usr) => usr?.username === request?.username
    );

    updatedUserList[userIndex] = {
      ...result?.data,
      birthday: result?.data?.birthday
        ? dayjs(result?.data?.birthday)?.format("YYYY-MM-DD")
        : null,
      isNew: true,
    };

    setUserList(
      [...updatedUserList]?.filter((user) => {
        if (user?.status === "ACTIVE" && isActive) return user;

        if (user?.status === "INACTIVE" && !isActive) return user;
      })
    );
    cancelModal();
  };

  const handleResetPassword = async () => {
    setIsOpenModalResetPW(false);

    try {
      const rs = await apiFactory.userApi.resetPassword(council?.userId);

      if (rs?.status === 200) {
        toast.success("Reset password was successful");
      } else {
        toast.success("Reset password unsuccessfully");
      }
    } catch (error) {
      console.error("Error reset password:", error);
    }
  };

  const handleConfirmCreateUser = async () => {
    setIsOpenModalResetPW(false);
    form.submit();
  };

  const handleCheckExistedUser = async () => {
    try {
      const rs = await apiFactory.userApi.checkExistedUser(
        form.getFieldValue("userId")
      );

      if (rs?.status === 200) {
        if (rs?.data) {
          setIsOpenModalConfirmSave(true);
        } else {
          form.submit();
        }
      }
    } catch (error) {
      cancelModal();
    }
  };

  const onFinish = async (values) => {
    if (values?.roleCode?.trim() !== ROLE_TYPE.SYSTEM) {
      if (!values?.username?.trim()) {
        toast.warn("Please enter username");
        return;
      }

      if (!values?.name?.trim()) {
        toast.warn("Please enter Name");
        return;
      }

      const regex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d-]+$/;

      // if (!regex.test(values?.username?.trim())) {
      //   toast.warn("UserId must contain both letters and numbers");
      //   return;
      // }
    }

    setIsLoading(true);

    const formatValue = {
      ...values,
      userId: values?.userId?.trim(),
      name: values?.name?.trim(),
    };

    try {
      if (editingUser) {
        await onUpdate(formatValue);
      } else {
        await onCreate(formatValue);
      }
    } catch (error) {
      console.error("Error fetching alarm list data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const optionsRoleCode = useMemo(
    () => [
      {
        value: ROLE_TYPE.STUDENT,
        label: languageMap?.["as.menu.user.roleCode.normal"] ?? "STUDENT",
      },
      {
        value: ROLE_TYPE.TEACHER,
        label: languageMap?.["as.menu.user.roleCode.admin"] ?? "TEACHER",
      },
      {
        value: ROLE_TYPE.ADMIN,
        label: languageMap?.["as.menu.user.roleCode.system"] ?? "ADMIN",
      },
    ],
    [editingUser, languageMap]
  );

  return (
    <Modal
      width="500px"
      open={isModalOpen}
      footer={false}
      closeIcon={false}
      onCancel={cancelModal}
      //   title={languageMap?.["modal.labelManagement.title"] ?? "Label management"}
      title={title}
      closable={true}
    >
      <Form
        onFinish={onFinish}
        autoComplete="off"
        layout="horizontal"
        form={form}
        onKeyDown={preventSubmitOnEnter}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 20,
        }}
        initialValues={council}
      >
        {/* <Form.Item
          name="userId"
          label={languageMap?.["as.menu.user.update.userID"] ?? "User ID"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
            {
              pattern: /^[A-Za-z0-9-]+$/,
              message:
                languageMap?.["as.menu.user.message.requiredUserId"] ??
                "Only letters, numbers, and hyphens (-) are allowed!",
            },
          ]}
          normalize={(value) => (value ? value.toUpperCase() : "")}
        >
          <Input maxLength={30} type="text" disabled={editingUser} />
        </Form.Item> */}
        <Form.Item
          name="councilName"
          label={languageMap?.["as.menu.user.update.name"] ?? "Council name"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
          normalize={(value) => (value ? value.toUpperCase() : "")}
        >
          <Input maxLength={30} type="text" />
        </Form.Item>
        <Form.Item
          name="year"
          label={languageMap?.["as.menu.user.update.name"] ?? "Year"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
          normalize={(value) => (value ? value.toUpperCase() : "")}
        >
          {/* <Input maxLength={30} type="text" /> */}
          <DatePicker picker="year" />
        </Form.Item>
        <Form.Item
          name="memberList"
          label={languageMap?.["as.menu.user.update.name"] ?? "Member list"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
          normalize={(value) => (value ? value.toUpperCase() : "")}
        >
          <div className="flex justify-between">
            <div className="w-[70%]">
              <Select
                size={"middle"}
                defaultValue={true}
                options={[
                  {
                    value: true,
                    label:
                      languageMap?.["as.menu.user.update.activeSelect"] ??
                      "Active",
                  },
                  {
                    value: false,
                    label:
                      languageMap?.["as.menu.user.update.inactiveSelect"] ??
                      "Inactive",
                  },
                ]}
              />
            </div>
            <Checkbox />
          </div>
        </Form.Item>
        <Form.Item
          name="status"
          label={languageMap?.["as.menu.user.update.active"] ?? "Status"}
          className={`${council?.isActive ? "hidden" : ""}`}
        >
          <Select
            size={"middle"}
            defaultValue={true}
            options={[
              {
                value: true,
                label:
                  languageMap?.["as.menu.user.update.activeSelect"] ?? "Active",
              },
              {
                value: false,
                label:
                  languageMap?.["as.menu.user.update.inactiveSelect"] ??
                  "Inactive",
              },
            ]}
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
            <Button type="primary" className="bg-[grey]" onClick={cancelModal}>
              {languageMap?.["as.menu.user.update.btnCancel"] ?? "Cancel"}
            </Button>
            <Button
              type="primary"
              className="bg-[#4db74d]"
              onClick={() =>
                editingUser ? form.submit() : handleCheckExistedUser()
              }
            >
              {editingUser
                ? languageMap?.["as.menu.user.update.btnUpdate"] ?? "Update"
                : languageMap?.["as.menu.user.update.btnCreate"] ?? "Create"}
            </Button>
            <Button
              type="primary"
              className="bg-[#4096FF]"
              onClick={() => setIsOpenModalResetPW(true)}
            >
              {languageMap?.["as.menu.user.update.btnResetPassword"] ??
                "Reset password"}
            </Button>
          </div>
        )}
      </Form>
      {isOpenModalResetPW && (
        <GeneralModal
          title={
            languageMap?.["as.menu.user.resetPassword"] ??
            "You want to confirm reset password"
          }
          onCancel={() => setIsOpenModalResetPW(false)}
          open={isOpenModalResetPW}
          onConfirm={handleResetPassword}
        />
      )}
      {isOpenModalConfirmSave && (
        <GeneralModal
          title={
            languageMap?.["as.menu.user.confirmExists"] ??
            "This user already exists in the system. Do you want to add or edit this user?"
          }
          onCancel={() => setIsOpenModalConfirmSave(false)}
          open={isOpenModalConfirmSave}
          onConfirm={handleConfirmCreateUser}
        />
      )}
    </Modal>
  );
};
export { CreateCouncilModal };
