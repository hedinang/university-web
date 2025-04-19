import { Button, Modal } from "antd";
import "./style.scss";
const GeneralModal = ({ title, content, onCancel, open, onConfirm }) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      closeIcon={null}
    >
      {content}
      <div className="general-modal">
        <Button
          className="button bg-[#ff4d4f] text-[white]"
          onClick={onConfirm}
        >
          Ok
        </Button>
        <Button className="button bg-[#1677ff] text-[white]" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export { GeneralModal };
