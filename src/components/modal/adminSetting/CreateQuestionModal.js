import { LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";
import { GeneralModal } from "../GeneralModal";

const CreateQuestionModal = ({
  isModalOpen,
  cancelModal,
  title,
  selectedQuestion,
  questionSearch,
  questionList,
  setQuestionList,
  setPagination,
  pagination,
  setQuestionSearch,
  setHighLight,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const [isOpenModalConfirmSave, setIsOpenModalConfirmSave] = useState(null);
  const [teacherList, setTeacherList] = useState([]);
  const { languageMap } = useInfoUser();
  const [question, setQuestion] = useState({
    ...selectedQuestion,
  });

  const [form] = Form.useForm();

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleConfirmCreateUser = async () => {
    setIsOpenModalResetPW(false);
    form.submit();
  };

  const onFinish = async (values) => {
    setIsLoading(true);
    const result = await apiFactory.questionApi.storeQuestion({
      ...values,
    });

    if (selectedQuestion?.questionId) {
      if (pagination?.current === 1) {
        const questionIndex = questionList?.findIndex(
          (question) => question?.questionId === selectedQuestion?.questionId
        );

        questionList[questionIndex] = {
          ...result?.data,
          isNew: true,
        };

        setQuestionList(
          [...questionList]?.filter(
            (item) => item?.status === questionSearch?.search?.status
          )
        );
      } else {
        setPagination((prev) => ({
          ...prev,
          current: 0,
        }));

        setQuestionSearch((prev) => ({
          ...prev,
          page: 1,
        }));

        setHighLight(result?.data?.questionId);
      }
    } else {
      if (pagination?.current === 1) {
        setQuestionList((prev) => [{ ...result?.data, isNew: true }, ...prev]);
      } else {
        setPagination((prev) => ({
          ...prev,
          current: 0,
        }));

        setQuestionSearch((prev) => ({
          ...prev,
          page: 1,
        }));

        setHighLight(result?.data?.questionId);
      }
    }

    cancelModal();
    setIsLoading(false);
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
    fetchTeacherList();
  }, []);

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
        initialValues={question}
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
          className={`${question?.isActive ? "hidden" : ""}`}
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
              {selectedQuestion
                ? languageMap?.["as.menu.user.update.btnUpdate"] ?? "Update"
                : languageMap?.["as.menu.user.update.btnCreate"] ?? "Create"}
            </Button>
          </div>
        )}
      </Form>
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
