import { Button, Image, Modal, Upload } from "antd";
import "./style.scss";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import apiFactory from "../../api";
import { useInfoUser } from "../../store/UserStore";
import { getAvatar } from "../../utils/Utils";

const AvatarModal = ({ isModalOpen, closeModal, isModal }) => {
  const { user, languageMap, updateUser } = useInfoUser();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);

  const beforeUpload = () => {
    return false;
  };


  const upload = async (newFileList) => {

    if (
      isModal &&
      (fileList.length === 0 || !fileList[fileList.length - 1]?.name)
    ) {
      return toast.error("Please upload a image!");
    }
    const req = {
      base64: await getBase64(
        isModal ? fileList[0].originFileObj : newFileList[0].originFileObj,
      ),
      fileName: isModal?fileList[0].name:newFileList[0]?.name,
    };
    apiFactory.userApi.upload(req).then((res) => {

      if (res.status === 200) {
        toast.success("Avatar uploaded successfully.");
      }
      user.avatar = res.data;
      updateUser({ ...user });
    });
    closeModal();
  };

  const handlePreview = async (file) => {

    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleChange = ({ fileList: newFileList }) => {
    const isImage =
      newFileList[newFileList.length - 1]?.type.includes("image");

    if (!isImage) {
      return toast.error("You can only upload image!");
    }
    const isMaxAvatarSize = newFileList[newFileList.length - 1]?.size / 1024 / 1024 < 10;

    if (!isMaxAvatarSize) {
      return toast.error("Image must smaller than 10MB!");
    }

    if (!isModal) {
      upload(newFileList);
      return;
    }

    if (newFileList.length > 0) {
      newFileList = [newFileList[newFileList.length - 1]];
    }
    setFileList(newFileList);
  };

  const uploadButton = (
    <Button icon={<UploadOutlined />}>
      {" "}
      {languageMap ? languageMap["menu.avatarModal.upload"] : "upload"}
    </Button>
  );

  const uploadAvatar = () => {
    return (
      <>
        <div className="mt-2 font-normal">
          {languageMap
            ? languageMap["menu.avatar.textCustom"]
            : "Upload new custom avatar:"}
        </div>
        <Upload
          className="mt-2 upload-list-inline"
          showUploadList={{ showRemoveIcon: false }}
          listType="picture"
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={beforeUpload}
          onPreview={handlePreview}
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
        {previewImage && (
          <Image
            wrapperStyle={{
              display: "none",
            }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => setPreviewOpen(visible),
              afterOpenChange: (visible) => !visible && setPreviewImage(""),
            }}
            src={previewImage}
          />
        )}
      </>
    );
  };

  useEffect(() => {

    if (user?.avatar) {
      setFileList([{ url: getAvatar(user) }]);
    }

    if (!isModal) {
      setFileList([]);
    }
  }, []);

  return (
    <>
      {!isModal ? (
        <> {uploadAvatar()}</>
      ) : (
        <Modal
          title={
            languageMap ? languageMap["menu.avatarModal.title"] : "My Avatar"
          }
          open={isModalOpen}
          onOk={upload}
          onCancel={closeModal}
          okText={
            languageMap
              ? languageMap["modal.labelManagement.saveButton"]
              : "Save"
          }
          cancelText={
            languageMap ? languageMap["modal.groupName.cancel"] : "Cancel"
          }
        >
          {uploadAvatar()}
        </Modal>
      )}
    </>
  );
};

export { AvatarModal };
