import { LoadingOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal, Select, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import apiFactory from "../../../api";
import { useInfoUser } from "../../../store/UserStore";
import { GeneralModal } from "../GeneralModal";

const CreateCouncilModal = ({
  isModalOpen,
  cancelModal,
  title,
  selectedCouncil,
  setCouncilList,
  councilList,
  isActive,
  setPagination,
  pagination,
  setCouncilSearch,
  setHighLight,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModalResetPW, setIsOpenModalResetPW] = useState(null);
  const [isOpenModalConfirmSave, setIsOpenModalConfirmSave] = useState(null);
  const [memberList, setMemberList] = useState([
    { councilMemberId: uuidv4(), councilRole: "MEMBER" },
  ]);
  const [teacherList, setTeacherList] = useState([]);
  const [choseTeacherList, setChoseTeacherList] = useState([]);

  const [retainTeacherList, setRetainTeacherList] = useState([]);
  const { languageMap } = useInfoUser();
  const [council, setCouncil] = useState({
    ...selectedCouncil,
  });

  const [form] = Form.useForm();

  const preventSubmitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleResetPassword = async () => {
    setIsOpenModalResetPW(false);

    try {
      const rs = await apiFactory.userApi.resetPassword(council?.userId);

      if (rs?.status === 200) {
        toast.success("Reset password was successful");
      } else {
        toast.success("Reset password unsuccessfully");
      }
    } catch (error) {
      console.error("Error reset password:", error);
    }
  };

  const handleConfirmCreateUser = async () => {
    setIsOpenModalResetPW(false);
    form.submit();
  };

  const onFinish = async (values) => {
    if (
      memberList?.findIndex((member) => member?.councilRole === "HOST") === -1
    ) {
      toast.error("Have to have at least 1 teacher with role is host");
      return;
    }

    if (values?.year < 2020 || values?.year > 2050) {
      toast.error("Topic year has to be less than 2050 and greater than 2020");
      return;
    }

    setIsLoading(true);

    const result = await apiFactory.councilApi.storeCouncil({
      councilId: selectedCouncil?.councilId ? selectedCouncil?.councilId : null,
      councilName: values?.councilName,
      year: values?.year,
      status: values?.status,
      teacherList: memberList,
    });

    if (selectedCouncil?.councilId) {
      if (pagination?.current === 1) {
        const updatedCouncilList = councilList?.map(
          ({ isNew, ...rest }) => rest
        );

        const councilIndex = updatedCouncilList?.findIndex(
          (council) => council?.councilId === selectedCouncil?.councilId
        );

        updatedCouncilList[councilIndex] = {
          ...result?.data,
          isNew: true,
        };

        setCouncilList(
          [...updatedCouncilList]?.filter((user) => {
            if (user?.status === "ACTIVE" && isActive) return user;

            if (user?.status === "INACTIVE" && !isActive) return user;
          })
        );
      } else {
        setPagination((prev) => ({
          ...prev,
          current: 0,
        }));

        setCouncilSearch((prev) => ({
          ...prev,
          page: 1,
        }));

        setHighLight(result?.data?.councilId);
      }
    } else {
      if (pagination?.current === 1) {
        setCouncilList((prev) => [{ ...result?.data, isNew: true }, ...prev]);
      } else {
        setPagination((prev) => ({
          ...prev,
          current: 0,
        }));

        setCouncilSearch((prev) => ({
          ...prev,
          page: 1,
        }));

        setHighLight(result?.data?.councilId);
      }
    }

    cancelModal();
    setIsLoading(false);
  };

  const addMember = () => {
    setMemberList([
      ...memberList,
      {
        councilMemberId: uuidv4(),
        councilRole: "MEMBER",
      },
    ]);
  };

  const minusMember = (councilMemberId) => {
    const memberIndex = memberList?.findIndex(
      (m) => m?.councilMemberId === councilMemberId
    );
    memberList?.splice(memberIndex, 1);
    setMemberList([...memberList]);
  };

  const onChangeMember = (teacherId, member) => {
    const teacherIndex = teacherList?.findIndex(
      (teacher) => teacher?.value === teacherId
    );

    const memberIndex = memberList?.findIndex(
      (m) => m?.councilMemberId === member?.councilMemberId
    );

    memberList[memberIndex] = {
      councilMemberId: memberList[memberIndex]?.councilMemberId,
      key: teacherList?.[teacherIndex]?.label,
      value: teacherList?.[teacherIndex]?.value,
      councilRole: "MEMBER",
      memberId: teacherList?.[teacherIndex]?.value,
    };

    setMemberList([...memberList]);
    setChoseTeacherList([...choseTeacherList, member]);
  };

  const onChangeMemberRole = (value, member) => {
    const memberIndex = memberList?.findIndex(
      (m) => m?.councilMemberId === member?.councilMemberId
    );

    if (value?.target?.checked) {
      memberList?.forEach((member) => (member.councilRole = "MEMBER"));
    }

    memberList[memberIndex].councilRole = value?.target?.checked
      ? "HOST"
      : "MEMBER";
    setMemberList([...memberList]);
  };

  const generateMemberList = useCallback(() => {
    const memberIds = memberList?.map((member) => member?.value);

    const outOfTeacherList = retainTeacherList?.filter(
      (teacher) => !memberIds.includes(teacher?.value)
    )?.length;

    return (
      <div className="flex flex-col gap-[10px] mt-[5px]">
        {outOfTeacherList > 0 ? (
          <Button
            shape="circle"
            className="bg-[#2a56b9]  text-[white]"
            size="small"
            onClick={addMember}
            icon={<FaPlus className="text-[18px]" />}
          />
        ) : (
          <div className="h-[24px]" />
        )}
        {memberList?.map((member) => {
          return (
            <div className="flex justify-between items-center" key={member?.id}>
              <div className="w-[70%]">
                <Select
                  size={"middle"}
                  value={member?.value}
                  options={retainTeacherList}
                  onChange={(value) => onChangeMember(value, member)}
                />
              </div>
              <Checkbox
                disabled={!member?.value}
                checked={member?.councilRole === "HOST"}
                onChange={(value) => onChangeMemberRole(value, member)}
              />
              <Button
                shape="circle"
                className="bg-[#2a56b9]  text-[white]"
                size="small"
                onClick={() => minusMember(member?.councilMemberId)}
                icon={<FaMinus className="text-[18px]" />}
              />
            </div>
          );
        })}
      </div>
    );
  }, [memberList, retainTeacherList]);

  const fetchTeacherList = async () => {
    try {
      setIsLoading(true);
      const result = await apiFactory.userApi.listPerson({
        role: "TEACHER",
      });

      if (result?.status === 200) {
        setTeacherList(
          result?.data?.map((r) => ({
            value: r?.userId,
            label: r?.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherList();
  }, []);

  useEffect(() => {
    if (!selectedCouncil) return;

    setMemberList(
      selectedCouncil?.memberList?.map((member) => ({
        ...member,
        label: member?.name,
        value: member?.userId,
        memberId: member?.userId,
      }))
    );
  }, [selectedCouncil]);

  useEffect(() => {
    setRetainTeacherList(
      teacherList?.map((teacher) => {
        if (
          memberList?.findIndex(
            (member) => member?.value === teacher?.value
          ) === -1
        )
          return teacher;

        return { ...teacher, disabled: true };
      })
    );
  }, [memberList, teacherList]);

  return (
    <Modal
      width="500px"
      open={isModalOpen}
      footer={false}
      closeIcon={false}
      onCancel={cancelModal}
      title={title}
      closable={true}
    >
      <Form
        onFinish={onFinish}
        autoComplete="off"
        layout="horizontal"
        form={form}
        onKeyDown={preventSubmitOnEnter}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          span: 20,
        }}
        initialValues={council}
      >
        <Form.Item
          name="councilName"
          label={languageMap?.["as.menu.user.update.name"] ?? "Council name"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
          normalize={(value) => (value ? value.toUpperCase() : "")}
        >
          <Input maxLength={30} type="text" />
        </Form.Item>
        <Form.Item
          name="year"
          label={languageMap?.["as.menu.user.update.name"] ?? "Year"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          <NumericFormat customInput={Input} />
        </Form.Item>
        <Form.Item
          name="memberList"
          label={languageMap?.["as.menu.user.update.name"] ?? "Member list"}
          rules={[
            {
              required: true,
              message:
                languageMap?.["as.menu.user.message.required"] ?? "Required!",
            },
          ]}
        >
          {generateMemberList()}
        </Form.Item>
        <Form.Item
          name="status"
          label={languageMap?.["as.menu.user.update.active"] ?? "Status"}
          className={`${council?.isActive ? "hidden" : ""}`}
        >
          <Select
            size={"middle"}
            options={[
              {
                value: true,
                label:
                  languageMap?.["as.menu.user.update.activeSelect"] ?? "Active",
              },
              {
                value: false,
                label:
                  languageMap?.["as.menu.user.update.inactiveSelect"] ??
                  "Inactive",
              },
            ]}
          />
        </Form.Item>
        {isLoading ? (
          <div className="flex justify-center mt-[10px]">
            <Spin
              indicator={<LoadingOutlined className="loader-icon" spin />}
            />
          </div>
        ) : (
          <div className="flex gap-[10px] justify-center mt-[10px]">
            <Button type="primary" className="bg-[grey]" onClick={cancelModal}>
              {languageMap?.["as.menu.user.update.btnCancel"] ?? "Cancel"}
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              className="bg-[#4db74d]"
              // onClick={form.submit()}
            >
              {selectedCouncil
                ? languageMap?.["as.menu.user.update.btnUpdate"] ?? "Update"
                : languageMap?.["as.menu.user.update.btnCreate"] ?? "Create"}
            </Button>
          </div>
        )}
      </Form>
      {isOpenModalResetPW && (
        <GeneralModal
          title={
            languageMap?.["as.menu.user.resetPassword"] ??
            "You want to confirm reset password"
          }
          onCancel={() => setIsOpenModalResetPW(false)}
          open={isOpenModalResetPW}
          onConfirm={handleResetPassword}
        />
      )}
      {isOpenModalConfirmSave && (
        <GeneralModal
          title={
            languageMap?.["as.menu.user.confirmExists"] ??
            "This user already exists in the system. Do you want to add or edit this user?"
          }
          onCancel={() => setIsOpenModalConfirmSave(false)}
          open={isOpenModalConfirmSave}
          onConfirm={handleConfirmCreateUser}
        />
      )}
    </Modal>
  );
};
export { CreateCouncilModal };
