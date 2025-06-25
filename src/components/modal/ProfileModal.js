import { Avatar, Input, Modal, Spin } from "antd";
import React, { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { HiSave } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import apiFactory from "../../api";
import { useInfoUser } from "../../store/UserStore";

import "./style.scss";
import { LoadingOutlined } from "@ant-design/icons";
import { AvatarModal } from "./AvatarModal";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";

const ProfileModal = ({ isModalOpen, closeModal }) => {
  const { user, languageMap, updateUser, updateLanguageMap } = useInfoUser();
  const [isEditMood, setIsEditMood] = useState(false);
  const [isEditPhone, setIsEditPhone] = useState(false);
  const [profile, setProfile] = useState(user);
  const [isModalAvatarOpen, setIsModalAvatarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeProfile = (e, field) => {
    setProfile({
      ...profile,
      mood: field === "mood" ? e?.target?.value : profile?.mood,
      phone: field === "phone" ? e?.target?.value : profile?.phone,
    });
  };

  const onStoreProfile = async (field) => {
    if (field === "mood") {
      setIsEditMood(false);
    } else {
      setIsEditPhone(false);
    }

    const params = {
      language: user?.language,
      phone: profile?.phone,
      mood: profile?.mood,
    };

    const me = await apiFactory.userApi.saveMe(params);

    if (me?.status === 200) {
      updateUser(me?.data?.user);
      updateLanguageMap(me?.data?.languageMap);
    } else {
      // openNotificationError(me?.message);
      updateUser(null);
    }
  };

  const removeAvatar = async () => {
    setIsLoading(true);
    const result = await apiFactory.userApi.remove();

    if (result?.status === 200) {
      updateUser({ ...user, avatar: null });
      // openNotificationSuccess(
      //   result?.message
      // );
    } else {
      // openNotificationError(result?.message);
    }

    setIsLoading(false);
  };

  const closeAvatarModal = () => {
    setIsModalAvatarOpen(false);
  };

  return (
    <Modal
      title={languageMap?.["menu.profile.myProfile"] ?? "My Profile"}
      open={isModalOpen}
      onCancel={closeModal}
      footer={[]}
    >
      <div className="relative flex flex-col gap-[10px]">
        <div className="flex items-center gap-[20px]">
          <div className="w-[100px] font-semibold">
            {languageMap?.["menu.profile.avatar"] ?? "Avatar"}:
          </div>
          <div>
            <div className="relative avatarWrapper inline-block ">
              <Avatar
                style={{
                  backgroundColor: getColorFromInitial(user?.name[0]),
                  color: getColor(user?.name[0]),
                }}
                size={80}
                src={user?.avatar ? getAvatar(user) : null}
                setIsLoading
              >
                {user?.name[0]}
              </Avatar>
              <button
                onClick={() => setIsModalAvatarOpen(true)}
                className="avatarWrapper-update cursor-pointer"
                data-xf-click="overlay"
              >
                <span>{user?.avatar ? "Edit" : "Add"}</span>
              </button>
            </div>
          </div>
          {user?.avatar && (
            <button onClick={removeAvatar}>
              <MdDelete size={20} color="#ef4444" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-[20px]">
          <div className="w-[100px] font-semibold">
            {languageMap?.["menu.profile.id"] ?? "ID"}:
          </div>
          <div>{user?.userId} </div>
        </div>
        <div className="flex items-center gap-[20px]">
          <div className="w-[100px] font-semibold">
            {languageMap?.["menu.profile.name"] ?? "Name"}:
          </div>
          <div>{user?.name} </div>
        </div>
        <div className="flex items-center gap-[20px]">
          <div className="w-[100px] font-semibold">
            {languageMap?.["menu.profile.email"] ?? "Email"}:
          </div>
          <div>{user?.email}</div>
        </div>
        <div className="flex items-center gap-[20px]">
          <div className="w-[100px] font-semibold">
            {languageMap?.["menu.profile.tel"] ?? "Tel"}:
          </div>
          <Input
            className="w-[300px]"
            value={profile?.phone}
            disabled={!isEditPhone}
            maxLength={17}
            onChange={(e) => onChangeProfile(e, "phone")}
            onKeyPress={(event) => {
              if (!/[0-9.+-]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
          {isEditPhone ? (
            <button onClick={() => onStoreProfile("phone")}>
              <HiSave size={20} color="#2a56b9" />
            </button>
          ) : (
            <button onClick={() => setIsEditPhone(true)}>
              <AiFillEdit size={20} color="#333333" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-[20px]">
          <div className="w-[100px] font-semibold">
            {languageMap?.["menu.profile.status"] ?? "Status"}:
          </div>
          <Input
            className="w-[300px]"
            value={profile?.mood}
            disabled={!isEditMood}
            onChange={(e) => onChangeProfile(e, "mood")}
          />
          {isEditMood ? (
            <button onClick={() => onStoreProfile("mood")}>
              <HiSave size={20} color="#2a56b9" />
            </button>
          ) : (
            <button onClick={() => setIsEditMood(true)}>
              <AiFillEdit size={20} color="#333333" />
            </button>
          )}
        </div>
        {isLoading && (
          <div className="absolute top-[30%] w-full flex justify-center">
            <Spin
              indicator={<LoadingOutlined className="text-[35px]" spin />}
            />
          </div>
        )}
        {isModalAvatarOpen && (
          <AvatarModal
            closeModal={closeAvatarModal}
            isModalOpen={isModalAvatarOpen}
            isModal={true}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
    </Modal>
  );
};

export { ProfileModal };
