import { useDirectoryContext } from "./DirectoryContext";
import { Avatar, Button, Col, Row, Tooltip } from "antd";
import { FiTrash } from "react-icons/fi";
import { join, slice } from "lodash";
import { FaKey } from "react-icons/fa";
import Checkbox from "antd/es/checkbox/Checkbox";
import { useChatContext } from "../../../../context/ChatContext";
import { formatTime } from "../../../../utils/formatTime";
import { getAvatar, getColor, getColorFromInitial } from "../../../../utils/Utils"
import { REACTION_TYPE_LABEL } from "../../../../config/Constant";

const BasicMemberInfo = ({
  languageMap,
  memberGroup,
  screenInfo,
  onChangeMembersCheckBox,
  isHost,
  isMe,
  isAdmin,
  hasRead,
  lastSeenTs,
  isSelectedCombobox,
  seenTsInMessage,
  isView,
  isCC,
  isModaReaction,
  reactionOfUser,
}) => {
  const { onDeleteItem } = useDirectoryContext();
  const chatContext = useChatContext();
  const { selectedConversation } = chatContext || {};

  const filterReaction = REACTION_TYPE_LABEL?.find((item) =>
    reactionOfUser?.includes(item?.type)
  );

  const getClassNameByRole = () => {
    if (isHost) {
      return "bg-[red] w-[40px] h-[40px]";
    } else if (isAdmin) {
      return "bg-[#007fff] w-[40px] h-[40px]";
    } else return "bg-[#87d068] w-[40px] h-[40px]";
  };

  const getIconFromScreenInfo = () => {
    switch (screenInfo) {
      case "CREATE_GROUP": {
        return (
          <Button
            className="bg-[#e00d0d] text-[white]"
            onClick={() => onDeleteItem(memberGroup?.[0])}
            icon={<FiTrash className="text-[18px]" />}
          ></Button>
        );
      }
      case "VIEW_MEMBER_IN_GROUP": {
        if (isHost) {
          return <FaKey className="bi bi-key text-[18px] align-icon" />;
        } else if (
          selectedConversation?.role === "HOST" &&
          selectedConversation?.type !== "NOTIFICATION"
        ) {
          return (
            <>
              {!isModaReaction && (
                <Checkbox
                  checked={isSelectedCombobox}
                  value={memberGroup?.[0]}
                  onChange={(e) => {
                    onChangeMembersCheckBox(e?.target?.value);
                  }}
                />
              )}
            </>
          );
        } else {
          return <div />;
        }
      }
      case "READ_UNREAD": {
        return <div>{hasRead ? formatTime(lastSeenTs) : ""}</div>;
      }

      default: {
        return <div />;
      }
    }
  };

  const generatePath = (member) => {
    const pathName = join(
      slice(member?.paths, 0, member?.paths?.length)?.map(
        (paths) => paths?.name
      ),
      ">"
    );

    return (
      <div key={`${member?.userId}_${pathName}`} className="flex items-center">
        <div className="text-[14px]">
          <span className="text-[#d33b3d] p-[2px]">*</span>
          {pathName}
        </div>
      </div>
    );
  };

  const generateRoleNameChatting = () => {
    if (isHost) {
      return (
        <span className="text-xs">
          {languageMap?.["chat.role.conversation.host"] ?? "Host"}
        </span>
      );
    } else if (isAdmin) {
      return (
        <span className="text-xs">
          {languageMap?.["chat.role.conversation.admin"] ?? "Admin"}
        </span>
      );
    } else
      return (
        <span className="text-xs">
          {languageMap?.["chat.role.conversation.member"] ?? "Member"}
        </span>
      );
  };

  const generateRoleNameNotification = () => {
    if (isHost) {
      return (
        <span>
          {languageMap?.["chat.role.conversation.noti.sender"] ?? "Sender"}
        </span>
      );
    } else if (isCC) {
      return (
        <span>{languageMap?.["chat.role.conversation.noti.cc"] ?? "CC"}</span>
      );
    } else {
      return (
        <span>
          {languageMap?.["chat.role.conversation.noti.recipient"] ??
            "Recipient"}
        </span>
      );
    }
  };

  return (
    <Row gutter={[8, 0]} className="w-full mb-5 items-center">
      <Col span={3} className="flex items-center justify-center">
        <Avatar
          className={getClassNameByRole()}
          style={{
            backgroundColor: getColorFromInitial(memberGroup?.[0]?.name),
            color: getColor(memberGroup?.[0]?.name),
          }}
          src={getAvatar(memberGroup?.[0])}
        >
          {memberGroup?.[0]?.name?.[0]}
        </Avatar>
      </Col>
      <Col span={18} className="items-center justify-center">
        <Row gutter={[8, 0]} className="items-center justify-center text-sm">
          <Col span={isModaReaction ? 17 : 6}>
            <span
              className={
                isMe
                  ? "font-bold text-[#0091FF] text-[14px]"
                  : "font-bold text-[14px]"
              }
            >
              {isMe
                ? languageMap?.["chat.role.conversation.you"] ?? "You"
                : memberGroup?.[0]?.name}
            </span>
            <br />
            {!isView &&
              (selectedConversation?.type !== "NOTIFICATION"
                ? generateRoleNameChatting()
                : generateRoleNameNotification())}
          </Col>
          {!isModaReaction ? (
            <Col span={17}>
              {memberGroup?.map((member) => generatePath(member))}
            </Col>
          ) : (
            <Col className="flex justify-end" span={7}>
              <div className="text-[20px]"> {filterReaction?.label}</div>
            </Col>
          )}
        </Row>
      </Col>
      {/* {seenTsInMessage && (
        <Col span={1} className="text-xs flex justify-end items-center">
          {formatTime(seenTsInMessage)}
        </Col>
      )} */}

      <Col
        span={seenTsInMessage ? 2 : 3}
        className="flex items-center justify-end"
      >
        {getIconFromScreenInfo()}
      </Col>
    </Row>
  );
};

export { BasicMemberInfo };
