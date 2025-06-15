import { Avatar, Modal } from "antd";
import { useState } from "react";
import { useInfoUser } from "../../store/UserStore";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";
import "./style.scss";

const ProfileModal = ({ isModalOpen, closeModal }) => {
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
      title={languageMap ? languageMap["menu.profile.myProfile"] : "My Profile"}
      open={isModalOpen}
      onCancel={closeModal}
      footer={[]}
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 ">
        <div className="mt-3 font-semibold ">
          {languageMap ? languageMap["menu.profile.avatar"] : "Avatar"}:
        </div>
        <div className="mt-3 flex">
          <div className="relative avatarWrapper inline-block ">
            <Avatar
              style={{
                backgroundColor: getColorFromInitial(user?.name[0]),
                color: getColor(user?.name[0]),
              }}
              size={80}
              src={user?.avatar ? getAvatar(user) : null}
            >
              {user?.name[0]}
            </Avatar>
          </div>
        </div>
        <div className="mt-3 font-semibold">ID:</div>
        <div className="mt-3">{user?.userId} </div>
        <div className="mt-3  font-semibold">
          {languageMap ? languageMap["menu.profile.name"] : "Name"}:
        </div>
        <div className="mt-3">{user?.name} </div>
        <div className="mt-3  font-semibold">Tel:</div>
        <div className="mt-3 ">{user?.phone} </div>
      </div>

      {/*{isModalAvatarOpen && (*/}
      {/*  <AvatarModal*/}
      {/*    closeModal={closeAvatarModal}*/}
      {/*    isModalOpen={isModalAvatarOpen}*/}
      {/*  />*/}
      {/*)}*/}
    </Modal>
  );
};

export { ProfileModal };
