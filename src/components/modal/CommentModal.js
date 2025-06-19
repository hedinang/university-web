import { Button, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import apiFactory from "../../api";
import { useInfoUser } from "../../store/UserStore";
import "./style.scss";

const CommentModal = ({
  isModalOpen,
  closeModal,
  question,
  setCommentList,
}) => {
  const { user, languageMap } = useInfoUser();
  const [content, setContent] = useState("");
  const sendComment = async () => {
    const result = await apiFactory.commentApi.storeComment({
      questionId: question?.questionId,
      content: content,
    });

    if (result?.status !== 200) return;

    setCommentList((prev) => [...prev, result?.data]);
    closeModal();
  };

  return (
    <Modal
      title={languageMap ? languageMap["menu.profile.myProfile"] : "Comment"}
      open={isModalOpen}
      onCancel={closeModal}
      footer={[]}
    >
      <TextArea
        maxLength={100}
        value={content}
        onChange={(e) => {
          setContent(e?.target?.value);
        }}
        autoSize={{ minRows: 3, maxRows: 5 }}
      />
      <div className="mt-[30px] flex justify-center gap-[10px]">
        <Button type="primary" onClick={sendComment}>
          Send
        </Button>
        <Button type="primary">Cancel</Button>
      </div>
    </Modal>
  );
};

export { CommentModal };
