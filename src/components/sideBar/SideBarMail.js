import { ExportOutlined, LeftOutlined } from "@ant-design/icons";
import { IoPersonAddOutline } from "react-icons/io5";
import { MdLabelOutline, MdExitToApp } from "react-icons/md";

import { Drawer, Menu, Select, Tooltip } from "antd";
import { BsArrowClockwise, BsReply } from "react-icons/bs";
import { FaTrash } from "react-icons/fa6";
import { GoSearch } from "react-icons/go";
import { useChatContext } from "../../context/ChatContext";
import { useLabelStore } from "../../store/LabelStore";
import { useInfoUser } from "../../store/UserStore";
import "./style.scss";
import MenuContext from "antd/es/menu/MenuContext";
import { useMenuContext } from "../../context/MenuContext";
import { useMailContext } from "../../context/MailContext";
import { conversationType } from "../../config/Constant";

const SideBarMail = ({ isOpen, onClose }) => {
  const { labelList } = useLabelStore();
  const { languageMap } = useInfoUser();
  const {
    selectedConversation,
    onSearch,
    onChangeLabel,
    refreshChatMessage,
    openAddMemberModal,
    setIsMenu,
    showModalLabel,
    labelSelectedId,
    showModalAddCC,
  } = useMenuContext();

  const { isReply, setIsReply } = useMailContext();

  return (
    <Drawer
      placement={"right"}
      closable={false}
      onClose={onClose}
      open={isOpen}
      width={330}
      className="drawer-visible"
      title={
        <div className="flex flex-row">
          <span className="drawer-label">
            <a
              onClick={() => {
                setIsMenu(false);
              }}
            >
              <LeftOutlined className="drawer-btn-close" />
            </a>
            {languageMap?.["modal.menu"] ?? "Menu"}
          </span>
        </div>
      }
    >
      <Menu
        mode="inline"
        width={330}
        // inlineCollapsed={false}
        selectable={false}
        className="py-4 overflow-y-auto space-y-2 font-medium"
      >
        {!selectedConversation ||
        selectedConversation?.type === conversationType.DRAFT ? (
          <>
            <Menu.Item
              key="addMember"
              className="cursor-pointer"
              onClick={openAddMemberModal}
            >
              <div className="drawer-item">
                <div className="drawer-item-icon">
                  <IoPersonAddOutline size={20} color="black" />
                </div>
                <div className="ms-3">
                  <span>
                    {languageMap?.["modal.notification.sendTo"] ??
                      "Send to members"}
                  </span>
                </div>
              </div>
            </Menu.Item>

            <Menu.Item
              key="cc"
              className="cursor-pointer"
              onClick={showModalAddCC}
            >
              <div className="drawer-item">
                <div className="drawer-item-icon flex items-center">
                  <span className="icon text-black text-[18px] icon font-normal">
                    Cc
                  </span>
                </div>
                <div className="ms-3">
                  <span>{languageMap?.["modal.notification.cc"] ?? "Cc"}</span>
                </div>
              </div>
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="label">
              <div className="drawer-item">
                <div className="drawer-item-icon">
                  <MdLabelOutline style={{ fontSize: 20 }} color="black" />
                </div>
                <div className="flex ms-3">
                  <div className="flex flex-row justify-center items-center">
                    <Tooltip
                      placement="top"
                      title={
                        languageMap?.["menu.conversation.label"] ??
                        "Select labels"
                      }
                      color={"#0091ff"}
                    >
                      <Select
                        size={"small"}
                        placeholder=""
                        onChange={onChangeLabel}
                        allowClear
                        value={labelSelectedId}
                        style={{ width: 100 }}
                        options={labelList}
                      />
                    </Tooltip>
                    <div className="drawer-item-icon ml-1">
                      <Tooltip
                        placement="top"
                        title={
                          languageMap?.["menu.conversation.addLabel"] ??
                          "Add or edit labels"
                        }
                        color={"#0091ff"}
                      >
                        <div className="flex" onClick={showModalLabel}>
                          <ExportOutlined
                            style={{
                              fontSize: 20,
                            }}
                          />
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item
              key="reply"
              className="cursor-pointer"
              onClick={() => {
                setIsReply(!isReply);
                setIsMenu(false);
              }}
            >
              <div className="drawer-item">
                <div className="drawer-item-icon">
                  <BsReply size={20} color="black" />
                </div>
                <div className="ms-3">
                  <span>
                    {languageMap?.["modal.notification.reply"] ?? "Reply"}
                  </span>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item
              key="search"
              className="cursor-pointer"
              onClick={onSearch}
            >
              <div className="drawer-item">
                <div className="drawer-item-icon">
                  <GoSearch size={20} color="black" />
                </div>
                <div className="ms-3">
                  <span>
                    {languageMap?.["menu.conversation.searchMessage"] ??
                      "Search messages"}
                  </span>
                </div>
              </div>
            </Menu.Item>
            <Menu.Item
              key="refresh"
              className="cursor-pointer"
              onClick={refreshChatMessage}
            >
              <div className="drawer-item">
                <div className="drawer-item-icon">
                  <BsArrowClockwise size={20} color="black" />
                </div>
                <div className="ms-3">
                  <span>
                    {languageMap?.["menu.conversation.refresh"] ?? "Refresh"}
                  </span>
                </div>
              </div>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Drawer>
  );
};

export { SideBarMail };
