import { Avatar, Button, Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import apiFactory from "../../api";
import { useInfoUser } from "../../store/UserStore";
import { CommentModal } from "../modal/CommentModal";

const CommentDetail = ({ comment }) => {
  return (
    <div className="w-[100%]">
      <div className="task-activity-header justify-between flex">
        <div className="flex items-center gap-[6px]">
          <Avatar
          // style={{
          //   backgroundColor: getPropertyColorByType("BACKGROUND", comment),
          //   color: getPropertyColorByType("COLOR", comment),
          // }}
          // src={getAvatarSrc(comment)}
          >
            {comment?.commentatorName?.[0]}
          </Avatar>
          <span className="member-name">{comment?.commentatorName}</span>
          <span className="text-[12px]">{comment?.date}</span>
        </div>
      </div>
      <div className="task-activity-content flex justify-between">
        <div className="ms-10 comment-content max-w-[80%] flex-1">
          <div className={`content-container`}>{comment?.content}</div>
        </div>
      </div>
    </div>
  );
};

const SideBarQuestion = ({ isOpen, selectedQuestion, onClose }) => {
  const limit = 30;
  const { user, languageMap } = useInfoUser();
  const [commentList, setCommentList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComment, setIsComment] = useState(false);
  const [commentSearch, setCommentSearch] = useState({
    limit,
    page: 1,
    userName: null,
    isActive: true,
  });

  const fetchCommentList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    let data = [];

    try {
      const result = await apiFactory.commentApi.getCommentList(commentSearch);

      if (result?.status === 200) {
        // if (result?.data?.length < limit) {
        //   setIsLoadMoreData(false);
        // }

        // setUserList(
        //   result?.data?.map((r) => ({
        //     ...r,
        //     birthday: r?.birthday
        //       ? dayjs(r?.birthday)?.format("YYYY-MM-DD")
        //       : null,
        //   }))
        // );

        // if (result?.data?.length > 0) data = result?.data;

        setCommentList(result?.data?.items);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);

      setCommentSearch((prev) => ({
        ...prev,
        skip: prev?.skip + data.length,
      }));
    }
  };

  useEffect(() => {
    fetchCommentList();
  }, []);

  return (
    <>
      <div
        className={`${isOpen ? "translate-x-0" : "translate-x-full"} 
      fixed top-0 right-0 w-full lg:w-[500px] md:w-[500px] sm:w-[100vw] bg-[#f7f7f7] shadow-2xl 
      transform transition-transform ease duration-300 z-[1000] h-screen`}
      >
        <div className="bg-[#779fd7] flex justify-end h-[35px]">
          <Button
            className="mr-[5px] bg-[#779fd7]"
            type="primary"
            icon={<IoCloseSharp size={25} />}
            onClick={onClose}
          />
        </div>
        <div className="p-[10px] flex flex-col gap-[10px]">
          <Row className="flex items-center">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.taskName"] ?? "Title:"}
              </label>
            </Col>
            <Col span={16}>
              {/* <TitleInput item={selectedQuestion} onBlurName={onBlurTitle} /> */}
              <TextArea
                className="task-name w-full"
                maxLength={100}
                value={selectedQuestion?.title}
                // onChange={handleChange}
                // onDoubleClick={handlePreventAllEvents}
                // onBlur={handleBlur}
                // onKeyDown={handleKeyDown}
                autoSize={{ minRows: 1, maxRows: 5 }}
              />
            </Col>
          </Row>
          <Row className="flex items-center">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.taskName"] ??
                  "Questioner name:"}
              </label>
            </Col>
            <Col span={16}>
              <TextArea
                className="task-name w-full"
                maxLength={100}
                value={selectedQuestion?.questionerName}
                // onChange={handleChange}
                // onDoubleClick={handlePreventAllEvents}
                // onBlur={handleBlur}
                // onKeyDown={handleKeyDown}
                disabled
                autoSize={{ minRows: 1, maxRows: 5 }}
              />
            </Col>
          </Row>
          <Row className="flex items-center">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.taskName"] ??
                  "Recipient name:"}
              </label>
            </Col>
            <Col span={16}>
              <TextArea
                className="task-name w-full"
                maxLength={100}
                value={selectedQuestion?.recipientName}
                // onChange={handleChange}
                // onDoubleClick={handlePreventAllEvents}
                // onBlur={handleBlur}
                // onKeyDown={handleKeyDown}
                disabled
                autoSize={{ minRows: 1, maxRows: 5 }}
              />
            </Col>
          </Row>
          <Row className="flex items-center">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.workStatus"] ??
                  "Question date:"}
              </label>
            </Col>
            <Col span={16}>
              <TextArea
                className="task-name w-full"
                maxLength={100}
                value={selectedQuestion?.questionDate}
                // onChange={handleChange}
                // onDoubleClick={handlePreventAllEvents}
                // onBlur={handleBlur}
                // onKeyDown={handleKeyDown}
                disabled
                autoSize={{ minRows: 1, maxRows: 5 }}
              />
            </Col>
          </Row>
          <Row className="flex items-center">
            <Col span={8}>
              <label>
                {languageMap?.["modal.sideBarTimeLine.workStatus"] ??
                  "Content:"}
              </label>
            </Col>
            <Col span={16}>
              <TextArea
                className="task-name w-full"
                maxLength={100}
                value={selectedQuestion?.content}
                // onChange={handleChange}
                // onDoubleClick={handlePreventAllEvents}
                // onBlur={handleBlur}
                // onKeyDown={handleKeyDown}
                disabled
                autoSize={{ minRows: 1, maxRows: 5 }}
              />
            </Col>
          </Row>
          <hr className="my-3" />
          {commentList.map((comment) => (
            <CommentDetail comment={comment} key={comment?.commentId}/>
          ))}
          <div className="absolute bottom-[12px] right-[10px] flex gap-[10px]">
            <Button
              type="primary"
              icon={<FaPen />}
              onClick={() => setIsComment(true)}
            >
              Comment
            </Button>
            <Button type="primary" icon={<IoMdRefresh />}>
              Refresh
            </Button>
          </div>
        </div>
      </div>
      {isComment && (
        <CommentModal
          isModalOpen={isComment}
          closeModal={() => setIsComment(false)}
        />
      )}
    </>
  );
};

export default SideBarQuestion;
