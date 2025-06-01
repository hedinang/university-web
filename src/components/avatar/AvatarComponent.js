import Icon, {
  FileTextOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Image } from "antd";
import { useEffect, useState } from "react";
import { SiMinutemailer } from "react-icons/si";
import { IoLockClosedSharp } from "react-icons/io5";
import { conversationType } from "../../config/Constant";
import { ReceiveEmail } from "../../config/Icon";
import { getAvatar, getGroupAvatar } from "../../utils/Utils";
import { CustomAvatar } from "./CustomAvatar";

const AvatarComponent = ({ conversation }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [preview, setPreview] = useState(false);
  const showPrefixIcon = (conversation) => {
    switch (conversation?.type) {
      case conversationType.NOTIFICATION:
        if (conversation?.role === "HOST") {
          return <SiMinutemailer color="#32a5d8" size={32} />;
        } else {
          return <Icon component={ReceiveEmail} className="text-[32px]" />;
        }
      case conversationType.PERSONAL:
        const person = {
          avatar: conversation?.avatar,
          name: conversation?.name,
        };

        return <CustomAvatar person={person} />;
      case conversationType.SYSTEM:
        const system = {
          avatar: conversation?.avatar,
          name: conversation?.name,
        };

        return <CustomAvatar person={system} />;
      case conversationType.GROUP:
        if (conversation?.conversationStatus === "INACTIVE")
          return <IoLockClosedSharp color="#5d5555" />;

        return <UsergroupAddOutlined />;
      case conversationType.DRAFT:
        return <FileTextOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getBgColorAvatar = (conversation) => {
    switch (conversation?.type) {
      case conversationType.NOTIFICATION:
        return "bg-[white]";
      case conversationType.GROUP:
        if (conversation?.conversationStatus === "ACTIVE")
          return "bg-[#2a56b9] ";
        return "bg-[#dbdbdbf5]";
      case conversationType.DRAFT:
        return "bg-[#0B6478]";
      default:
        return "bg-[#2a56b9] ";
    }
  };

  useEffect(() => {
    if (conversation?.conversationId) {
      getGroupAvatar(
        conversation?.avatar,
        conversation?.conversationId,
        setAvatarUrl
      );
    }
  }, [conversation?.avatar, conversation?.conversationId]);

  return (
    <>
      <Avatar
        size={40}
        className={getBgColorAvatar(conversation)}
        icon={showPrefixIcon(conversation)}
        src={
          avatarUrl && conversation?.conversationStatus === "ACTIVE"
            ? avatarUrl
            : null
        }
        onClick={() => {
          if (avatarUrl) {
            setPreview(true);
          }
        }}
      />
      {preview && (
        <Image
          wrapperStyle={{
            display: "none",
          }}
          preview={{
            visible: preview,
            onVisibleChange: (visible) => setPreview(visible),
            // afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={avatarUrl}
        />
      )}
    </>
  );
};

export default AvatarComponent;
