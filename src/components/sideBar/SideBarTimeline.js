import {
  CloseOutlined,
  DownloadOutlined,
  PlusOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Image,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tabs,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { delay } from "lodash";
import moment from "moment-timezone";
import React, { memo, useEffect, useRef, useState } from "react";
import { AiTwotoneWarning } from "react-icons/ai";
import {
  IoChatboxEllipsesOutline,
  IoNotificationsOutline,
} from "react-icons/io5";
import { LuPenSquare } from "react-icons/lu";
import { MdDelete, MdOutlineReply } from "react-icons/md";
import { RiAttachment2 } from "react-icons/ri";
import { TbRefresh } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import apiFactory from "../../api";
import {
  chatSocket,
  closeAuthSocket,
  closeChatSocket,
} from "../../api/webSocket";
import {
  ATTRIBUTE_CODE,
  CHUNK_SIZE,
  COMMENT,
  MESSAGE_STATUS,
  WORK_ACTIVITY_CODE,
} from "../../config/Constant";
import { useWorkManagementContext } from "../../context/WorkManagementContext";
import UploadFile from "../../pages/workManagement/UploadFile";
import { useFakeMessageStore } from "../../store/FakeMessageStore";
import { useUploadFileStore } from "../../store/UploadFileStore";
import { useInfoUser } from "../../store/UserStore";
import { downloadFileOrPhoto } from "../../utils/DownloadFile";
import { formatTime } from "../../utils/formatTime";
import {
  getAvatar,
  getBase64,
  getColor,
  getColorFromInitial,
} from "../../utils/Utils";
import { PreviewVideoContent } from "../chat/PreviewVideoContent";
import { GeneralModal } from "../modal/GeneralModal";
import CommentHistoryModal from "../modal/workManagement/CommentHistoryModal";
import { ModalReplyComment } from "../modal/workManagement/ModalReplyComment";
import {
  ProgressInput,
  TaskNameInput,
} from "../../pages/workManagement/timeline/Timeline";

const { TextArea } = Input;

const TaskActivity = ({
  type,
  comment,
  memberList,
  workActivity,
  selectedTask,
  parentTaskActivity,
  getPropertyColorByType,
  getAvatarSrc,
  getMemberName,
  setCommentList,
  permissionCurrentUser,
  taskFormData,
  setTaskFormData,
  filesPreviewComment,
  setFilesPreviewComment,
  handleChangeUploadReply,
}) => {
  const [isModalReplyComment, setIsModalReplyComment] = useState(false);
  const [isModalCommentHistory, setIsModalCommentHistory] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [commentType, setCommentType] = useState("");
  const [isModalDeleteComment, setIsModalDeleteComment] = useState(false);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const { user, languageMap } = useInfoUser();
  const [token, setToken] = useState(Cookies.get("access_token"));
  const [indexCurrent, setIndexCurrent] = React.useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [abortController, setAbortController] = useState(null);
  const [isActionDisabled, setIsActionDisabled] = useState(false);

  const MentionedMembers = (mentionCodes) => {
    const members = memberList?.filter(
      (item) => item?.userCode !== comment?.userCode
    );
    const mentionedMembers = members?.filter((member) =>
      mentionCodes?.includes(member?.userCode)
    );

    if (mentionCodes?.length === members?.length) {
      return <span>All</span>;
    }

    return (
      <>
        {mentionedMembers?.map((member) => (
          <span key={member?.userCode}>{member?.name};</span>
        ))}
      </>
    );
  };

  const getStatusWorkActivity = () => {
    const workActive = workActivity?.find(
      (item) => item?.code === comment?.typeCode
    );
    const statusName =
      user?.language === "us"
        ? workActive?.enName
        : user?.language === "vn"
          ? workActive?.vnName
          : user?.language === "kr"
            ? workActive?.krName
            : null;

    let statusIcon = "";

    if (workActive?.code === WORK_ACTIVITY_CODE.ISSUE) {
      statusIcon = <AiTwotoneWarning size={16} className="mr-1" />;
    } else if (workActive?.code === WORK_ACTIVITY_CODE.ALARM) {
      statusIcon = <IoNotificationsOutline size={16} className="mr-1 mt-1" />;
    } else if (workActive?.code === WORK_ACTIVITY_CODE.ACTIVITY) {
      statusIcon = <IoChatboxEllipsesOutline size={16} className="mr-1 mt-1" />;
    }

    return (
      <>
        <span>{statusIcon}</span>
        <span>{statusName}</span>
      </>
    );
  };

  const openModalComment = (commentType) => {
    setCommentType(commentType);
    setIsModalReplyComment(true);
  };

  const deleteComment = async () => {
    try {
      if (!comment?.taskCode || !comment?.taskActivityCode) return;

      const request = {
        taskCode: comment.taskCode,
      };
      const response = await apiFactory.taskActivityApi.deleteTaskActivity(
        comment.taskActivityCode,
        request
      );

      if (response?.status !== 200) return;

      if (type === "PARENT") {
        setCommentList((prevList) =>
          prevList.filter(
            (item) => item.taskActivityCode !== comment.taskActivityCode
          )
        );
      }

      if (type === "CHILD") {
        setCommentList((prevList) =>
          prevList.map((item) => {
            if (item.taskActivityCode === comment?.parentTaskActivityCode) {
              return {
                ...item,
                childTaskActivity: item.childTaskActivity.filter(
                  (itemChild) =>
                    itemChild.taskActivityCode !== comment?.taskActivityCode
                ),
              };
            }
            return item;
          })
        );
      }
    } catch (e) {
      console.error("delete comment fail:", e);
    }
  };

  useEffect(() => {
    const containerHeight = containerRef?.current?.clientHeight;
    const contentHeight = contentRef?.current?.scrollHeight;
    setShowToggle(contentHeight > containerHeight);
  }, [comment?.content, expanded]);

  return (
    <div
      className={type === "PARENT" ? "task-activity" : "task-activity ml-12"}
    >
      <div className="w-[100%]">
        <div className="task-activity-header justify-between flex">
          <div className="flex items-center gap-[6px]">
            <Avatar
              style={{
                backgroundColor: getPropertyColorByType("BACKGROUND", comment),
                color: getPropertyColorByType("COLOR", comment),
              }}
              src={getAvatarSrc(comment)}
            >
              {getMemberName(comment?.userCode)?.[0]}
            </Avatar>
            <span className="member-name">
              {getMemberName(comment?.userCode)}
            </span>
            <span className="text-[12px]">
              {formatTime(comment?.commentTime)}
            </span>
          </div>
          <div className="flex items-center text-[12px] font-bold">
            {getStatusWorkActivity()}
          </div>
        </div>
        <div className="task-activity-content flex justify-between">
          <div className="ms-10 comment-content max-w-[80%] flex-1">
            <div
              className={`content-container ${expanded ? "expanded" : "collapsed"}`}
              ref={containerRef}
            >
              {comment?.content?.replace(/<\/?[^>]+(>|$)/g, "")?.trim()
                ?.length > 0 && (
                <span
                  className="ql-editor content m-0 p-0 mb-1"
                  ref={contentRef}
                  dangerouslySetInnerHTML={{ __html: comment?.content }}
                />
              )}

              {comment?.attachFiles?.filter(
                (file) => !/\.(jpg|jpeg|png|gif|bmp|mp4)$/i.test(file?.path)
              )?.length > 0 && (
                <div
                  className="flex items-center text-[#004cff] hover:cursor-pointer hover:underline mt-1"
                  onClick={() => openModalComment("DETAIL")}
                >
                  <RiAttachment2 size={18} />
                  <span>
                    {comment?.attachFiles?.filter(
                      (file) =>
                        !/\.(jpg|jpeg|png|gif|bmp|mp4)$/i.test(file?.path)
                    )?.length + " "}
                    {languageMap?.["message.event.sendFile"] ?? "Attachments"}
                  </span>
                </div>
              )}

              {comment?.attachFiles?.filter((file) =>
                /\.(jpg|jpeg|png|gif|bmp)$/i.test(file?.path)
              )?.length > 0 && (
                <Image.PreviewGroup
                  preview={{
                    toolbarRender: (
                      _,
                      {
                        transform: { scale },
                        actions: {
                          onRotateLeft,
                          onRotateRight,
                          onZoomOut,
                          onZoomIn,
                          onReset,
                        },
                      }
                    ) => (
                      <Space
                        size={12}
                        className="toolbar-wrapper"
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <DownloadOutlined
                          disabled={isActionDisabled}
                          onClick={(e) => {
                            setIsActionDisabled(true);
                            const newAbortController = new AbortController();
                            setAbortController(newAbortController);

                            downloadFileOrPhoto(e, {
                              url: `${process.env.REACT_APP_FILE_STORE}/task/${selectedTask?.taskCode}${comment?.attachFiles[indexCurrent]?.path}`,
                              originalName:
                                comment?.attachFiles[indexCurrent]?.name,
                              setProgress: setDownloadProgress,
                              abortController: newAbortController,
                              setIsActionDisabled: setIsActionDisabled,
                            });
                          }}
                        />
                        <RotateLeftOutlined onClick={onRotateLeft} />
                        <RotateRightOutlined onClick={onRotateRight} />
                        <ZoomOutOutlined
                          disabled={scale === 1}
                          onClick={onZoomOut}
                        />
                        <ZoomInOutlined
                          disabled={scale === 50}
                          onClick={onZoomIn}
                        />
                        <UndoOutlined onClick={onReset} />
                      </Space>
                    ),
                    onChange: (index) => {
                      setIndexCurrent(index);
                    },
                  }}
                >
                  <div className="image-grid mt-2">
                    {comment?.attachFiles
                      ?.filter((file) =>
                        /\.(jpg|jpeg|png|gif|bmp)$/i.test(file?.path)
                      )
                      ?.map((file, index) => (
                        <Image
                          key={index}
                          width={200}
                          src={`${process.env.REACT_APP_FILE_STORE}/task/${selectedTask?.taskCode}${file?.path}?token=${token}`}
                          // className={`image-item ${comment?.attachFiles?.length === 1 ? "single-image" : ""}`}
                        />
                      ))}
                  </div>
                </Image.PreviewGroup>
              )}

              {comment?.attachFiles?.length > 0 &&
                comment?.attachFiles
                  ?.filter((file) => /\.(mp4)$/i.test(file?.path))
                  ?.map((file) => {
                    return (
                      <div
                        className="relative image-grid mt-2"
                        key={file?.path}
                      >
                        <PreviewVideoContent
                          content={file?.path}
                          selectedConversation={{
                            conversationId: selectedTask?.taskCode,
                          }}
                          isSelf={true}
                          file={{
                            originalName: file?.name,
                            volume: file?.size,
                            pathUrl: file?.path,
                            duration: file?.duration,
                            previewVideoImage: file?.previewVideoImage,
                            resourceId: file?.resourceId,
                          }}
                          path="task"
                        />
                      </div>
                    );
                  })}

              {showToggle && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="toggle-button"
                >
                  {expanded
                    ? languageMap?.["modal.message.showLess"] ?? "show less"
                    : languageMap?.["modal.message.showMore"] ?? "show more"}
                </button>
              )}
            </div>
          </div>
          <div>
            {type === "PARENT" && (
              <div className="flex items-center">
                <div
                  className={
                    !permissionCurrentUser?.includes("U")
                      ? "task-activity-button hidden"
                      : "task-activity-button cursor-pointer hover:text-[#275efe]"
                  }
                  onClick={() => openModalComment("REPLY")}
                >
                  <Tooltip
                    placement="left"
                    title={
                      languageMap?.["modal.sideBarTimeLine.comment.reply"] ??
                      "Reply comment"
                    }
                    color={"#0091ff"}
                  >
                    <MdOutlineReply className="text-[20px]" />
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mentions-comment ml-9 mt-1 text-[#0d56ec]">
          {comment?.mentionCodes?.length > 0 && (
            <> @{MentionedMembers(comment?.mentionCodes)}</>
          )}
        </div>
        <div className="flex flex-row items-center text-[12px] ml-8 mb-1 button-small">
          {comment?.userCode === user?.userCode &&
          permissionCurrentUser?.includes("U") ? (
            <>
              <Button
                type="text"
                className="font-medium"
                size="small"
                onClick={() => openModalComment("EDIT")}
              >
                {languageMap?.["modal.sideBarTimeLine.comment.edit"] ?? "Edit"}
              </Button>
              <Button
                type="text"
                className="font-medium"
                size="small"
                onClick={() => setIsModalDeleteComment(true)}
              >
                {languageMap?.["modal.sideBarTimeLine.comment.delete"] ??
                  "Delete"}
              </Button>
            </>
          ) : (
            //   comment?.attachFiles?.length > 0 ? (
            //   <>
            //     <Button
            //       type="text"
            //       className="font-medium"
            //       size="small"
            //       onClick={() => openModalComment("DETAIL")}
            //     >
            //       {languageMap?.["modal.sideBarTimeLine.comment.detail"] ??
            //         "Detail"}
            //     </Button>
            //   </>
            // ) :
            <></>
          )}

          {isModalReplyComment && (
            <ModalReplyComment
              type={commentType}
              currentComment={comment}
              isModalReplyComment={isModalReplyComment}
              setIsModalReplyComment={setIsModalReplyComment}
              memberList={memberList}
              getPropertyColorByType={getPropertyColorByType}
              getAvatarSrc={getAvatarSrc}
              getMemberName={getMemberName}
              workActivity={workActivity}
              selectedTask={selectedTask}
              parentTaskActivity={parentTaskActivity}
              setCommentList={setCommentList}
              filesPreviewComment={filesPreviewComment}
              setFilesPreviewComment={setFilesPreviewComment}
              handleChangeUpload={handleChangeUploadReply}
              taskFormData={taskFormData}
              setTaskFormData={setTaskFormData}
            />
          )}

          {comment?.isEdited && (
            <div
              className="edited"
              onClick={() => setIsModalCommentHistory(true)}
            >
              {languageMap?.["modal.sideBarTimeLine.comment.edited"] ??
                "Edited"}
            </div>
          )}
        </div>
      </div>
      {isModalCommentHistory && (
        <CommentHistoryModal
          taskActivityCode={comment?.taskActivityCode}
          isModalCommentHistory={isModalCommentHistory}
          setIsModalCommentHistory={setIsModalCommentHistory}
        />
      )}
      {isModalDeleteComment && (
        <GeneralModal
          title={
            languageMap?.["modal.sideBarTimeLine.comment.deleteComment"] ??
            "Delete comment"
          }
          content={
            languageMap?.["modal.sideBarTimeLine.comment.deleteSure"] ??
            "Are you sure you want to delete?"
          }
          onCancel={() => setIsModalDeleteComment(false)}
          open={isModalDeleteComment}
          onConfirm={deleteComment}
        />
      )}
    </div>
  );
};

const SideBarTimeline = ({
  isOpen,
  onClose,
  data,
  unwindTaskList,
  setUnwindTaskList,
  projectProgressList,
  onBlurStatus,
  changeDate,
  changeProgressRate,
  onBlurProgressRate,
  onBlurTask,
  handleAddMember,
  deleteTask,
  permissionCurrentUser,
  generateParticipant,
  currentProjectDetail,
}) => {
  const { workActivity, taskFormData, setTaskFormData } =
    useWorkManagementContext();
  const [commentList, setCommentList] = useState([]);
  const [lastTaskActivityTime, setLastTaskActivityTime] = useState(null);
  const [memberList, setMemberList] = useState([]);
  const [isMoreComment, setIsMoreComment] = useState(false);
  const lastObserver = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalComment, setIsModalComment] = useState(false);
  const [projectAttribute, setProjectAttribute] = useState([]);
  const { user, languageMap } = useInfoUser();
  const { responseChunkTask, setResponseChunkTask } = useFakeMessageStore(
    (state) => state
  );
  const {
    setUploadFilesTask,
    setUploadFilesComment,
    setUploadFilesReply,
    setAbortController,
  } = useUploadFileStore();
  const [pendingFilesTask, setPendingFilesTask] = useState([]);
  const [pendingFilesComment, setPendingFilesComment] = useState([]);
  const [pendingFilesReply, setPendingFilesReply] = useState([]);
  const [filesPreviewTask, setFilesPreviewTask] = useState([]);
  const [filesPreviewComment, setFilesPreviewComment] = useState([]);
  const [filesPreviewReply, setFilesPreviewReply] = useState([]);
  const [isUploadingTask, setIsUploadingTask] = useState(false);
  const [isUploadingComment, setIsUploadingComment] = useState(false);
  const [isUploadingReply, setIsUploadingReply] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState("");
  const sideBarRef = useRef(null);

  const location = useLocation();
  useEffect(() => {
    const searchParams = new URLSearchParams(location?.search);
    const type = searchParams?.get("type");
    if (type === "COMMENT") {
      setActiveTab("comment");
    } else {
      setActiveTab("task");
    }
  }, [location]);

  const getPropertyColorByType = (type, comment) => {
    const name = memberList.find(
      (item) => item?.userCode === comment?.userCode
    )?.name;
    if (type === "COLOR") {
      return getColor(name);
    }
    return getColorFromInitial(name);
  };

  const getAvatarSrc = (comment) => {
    const member = memberList.find(
      (item) => item?.userCode === comment?.userCode
    );
    if (member) {
      return getAvatar(member);
    }
    return null;
  };

  const getMemberName = (userCode) => {
    return memberList.find((member) => member?.userCode === userCode)?.name;
  };

  const getCommentList = async (lastTaskActivityTime = null) => {
    const request = {
      taskCode: data?.taskCode,
      lastTaskActivityTime: lastTaskActivityTime,
      limit: COMMENT.PARENT_LIMIT,
    };
    const response = await apiFactory.taskActivityApi.getList(request);
    if (response?.status === 200) {
      const newCommentList = response?.data?.map((item) => {
        return {
          ...item,
          isChildTaskActivityList:
            item?.childTaskActivity?.length >= COMMENT.CHILD_LIMIT,
        };
      });
      if (!lastTaskActivityTime) {
        setCommentList(newCommentList);
      } else {
        setCommentList([...commentList, ...newCommentList]);
      }

      setLastTaskActivityTime(
        response?.data[response?.data?.length - 1]?.commentTime
      );
      setIsLoading(false);

      if (response?.data?.length < COMMENT.PARENT_LIMIT) {
        setIsMoreComment(false);
      } else {
        setIsMoreComment(true);
      }
    }
  };

  const getMoreChildTask = async (childTaskActivity) => {
    const parentTaskActivityCode = childTaskActivity[0]?.parentTaskActivityCode;
    const lastChildTaskActiveTime =
      childTaskActivity[childTaskActivity.length - 1]?.commentTime;
    const request = {
      taskCode: data?.taskCode,
      parentTaskActivityCode: parentTaskActivityCode,
      lastTaskActivityTime: lastChildTaskActiveTime,
      limit: COMMENT.CHILD_LIMIT,
    };
    const response = await apiFactory.taskActivityApi.getChildList(request);
    if (response?.status === 200) {
      setCommentList((prevCommentList) => {
        return prevCommentList.map((comment) => {
          if (comment?.taskActivityCode === parentTaskActivityCode) {
            return {
              ...comment,
              isChildTaskActivityList: response?.data >= COMMENT.CHILD_LIMIT,
              childTaskActivity: [
                ...(comment?.childTaskActivity || []),
                ...response?.data,
              ],
            };
          }
          return comment;
        });
      });
    }
  };

  const lastCommentRef = (node) => {
    if (isLoading || !isMoreComment) return;
    if (lastObserver.current) lastObserver.current.disconnect();

    lastObserver.current = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting) {
        setIsLoading(true);
        await getCommentList(lastTaskActivityTime);
      }
    });

    if (node) lastObserver.current.observe(node);
  };

  const updateTaskAttribute = async (value, taskAttributeCode, typeCode) => {
    try {
      if (!data) return;

      const { projectCode, taskCode } = data;

      const request = {
        projectCode,
        taskCode,
        taskAttributeCode,
        value,
      };

      const response =
        await apiFactory.taskAttributeApi.updateTaskAttribute(request);

      if (response?.status !== 200) return;

      const unwindTask = unwindTaskList?.find(
        (task) => task?.taskCode === taskCode
      );

      if (!unwindTask) return;

      const taskAttribute = unwindTask?.taskAttributeDtoList?.find(
        (taskAttributeDto) =>
          taskAttributeDto.typeCode === typeCode &&
          taskAttributeDto?.taskAttributeCode === taskAttributeCode
      );

      if (taskAttribute) {
        taskAttribute.value = value;
        setUnwindTaskList([...unwindTaskList]);
      }
    } catch (e) {
      toast.error("Error updating task attribute!");
    }
  };

  const openModalReplyComment = () => {
    setIsModalComment(true);
  };

  const getFiles = async () => {
    let item = {
      taskCode: data?.taskCode,
    };

    let response = await apiFactory.projectFile.getFiles(item);

    if (response?.status === 200) {
      setFilesPreviewTask(response?.data);
    }
  };

  const handleChangeUploadTask = ({ file }) => {
    if (file?.size === 0) {
      toast.error("Invalid file (file size = 0)");

      return;
    }
    setPendingFilesTask((prevFiles) => [...prevFiles, file]);
  };

  const handleChangeUploadComment = ({ file }) => {
    if (file?.size === 0) {
      toast.error("Invalid file (file size = 0)");

      return;
    }
    setPendingFilesComment((prevFiles) => [...prevFiles, file]);
  };

  const handleChangeUploadReply = ({ file }) => {
    if (file.size === 0) {
      toast.error("Invalid file (file size = 0)");

      return;
    }
    setPendingFilesReply((prevFiles) => [...prevFiles, file]);
  };

  const uploadFile = async (
    fileItem,
    type,
    setUploadFiles,
    setResponseChunkTask,
    setFilesPreview
  ) => {
    const uploadFiles =
      useUploadFileStore.getState()[
        type === "TASK"
          ? "uploadFilesTask"
          : type === "COMMENT"
            ? "uploadFilesComment"
            : "uploadFilesReply"
      ];

    const uploadFile = uploadFiles?.find(
      (item) => item?.requestUuid === fileItem.requestUuid
    );

    if (!uploadFile) return;

    const updatedFiles = uploadFiles?.map((file) => {
      if (file?.requestUuid === fileItem?.requestUuid) {
        const updatedFile = createNewFile(
          file,
          file.requestUuid,
          file?.taskCode,
          file?.fileName,
          file?.totalVolume
        );
        updatedFile.isUploading = true;
        return updatedFile;
      } else {
        return file;
      }
    });

    setUploadFiles(updatedFiles);

    const totalChunk = Math.ceil(fileItem?.totalVolume / CHUNK_SIZE);

    const payload = {
      requestUuid: fileItem?.requestUuid,
      name: fileItem?.fileName,
      token: Cookies.get("access_token"),
      volume: fileItem?.totalVolume,
      totalChunk: totalChunk,
      type: type,
    };

    const currentTime = moment().toISOString();
    const controller = new AbortController();
    setAbortController(controller);

    for (let i = 0; i < totalChunk; i++) {
      if (controller.signal.aborted) break;

      const chunk = fileItem.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const base64Chunk = await getBase64(chunk);

      const item = {
        ...payload,
        base64Chunk: base64Chunk,
        chunkIndex: i,
      };

      const message = await sendFileChunk(item);
      if (!message) break;

      const dataChunk = {
        ...message,
        taskCode: data?.taskCode,
        totalChunk: totalChunk,
        totalChunkUploaded: i + 1,
        fileName: fileItem?.fileName,
        totalVolume: fileItem?.totalVolume,
        createdAt: currentTime,
        updatedAt: currentTime,
        type: type,
        isUploading: true,
      };

      setResponseChunkTask(dataChunk);
    }

    if (controller.signal.aborted) return;

    const response = await apiFactory.projectFile.mergeChunk({
      folder: type,
      fileName: fileItem?.fileName,
      contentType: MESSAGE_STATUS.FILE,
      requestUuid: fileItem?.requestUuid,
      taskCode: data?.taskCode,
      totalChunk: totalChunk,
      volume: fileItem?.totalVolume,
      type: type,
    });

    const uploadFilesCurrent =
      useUploadFileStore.getState()[
        type === "TASK"
          ? "uploadFilesTask"
          : type === "COMMENT"
            ? "uploadFilesComment"
            : "uploadFilesReply"
      ];

    const updatedFilesList = uploadFilesCurrent?.filter(
      (item) => item?.requestUuid !== fileItem?.requestUuid
    );
    setUploadFiles(updatedFilesList);

    if (type === "TASK") {
      if (response?.status === 200) {
        getFiles();
      }
    }

    if (type === "COMMENT" || type === "REPLY") {
      const filePreview = {
        ...payload,
        taskCode: data?.taskCode,
        fileName: fileItem?.fileName,
        totalVolume: fileItem?.totalVolume,
        contentType: MESSAGE_STATUS.FILE,
        pathUrl: response?.data?.storageFileName,
      };
      setFilesPreview((prevState) => [...prevState, filePreview]);
    }
  };

  const createNewFile = (
    file,
    requestUuid,
    taskCode,
    fileName,
    totalVolume
  ) => {
    const newFile = new File([file], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });

    newFile.requestUuid = requestUuid;
    newFile.taskCode = taskCode;
    newFile.fileName = fileName;
    newFile.totalVolume = totalVolume;
    newFile.totalChunk = Math.round(file?.size / CHUNK_SIZE);
    newFile.contentType = "CHUNK";
    newFile.progress = 1;
    newFile.totalChunkUploaded = 0;

    return newFile;
  };

  const uploadFileTask = async () => {
    const uploadingFiles = useUploadFileStore.getState().uploadFilesTask;

    for (const fileItem of uploadingFiles) {
      await uploadFile(
        fileItem,
        "TASK",
        setUploadFilesTask,
        setResponseChunkTask
      );
    }
  };

  const uploadFileComment = async () => {
    const uploadingFiles = useUploadFileStore.getState().uploadFilesComment;

    for (const fileItem of uploadingFiles) {
      await uploadFile(
        fileItem,
        "COMMENT",
        setUploadFilesComment,
        setResponseChunkTask,
        setFilesPreviewComment
      );
    }
  };

  const uploadFileReply = async () => {
    const uploadingFiles = useUploadFileStore.getState().uploadFilesReply;

    for (const fileItem of uploadingFiles) {
      await uploadFile(
        fileItem,
        "REPLY",
        setUploadFilesReply,
        setResponseChunkTask,
        setFilesPreviewReply
      );
    }
  };

  const sendFileChunk = async (item) => {
    const request = {
      folder: item?.type,
      base64: item?.base64Chunk,
      chunkIndex: item?.chunkIndex,
      requestUuid: item?.requestUuid,
      contentType: MESSAGE_STATUS.CHUNK,
    };

    const res = await apiFactory.resourceApi.uploadChunk(request);

    if (res?.status === 400) {
      if (item?.type === "TASK") {
        const uploadFilesTask = useUploadFileStore.getState().uploadFilesTask;

        const updatedFilesTask = uploadFilesTask?.filter(
          (uploadFile) => uploadFile?.requestUuid !== item?.requestUuid
        );

        setUploadFilesTask(updatedFilesTask);
      }

      if (item?.type === "COMMENT") {
        const uploadFilesComment =
          useUploadFileStore.getState().uploadFilesComment;

        const updatedFilesComment = uploadFilesComment?.filter(
          (uploadFile) => uploadFile?.requestUuid !== item?.requestUuid
        );

        setUploadFilesComment(updatedFilesComment);
      }

      if (item?.type === "REPLY") {
        const uploadFilesReply = useUploadFileStore.getState().uploadFilesReply;

        const updatedFilesReply = uploadFilesReply?.filter(
          (uploadFile) => uploadFile?.requestUuid !== item?.requestUuid
        );

        setUploadFilesReply(updatedFilesReply);
      }

      toast.error(
        languageMap?.[res?.message] || "Upload failed, try again later"
      );

      return null;
    }

    return res?.data;
  };

  const handleResponseChunk = () => {
    if (responseChunkTask.type === "TASK") {
      const uploadFiles = useUploadFileStore.getState().uploadFilesTask;
      const index = uploadFiles?.findIndex(
        (file) => file?.requestUuid === responseChunkTask?.requestUuid
      );

      if (index === -1) return;

      uploadFiles[index] = responseChunkTask;

      setUploadFilesTask(uploadFiles);
    }

    if (responseChunkTask.type === "COMMENT") {
      const uploadFiles = useUploadFileStore.getState().uploadFilesComment;
      const index = uploadFiles?.findIndex(
        (file) => file?.requestUuid === responseChunkTask?.requestUuid
      );

      if (index === -1) return;

      uploadFiles[index] = responseChunkTask;

      setUploadFilesComment(uploadFiles);
    }

    if (responseChunkTask.type === "REPLY") {
      const uploadFiles = useUploadFileStore.getState().uploadFilesReply;
      const index = uploadFiles?.findIndex(
        (file) => file?.requestUuid === responseChunkTask?.requestUuid
      );

      if (index === -1) return;

      uploadFiles[index] = responseChunkTask;

      setUploadFilesReply(uploadFiles);
    }
  };

  const processWebSocket = () => {
    chatSocket.onmessage = function (event) {
      const dataResponse = JSON.parse(event.data);

      if (
        !dataResponse?.response ||
        dataResponse?.response?.data?.taskCode !== data?.taskCode
      ) {
        return;
      }

      const {
        taskActivityCode,
        taskCode,
        activeType,
        notificationStatus,
        typeCode,
        content,
        sortSequence,
        parentTaskActivityCode,
        status,
        commentTime,
        userCode,
        mentionCodes,
        attachFiles,
      } = dataResponse?.response?.data;

      const comment = {
        taskActivityCode: taskActivityCode,
        taskCode: taskCode,
        activeType: activeType,
        notificationStatus: notificationStatus,
        typeCode: typeCode,
        content: content,
        sortSequence: sortSequence,
        parentTaskActivityCode: parentTaskActivityCode,
        status: status,
        userCode: userCode,
        commentTime: commentTime,
        isEdited: false,
        mentionCodes: mentionCodes,
        attachFiles: attachFiles,
        childTaskActivity: [],
      };

      if (!parentTaskActivityCode) {
        setCommentList((prevList) => [comment, ...prevList]);
      }

      if (parentTaskActivityCode) {
        setCommentList((prevList) => {
          prevList.forEach((item) => {
            if (item.taskActivityCode === parentTaskActivityCode) {
              item.childTaskActivity.unshift(comment);
            }
          });
          return [...prevList];
        });
      }
    };

    window.onbeforeunload = function () {
      closeAuthSocket();
      closeChatSocket();
    };
  };

  const handleUploadTask = async () => {
    if (isUploadingTask) return;

    setIsUploadingTask(true);
    try {
      await uploadFileTask();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploadingTask(false);
    }
  };

  const handleUploadComment = async () => {
    if (isUploadingComment) return;

    setIsUploadingComment(true);
    try {
      await uploadFileComment();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploadingComment(false);
    }
  };

  const handleUploadReply = async () => {
    if (isUploadingReply) return;

    setIsUploadingReply(true);
    try {
      await uploadFileReply();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploadingReply(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (pendingFilesTask.length === 0) return;

    const timer = setTimeout(async () => {
      const uploadFiles = useUploadFileStore.getState().uploadFilesTask;

      const updatedFiles = pendingFilesTask.map((file) =>
        createNewFile(file, file?.uid, data?.taskCode, file?.name, file?.size)
      );

      const newFiles = updatedFiles.filter(
        (newFile) =>
          !uploadFiles.some(
            (existingFile) => existingFile.requestUuid === newFile.requestUuid
          )
      );

      if (newFiles.length > 0) {
        setUploadFilesTask([...uploadFiles, ...newFiles]);

        delay(() => {
          if (sideBarRef.current) {
            sideBarRef.current.scrollTop = sideBarRef.current.scrollHeight;
          }
        }, 200);
      }

      setPendingFilesTask([]);

      await handleUploadTask();
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingFilesTask]);

  useEffect(() => {
    const uploadingFiles = useUploadFileStore.getState().uploadFilesTask;

    if (uploadingFiles.length > 0 && !isUploadingTask) {
      handleUploadTask();
    }
  }, [isUploadingTask]);

  useEffect(() => {
    if (pendingFilesComment.length === 0) return;

    const timer = setTimeout(async () => {
      const uploadFiles = useUploadFileStore.getState().uploadFilesComment;

      const updatedFiles = pendingFilesComment.map((file) =>
        createNewFile(file, file?.uid, data?.taskCode, file?.name, file?.size)
      );

      const newFiles = updatedFiles.filter(
        (newFile) =>
          !uploadFiles.some(
            (existingFile) => existingFile.requestUuid === newFile.requestUuid
          )
      );

      if (newFiles.length > 0) {
        setUploadFilesComment([...uploadFiles, ...newFiles]);
      }

      setPendingFilesComment([]);

      await handleUploadComment();
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingFilesComment]);

  useEffect(() => {
    const uploadingFiles = useUploadFileStore.getState().uploadFilesComment;

    if (uploadingFiles.length > 0 && !isUploadingComment) {
      handleUploadComment();
    }
  }, [isUploadingComment]);

  useEffect(() => {
    if (pendingFilesReply.length === 0) return;

    const timer = setTimeout(async () => {
      const uploadFiles = useUploadFileStore.getState().uploadFilesReply;
      const updatedFiles = pendingFilesReply.map((file) =>
        createNewFile(file, file?.uid, data?.taskCode, file?.name, file?.size)
      );

      const newFiles = updatedFiles.filter(
        (newFile) =>
          !uploadFiles.some(
            (existingFile) => existingFile.requestUuid === newFile.requestUuid
          )
      );

      if (newFiles.length > 0) {
        setUploadFilesReply([...uploadFiles, ...newFiles]);
      }

      setPendingFilesReply([]);

      await handleUploadReply();
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingFilesReply]);

  useEffect(() => {
    const uploadingFiles = useUploadFileStore.getState().uploadFilesReply;

    if (uploadingFiles.length > 0 && !isUploadingReply) {
      handleUploadReply();
    }
  }, [isUploadingReply]);

  useEffect(() => {
    if (!responseChunkTask) return;
    handleResponseChunk();
  }, [responseChunkTask]);

  useEffect(() => {
    if (currentProjectDetail) {
      setProjectAttribute(currentProjectDetail?.projectAttributeDtos);
      setMemberList(
        currentProjectDetail?.projectParticipantDtos.filter(
          (item) => item?.userCode
        )
      );
    }
  }, [currentProjectDetail]);

  useEffect(() => {
    getCommentList();
    processWebSocket();
  }, [data?.taskCode]);

  useEffect(() => {
    getFiles();
  }, [data?.taskCode]);

  const taskBlock = () => {
    return (
      <div
        className="border rounded shadow-lg"
        style={
          isMobile
            ? {
                width: "100%",
                height: "100%",
              }
            : {
                width: "50%",
                height: "100%",
              }
        }
      >
        <div
          className="px-3 pt-2 sidebar-timeline"
          style={{
            height: "90%",
          }}
          ref={sideBarRef}
        >
          <Row>
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.taskName"] ??
                  "Task name:"}
              </label>
            </Col>
            <Col span={16}>
              <TaskNameInput
                item={data}
                onBlurName={onBlurTask}
                isDisabled={!permissionCurrentUser?.includes("U")}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.workStatus"] ??
                  "Work status:"}
              </label>
            </Col>
            <Col span={16}>
              <Select
                disabled={!permissionCurrentUser?.includes("U")}
                value={data?.workflowCode}
                style={{ width: "100%" }}
                options={projectProgressList}
                onChange={(value) => onBlurStatus(value, data)}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.assignee"] ?? "Assignee:"}{" "}
              </label>
            </Col>
            <Col span={14} className="flex items-center">
              {generateParticipant(data?.taskMemberDtoList, 4, data)}
            </Col>
            <Col
              span={2}
              className="flex items-centers"
              style={{ height: `2rem` }}
            >
              <Tooltip title="Assign member" placement="left" trigger="hover">
                <a
                  onClick={handleAddMember}
                  className="flex items-center justify-center"
                >
                  <PlusOutlined
                    hidden={!permissionCurrentUser?.includes("C")}
                    className="border border-black rounded-full text-black hover:text-white hover:bg-black transition duration-300 ease-in-out transform hover:scale-110"
                  />
                </a>
              </Tooltip>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.progressRate"] ??
                  "Progress rate"}
                {" : "}
              </label>
            </Col>
            <Col span={8}>
              <ProgressInput
                item={data}
                onChangeProgress={onBlurProgressRate}
              />
            </Col>
          </Row>
          <Row className="mt-3 mb-2">
            <Col span={12}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.startDate"] ??
                  "Start date:"}{" "}
              </label>
            </Col>
            <Col span={12}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.endDate"] ?? "End date:"}{" "}
              </label>
            </Col>
          </Row>
          <Row className="mb-[10px]" gutter={10}>
            <Col span={12}>
              <DatePicker
                disabled={!permissionCurrentUser?.includes("U")}
                value={data?.startDate && dayjs(data?.startDate, "YYYY-MM-DD")}
                onChange={(date, dateString) =>
                  changeDate(dateString, "start", data, date)
                }
                maxDate={data?.endDate && dayjs(data?.endDate, "YYYY-MM-DD")}
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
            </Col>
            <Col span={12}>
              <DatePicker
                disabled={!permissionCurrentUser?.includes("U")}
                value={data?.endDate && dayjs(data?.endDate, "YYYY-MM-DD")}
                onChange={(date, dateString) =>
                  changeDate(dateString, "end", data, date)
                }
                minDate={
                  data?.startDate && dayjs(data?.startDate, "YYYY-MM-DD")
                }
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
              />
            </Col>
          </Row>
          {data?.taskAttributeDtoList?.length > 0 && (
            <div className="flex gap-x-3">
              {projectAttribute?.map((attribute) => {
                const { attributeCode, vnName, enName, krName, typeCode } =
                  attribute;
                const taskAttribute = data?.taskAttributeDtoList?.find(
                  (item) =>
                    item?.typeCode === typeCode &&
                    item?.taskAttributeCode === attributeCode
                );
                const isDisabled = !permissionCurrentUser?.includes("U");
                const AttributeValue = taskAttribute?.value || null;
                const isActive = attribute?.isActive === "Y";
                const displayName =
                  user?.language === "us"
                    ? enName
                    : user?.language === "vn"
                      ? vnName
                      : user?.language === "kr"
                        ? krName
                        : enName;
                // Ensure the return statement is wrapped correctly
                return (
                  typeCode === ATTRIBUTE_CODE.DATE &&
                  isActive && (
                    <div className="mb-2 flex-1" key={attributeCode}>
                      <div className="flex flex-col gap-[10px]">
                        <label>
                          {typeCode === ATTRIBUTE_CODE.DATE &&
                            displayName + ":"}
                        </label>
                        {typeCode === ATTRIBUTE_CODE.DATE && (
                          <DatePicker
                            key={`date-${data?.taskCode + attributeCode}`}
                            disabled={isDisabled}
                            placeholder={
                              languageMap?.[
                                "modal.sideBarTimeLine.selectDate"
                              ] ?? "Select date"
                            }
                            defaultValue={
                              AttributeValue
                                ? dayjs(new Date(AttributeValue))
                                : null
                            }
                            onChange={(date) =>
                              updateTaskAttribute(
                                date?.toISOString() || null,
                                attributeCode,
                                ATTRIBUTE_CODE.DATE
                              )
                            }
                            format="YYYY-MM-DD"
                          />
                        )}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
          <hr className="mt-3" />
          {data?.taskAttributeDtoList?.length > 0 && (
            <div className="mt-2">
              {projectAttribute?.map((attribute) => {
                const { attributeCode, vnName, enName, krName, typeCode } =
                  attribute;
                const taskAttribute = data?.taskAttributeDtoList?.find(
                  (item) =>
                    item?.typeCode === typeCode &&
                    item?.taskAttributeCode === attributeCode
                );
                const isDisabled = !permissionCurrentUser?.includes("U");
                const AttributeValue = taskAttribute?.value || null;
                const isActive = attribute?.isActive === "Y";
                const displayName =
                  user?.language === "us"
                    ? enName
                    : user?.language === "vn"
                      ? vnName
                      : user?.language === "kr"
                        ? krName
                        : enName;
                // Ensure the return statement is wrapped correctly
                return (
                  typeCode === ATTRIBUTE_CODE.TEXT &&
                  isActive && (
                    <div className="mb-2" key={attributeCode}>
                      <div className="flex flex-col gap-[10px]">
                        <label>
                          {typeCode === ATTRIBUTE_CODE.TEXT &&
                            displayName + ":"}
                        </label>
                        {typeCode === ATTRIBUTE_CODE.TEXT && (
                          <TextArea
                            key={`textArea-${data?.taskCode + attributeCode}`}
                            maxLength={4000}
                            defaultValue={AttributeValue}
                            onBlur={(e) =>
                              updateTaskAttribute(
                                e?.target?.value,
                                attributeCode,
                                ATTRIBUTE_CODE.TEXT
                              )
                            }
                            placeholder={displayName}
                            disabled={isDisabled}
                            rows={10}
                          />
                        )}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
          <UploadFile
            key={data.taskCode}
            task={data}
            permissionCurrentUser={permissionCurrentUser}
            uploadFile={handleChangeUploadTask}
            filesPreview={filesPreviewTask}
            setFilesPreview={setFilesPreviewTask}
            isSideBarTimeline={true}
            isMobile={isMobile}
          />
        </div>

        {/* <div className="flex flex-wrap m-[10px] items-center  mb-2 py-3 pl-3"> */}
        <Button
          disabled={!permissionCurrentUser?.includes("D")}
          className=" flex items-center"
          style={{
            position: "fixed",
            bottom: "10px",
            left: "10px",
          }}
          color="danger"
          variant="solid"
          onClick={() => {
            deleteTask(data?.path);
            // onClose();
          }}
        >
          <MdDelete color="white" size={20} />
          <span>
            {languageMap?.["modal.sideBarTimeLine.deleteBtn"] ?? "Delete Task"}
          </span>
        </Button>
        {/* </div> */}
      </div>
    );
  };

  const commentBlock = () => {
    return (
      <div
        className="border rounded shadow-lg"
        style={
          isMobile
            ? {
                width: "100%",
                height: "100%",
              }
            : {
                width: "50%",
                height: "100%",
              }
        }
      >
        <div className="flex-col flex-1 overflow-y-auto px-3 comment-block">
          <div className="scrollable-content flex flex-col mt-[10px]">
            {commentList?.length === 0 && (
              <h3 className="h-[85vh] flex justify-center items-center">
                No comments yet...
              </h3>
            )}

            {commentList?.map((comment, index) => (
              <div
                key={comment?.taskActivityCode}
                ref={index === commentList?.length - 1 ? lastCommentRef : null}
              >
                <TaskActivity
                  type="PARENT"
                  comment={comment}
                  memberList={memberList}
                  workActivity={workActivity}
                  selectedTask={data}
                  parentTaskActivity={comment?.taskActivityCode}
                  getPropertyColorByType={getPropertyColorByType}
                  getAvatarSrc={getAvatarSrc}
                  getMemberName={getMemberName}
                  setCommentList={setCommentList}
                  permissionCurrentUser={permissionCurrentUser}
                  taskFormData={taskFormData}
                  setTaskFormData={setTaskFormData}
                  filesPreviewComment={filesPreviewReply}
                  setFilesPreviewComment={setFilesPreviewReply}
                  handleChangeUploadReply={handleChangeUploadReply}
                />
                {comment?.childTaskActivity?.map((childComment) => (
                  <TaskActivity
                    key={childComment?.taskActivityCode}
                    type="CHILD"
                    comment={childComment}
                    memberList={memberList}
                    workActivity={workActivity}
                    selectedTask={data}
                    parentTaskActivity={comment?.taskActivityCode}
                    getPropertyColorByType={getPropertyColorByType}
                    getAvatarSrc={getAvatarSrc}
                    getMemberName={getMemberName}
                    setCommentList={setCommentList}
                    permissionCurrentUser={permissionCurrentUser}
                    taskFormData={taskFormData}
                    setTaskFormData={setTaskFormData}
                    filesPreviewComment={filesPreviewReply}
                    setFilesPreviewComment={setFilesPreviewReply}
                  />
                ))}
                {comment?.isChildTaskActivityList && (
                  <div className="flex justify-center py-1">
                    <Button
                      onClick={() =>
                        getMoreChildTask(comment.childTaskActivity)
                      }
                    >
                      View More
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          className={`flex  items-center fixed bottom-[10px] right-[0] md:right-[0] lg:right-[0]`}
        >
          <div className="button-container">
            <Button
              disabled={!permissionCurrentUser?.includes("U")}
              className="flex gap-[5px] items-center"
              type="primary"
              onClick={() => openModalReplyComment()}
            >
              <LuPenSquare />
              <span>
                {languageMap?.["modal.sideBarTimeLine.commentBtn"] ?? "Comment"}
              </span>
            </Button>
          </div>
          <div className="button-container">
            <Button
              className="flex gap-[5px] items-center"
              type="primary"
              onClick={() => getCommentList()}
            >
              <TbRefresh size={20} className="comment-refresh mr-2" />
              <span>
                {languageMap?.["modal.sideBarTimeLine.refreshBtn"] ?? "Refresh"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`${isOpen ? "translate-x-0" : "translate-x-full"} 
      fixed top-0 right-0 w-full lg:w-[1000px] md:w-[800px] sm:w-[100vw] bg-[#f7f7f7] shadow-2xl 
      transform transition-transform ease duration-300 z-[1000] h-screen`}
      >
        <div className="sidebar-header flex justify-between items-center px-[2px] mr-[4px]">
          {isMobile ? (
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <Tabs.TabPane tab="Task" key="task" />
              <Tabs.TabPane tab="Comment" key="comment" />
            </Tabs>
          ) : (
            <p></p>
          )}
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>

        <div className="flex gap-[6px] w-full h-[98%]">
          {isMobile ? (
            activeTab === "task" ? (
              taskBlock()
            ) : (
              commentBlock()
            )
          ) : (
            <>
              {taskBlock()}
              {commentBlock()}
            </>
          )}
        </div>
      </div>
      {isModalComment && (
        <ModalReplyComment
          type="COMMENT"
          isModalReplyComment={isModalComment}
          setIsModalReplyComment={setIsModalComment}
          memberList={memberList}
          getPropertyColorByType={getPropertyColorByType}
          getAvatarSrc={getAvatarSrc}
          getMemberName={getMemberName}
          selectedTask={data}
          workActivity={workActivity}
          filesPreviewComment={filesPreviewComment}
          setFilesPreviewComment={setFilesPreviewComment}
          handleChangeUpload={handleChangeUploadComment}
          taskFormData={taskFormData}
          setTaskFormData={setTaskFormData}
        />
      )}
    </>
  );
};

export default SideBarTimeline;
