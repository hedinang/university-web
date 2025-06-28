import { LoadingOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";
import { GeneralModal } from "../GeneralModal";

const CreateSponsorshipModal = ({
  isModalOpen,
  cancelModal,
  title,
  selectedSponsorship,
  setSponsorshipList,
  sponsorshipList,
  sponsorshipSearch,
  setPagination,
  pagination,
  setSponsorshipSearch,
  setHighLight,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalConfirmSave, setIsOpenModalConfirmSave] = useState(null);
  const [topicList, setTopicList] = useState([]);
  const [councilList, setCouncilList] = useState([]);
  const { languageMap } = useInfoUser();
  const [council, setCouncil] = useState({
    ...selectedSponsorship,
  });

  const [form] = Form.useForm();

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleConfirmCreateUser = async () => {
    // setIsOpenModalResetPW(false);
    form.submit();
  };

  const onFinish = async (values) => {
    setIsLoading(true);

    const result = await apiFactory.sponsorshipApi.storeSponsorship({
      sponsorshipId: selectedSponsorship?.sponsorshipId,
      ...values,
    });

    if (selectedSponsorship?.sponsorshipId) {
      if (pagination?.current === 1) {
        const sponsorshipIndex = sponsorshipList?.findIndex(
          (sponsorship) =>
            sponsorship?.sponsorshipId === selectedSponsorship?.sponsorshipId
        );

        sponsorshipList[sponsorshipIndex] = {
          ...result?.data,
          isNew: true,
        };

        setSponsorshipList(
          [...sponsorshipList]?.filter(
            (item) => item?.status === sponsorshipSearch?.search?.status
          )
        );
      } else {
        setPagination((prev) => ({
          ...prev,
          current: 0,
        }));

        setSponsorshipSearch((prev) => ({
          ...prev,
          page: 1,
        }));

        setHighLight(result?.data?.sponsorshipId);
      }
    } else {
      if (pagination?.current === 1) {
        setSponsorshipList((prev) => [
          { ...result?.data, isNew: true },
          ...prev,
        ]);
      } else {
        setPagination((prev) => ({
          ...prev,
          current: 0,
        }));

        setSponsorshipSearch((prev) => ({
          ...prev,
          page: 1,
        }));

        setHighLight(result?.data?.councilId);
      }
    }

    cancelModal();
    setIsLoading(false);
  };

  const fetchCouncilList = async () => {
    try {
      setIsLoading(true);
      const result = await apiFactory.councilApi.getAll({});

      if (result?.status === 200) {
        setCouncilList(
          result?.data?.map((r) => ({
            value: r?.councilId,
            label: r?.councilName,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopicList = async () => {
    try {
      setIsLoading(true);
      const result = await apiFactory.topicApi.getAll({});

      if (result?.status === 200) {
        setTopicList(
          result?.data?.map((r) => ({
            value: r?.topicId,
            label: r?.title,
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
    fetchTopicList();
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
        initialValues={council}
      >
        <Form.Item
          name="topicId"
          label={languageMap?.["as.menu.user.update.name"] ?? "Topic"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Select size={"middle"} options={topicList} />
        </Form.Item>
        <Form.Item
          name="councilId"
          label={languageMap?.["as.menu.user.update.name"] ?? "Council"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <Select size={"middle"} options={councilList} />
        </Form.Item>
        <Form.Item
          name="budget"
          label={languageMap?.["as.menu.user.update.active"] ?? "Budget"}
          className={`${council?.isActive ? "hidden" : ""}`}
        >
          <NumericFormat customInput={Input} />
        </Form.Item>
        <Form.Item
          name="status"
          label={languageMap?.["as.menu.user.update.active"] ?? "Status"}
          className={`${council?.isActive ? "hidden" : ""}`}
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
              {
                value: "ACTIVE",
                label:
                  languageMap?.["as.menu.user.update.activeSelect"] ?? "Active",
              },
              {
                value: "INACTIVE",
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
              htmlType="submit"
              type="primary"
              className="bg-[#4db74d]"
              // onClick={form.submit()}
            >
              {selectedSponsorship
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
export { CreateSponsorshipModal };
