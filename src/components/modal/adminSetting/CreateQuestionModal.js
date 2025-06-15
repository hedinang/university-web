import { LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";
import { GeneralModal } from "../GeneralModal";

const CreateQuestionModal = ({
  isModalOpen,
  cancelModal,
  title,
  selectedCouncil,
  setUserList,
  userList,
  isActive,
  setQuestionList,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const [isOpenModalConfirmSave, setIsOpenModalConfirmSave] = useState(null);
  const [memberList, setMemberList] = useState([
    { councilMemberId: uuidv4(), councilRole: "MEMBER" },
  ]);
  const [teacherList, setTeacherList] = useState([]);
  const { languageMap } = useInfoUser();
  const [council, setCouncil] = useState({
    ...selectedCouncil,
  });

  const [form] = Form.useForm();

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
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

  const onFinish = async (values) => {
    setIsLoading(true);

    const result = await apiFactory.questionApi.storeQuestion(values);

    setQuestionList((prev) => [...prev, result?.data]);

    cancelModal();
    setIsLoading(false);
  };

  const fetchCouncilList = async () => {
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

  useEffect(() => {
    fetchCouncilList();
    fetchTeacherList();
  }, []);

  useEffect(() => {
    if (!selectedCouncil) return;

    console.log(selectedCouncil);

    setMemberList(
      selectedCouncil?.memberList?.map((member) => ({
        ...member,
        label: member?.name,
        value: member?.userId,
        memberId: member?.userId,
      }))
    );
  }, [selectedCouncil]);

  return (
    <Modal
      width="500px"
      open={isModalOpen}
      footer={false}
      closeIcon={false}
      onCancel={cancelModal}
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
        <Form.Item
          name="title"
          label={languageMap?.["as.menu.user.update.name"] ?? "Title"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Input maxLength={30} type="text" />
        </Form.Item>
        <Form.Item
          name="content"
          label={languageMap?.["as.menu.user.update.name"] ?? "Content"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <TextArea
            className="task-name w-full"
            maxLength={100}
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
        </Form.Item>
        <Form.Item
          name="recipientId"
          label={languageMap?.["as.menu.user.update.active"] ?? "Recipient"}
          className={`${council?.isActive ? "hidden" : ""}`}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Select size={"middle"} options={teacherList} />
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
            <Button htmlType="submit" type="primary" className="bg-[#4db74d]">
              {selectedCouncil
                ? languageMap?.["as.menu.user.update.btnUpdate"] ?? "Update"
                : languageMap?.["as.menu.user.update.btnCreate"] ?? "Create"}
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
export { CreateQuestionModal };
