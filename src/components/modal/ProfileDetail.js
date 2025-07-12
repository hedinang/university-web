import { Avatar, Modal } from "antd";
import { useEffect, useState } from "react";
import apiFactory from "../../api";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";

const ProfileDetail = ({
  viewProfileId,
  title = "Thông tin cá nhân cơ bản",
  cancelModal,
}) => {
  const [person, setPerson] = useState();
  const fetchPerson = async () => {
    try {
      //   setIsLoading(true);
      const result = await apiFactory.userApi.getPerson({
        userId: viewProfileId,
      });

      if (result?.status === 200) {
        setPerson(result?.data);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      //   setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerson();
  }, [viewProfileId]);

  return (
    <Modal
      width="500px"
      open={viewProfileId}
      footer={false}
      closeIcon={false}
      onCancel={cancelModal}
      //   title={title}
      closable={true}
    >
      <div className="flex flex-col items-center gap-[15px]">
        <Avatar
          style={{
            backgroundColor: getColorFromInitial(
              person?.name?.[0] || person?.username?.[0]
            ),
            color: getColor(person?.name?.[0] || person?.username?.[0]),
          }}
          size={70}
          src={person?.avatar ? getAvatar(person) : null}
        >
          {person?.name?.[0] || person?.username?.[0]}
        </Avatar>
        <div className="font-semibold text-[18px]">{person?.name}</div>
      </div>
      <div className="flex gap-[2px] items-center mt-[20px]">
        <div className="font-semibold text-[15px] w-[120px]">Vai trò:</div>
        <div>{person?.roleCode}</div>
      </div>
      <div className="flex gap-[2px] items-center">
        <div className="font-semibold text-[15px] w-[120px]">
          Số điện thoại:
        </div>
        <div>{person?.roleCode}</div>
      </div>
      <div className="flex gap-[2px] items-center">
        <div className="font-semibold text-[15px] w-[120px]">Email:</div>
        <div>{person?.roleCode}</div>
      </div>
      {person?.roleCode === "STUDENT" && (
        <>
          <div className="flex gap-[2px] items-center">
            <div className="font-semibold text-[15px] w-[120px]">
              Mã số sinh viên:
            </div>
            <div>{person?.roleCode}</div>
          </div>
          <div className="flex gap-[2px] items-center">
            <div className="font-semibold text-[15px] w-[120px]">Lớp:</div>
            <div>{person?.roleCode}</div>
          </div>
          <div className="flex gap-[2px] items-center">
            <div className="font-semibold text-[15px] w-[120px]">Lớp:</div>
            <div>{person?.roleCode}</div>
          </div>
        </>
      )}
      {person?.roleCode === "TEACHER" && (
        <div className="flex gap-[2px] items-center">
          <div className="font-semibold text-[15px] w-[120px]">Khoa:</div>
          <div>{person?.roleCode}</div>
        </div>
      )}
    </Modal>
  );
};

export { ProfileDetail };
