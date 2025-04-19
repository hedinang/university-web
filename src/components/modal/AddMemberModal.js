import { useInfoUser } from "../../store/UserStore";
import { Button, Form, Input, Modal, Spin } from "antd";
import { Directory } from "../select/directory/Directory";
import { LoadingOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { DirectoryProvider } from "../select/directory/DirectoryContext";
import { uniq } from "lodash";
import apiFactory from "../../api";
import { toast } from "react-toastify";
import { FaSave } from "react-icons/fa";
import { conversationType, MESSAGE_STATUS } from "../../config/Constant";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";
import { useChatContext } from "../../context/ChatContext";

const AddMemberModal = ({
  isModalOpen,
  isModalClose,
  conversationId,
  conversationName,
  screen,
  getListMemberInfo,
  orgList,
  setOrgList,
}) => {
  const { user, languageMap } = useInfoUser();
  const { consumeEvent } = useChatContext();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const isDisableStore = useMemo(() => {
    return (
      orgList
        ?.filter((org) => org?.type === "PERSON" && org?.checked)
        ?.map((org) => org?.objectId)?.length === 0
    );
  }, [orgList]);

  const closeModal = () => {
    isModalClose();
  };
  const resetModal = () => {
    orgList.forEach((org) => {org.checked=false})
    setOrgList([...orgList]);
    closeModal();
  };

  const onFinish = async () => {
    setIsLoading(true);

    const filteredOrgList = orgList?.filter(
      (org) => org?.type === "PERSON" && org?.checked
    );
    const listUserName = filteredOrgList
      ?.map((org) => org?.name)
      .filter(Boolean)
      .join(", ");
    const userIds = uniq(
      [...filteredOrgList?.map((org) => org?.objectId)].filter(Boolean)
    );

    if (screen === conversationType.NOTIFICATION) {
      closeModal();
    } else {
      await addMember(userIds, listUserName);
    }
  };

  const addMember = async (userIds, listUserName) => {
    const result =
      await apiFactory?.userConversationApi?.addMemberInConversation({
        conversationId: conversationId,
        userIds: userIds,
      });

    setIsLoading(false);

    if (result.status !== 200) {
      toast.error(result?.message);
    } else {
      const requestUuid = uuidv4();

      let item = {
        requestUuid,
        senderId: user?.userId,
        username: user?.name,
        content: listUserName,
        contentType: MESSAGE_STATUS.NEW_MEMBER,
        createdAt: moment().toISOString(),
        isSelf: true,
        conversationId: conversationId,
        newMemberCount: userIds.length,
      };

      consumeEvent(item);
      getListMemberInfo();
      toast.success(result?.message);
      closeModal();
      setOrgList([]);
    }
  };

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
      <Modal
          title={languageMap ? languageMap["modal.organization.add"] : "Add Member"}
          open={isModalOpen}
          onCancel={closeModal}
          footer={false}
          closeIcon={false}
          closable
          width={800}
      >
        <Form
            onFinish={onFinish}
            autoComplete="off"
            layout="horizontal"
            form={form}
            onKeyDown={preventSubmitOnEnter}
        >
          <Form.Item>
            <div className="flex items-center gap-[10px]">
              {[
                conversationType.NOTIFICATION,
                conversationType.CREATE_NOTIFICATION,
              ]?.includes(screen) ? (
                  <></>
              ) : (
                  <Input
                      value={conversationName}
                      type="text"
                      className="w-[50%]"
                      disabled
                  />
              )}
            </div>
          </Form.Item>
          <Form.Item name="userList">
            <DirectoryProvider
                orgList={orgList}
                setOrgList={setOrgList}
                isOpen={isModalOpen}
                conversationId={conversationId}
            >
              <Directory/>
            </DirectoryProvider>
          </Form.Item>
          <Form.Item className="mt-auto flex justify-end mr-3">
            {screen === conversationType.CREATE_NOTIFICATION ? (
                <></>
            ) : (
                <button type="submit" disabled={isDisableStore}>
                  {isLoading ? (
                      <Spin
                          indicator={<LoadingOutlined style={{fontSize: 24}} spin/>}
                      />
                  ) : (
                      <FaSave size={25} color="#539edf"/>
                  )}
                </button>
            )}
          </Form.Item>
        </Form>
        <div className="flex w-full justify-end">
          <Button type="primary" onClick={closeModal}> {languageMap?languageMap["confirm"]:"Confirm"}</Button>
          <Button className="ms-3" onClick={resetModal}> {languageMap?languageMap["modal.groupName.cancel"]:"Cancel"}</Button>

        </div>
      </Modal>
  );
};

export {AddMemberModal};
