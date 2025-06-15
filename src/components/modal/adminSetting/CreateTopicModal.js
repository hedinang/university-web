import { LoadingOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Modal, Select, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";

const CreateTopicModal = ({
  isModalOpen,
  cancelModal,
  title,
  selectedTopic,
  setTopicList,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [teacherList, setTeacherList] = useState([]);
  const [studentList, setStudentList] = useState([]);

  const { languageMap } = useInfoUser();
  const [topic, setTopic] = useState({
    ...selectedTopic,
    startTime: selectedTopic?.startTime
      ? dayjs(selectedTopic?.startTime, "YYYY-MM-DD")
      : null,
    endTime: selectedTopic?.endTime
      ? dayjs(selectedTopic?.endTime, "YYYY-MM-DD")
      : null,
  });

  const [form] = Form.useForm();

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const onFinish = async (values) => {
    setIsLoading(true);

    const result = await apiFactory.topicApi.storeTopic({
      ...values,
      topicId: selectedTopic?.topicId,
      approverId: selectedTopic?.approverId,
    });

    if (selectedTopic?.topicId) {
      setTopicList((prev) => {
        const prevIndex = prev?.findIndex(
          (p) => p?.topicId === selectedTopic?.topicId
        );

        if (prevIndex === -1) return prev;
        prev[prevIndex] = result?.data;
        return [...prev];
      });
    } else {
      setTopicList((prev) => [...prev, result?.data]);
    }

    cancelModal();
    setIsLoading(false);
  };

  const fetchStudentList = async () => {
    try {
      setIsLoading(true);
      const result = await apiFactory.userApi.listPerson({
        role: "STUDENT",
      });

      if (result?.status === 200) {
        setStudentList(
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
    fetchStudentList();
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
        initialValues={topic}
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
          name="proposerId"
          label={languageMap?.["as.menu.user.update.name"] ?? "Student"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Select size={"middle"} options={studentList} disabled />
        </Form.Item>
        <Form.Item
          name="topicType"
          label={languageMap?.["as.menu.user.update.name"] ?? "Topic type"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Select
            size={"middle"}
            options={[
              { label: "PROJECT", value: "PROJECT" },
              { label: "A", value: "A" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="startTime"
          label={languageMap?.["as.menu.user.update.name"] ?? "Start time"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <DatePicker
            format="DD-MM-YYYY"
            placeholder={languageMap?.["as.selectDate"] ?? "Select start time"}
          />
        </Form.Item>
        <Form.Item
          name="endTime"
          label={languageMap?.["as.menu.user.update.name"] ?? "End time"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <DatePicker
            format="DD-MM-YYYY"
            placeholder={languageMap?.["as.selectDate"] ?? "Select end time"}
          />
        </Form.Item>
        <Form.Item
          name="progress"
          label={languageMap?.["as.menu.user.update.name"] ?? "Progress"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <NumericFormat customInput={Input} />
        </Form.Item>
        <Form.Item
          name="score"
          label={languageMap?.["as.menu.user.update.name"] ?? "Score"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <NumericFormat customInput={Input} />
        </Form.Item>
        <Form.Item
          name="status"
          label={languageMap?.["as.menu.user.update.name"] ?? "Status"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Select
            size={"middle"}
            options={[
              { label: "ACCEPTED", value: "ACCEPTED" },
              { label: "CANCEL", value: "CANCEL" },
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
            <Button htmlType="submit" type="primary" className="bg-[#4db74d]">
              {selectedTopic
                ? languageMap?.["as.menu.user.update.btnUpdate"] ?? "Update"
                : languageMap?.["as.menu.user.update.btnCreate"] ?? "Create"}
            </Button>
          </div>
        )}
      </Form>
    </Modal>
  );
};
export { CreateTopicModal };
