import { Button, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import { useInfoUser } from "../../store/UserStore";
import "./style.scss";

const CommentModal = ({ isModalOpen, closeModal }) => {
  const { user, languageMap } = useInfoUser();
  const [isModalAvatarOpen, setIsModalAvatarOpen] = useState(false);

  const showAvatarModal = () => {
    setIsModalAvatarOpen(true);
  };
  const closeAvatarModal = () => {
    setIsModalAvatarOpen(false);
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
        // value={selectedQuestion?.title}
        // onChange={handleChange}
        // onDoubleClick={handlePreventAllEvents}
        // onBlur={handleBlur}
        // onKeyDown={handleKeyDown}
        autoSize={{ minRows: 3, maxRows: 5 }}
      />
      <div className="mt-[30px] flex justify-center gap-[10px]">
        <Button type="primary">Send</Button>
        <Button type="primary">Cancel</Button>
      </div>
    </Modal>
  );
};

export { CommentModal };
