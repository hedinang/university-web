import "./style.scss";
import React, { useEffect, useState } from "react";
import { LeftOutlined } from "@ant-design/icons";
import { useSideBarStore } from "../../../store/SideBarStore";
import { useInfoUser } from "../../../store/UserStore";
import { ProgramList } from "./ProgramList";
import { FileList } from "./FileList";

const FileManagement = () => {
  const { user, languageMap } = useInfoUser();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <div className="dashboard flex flex-col p-[10px]">
        <ProgramList isMobile={isMobile} />
        <FileList isMobile={isMobile} />
      </div>
    </>
  );
};
export { FileManagement };
