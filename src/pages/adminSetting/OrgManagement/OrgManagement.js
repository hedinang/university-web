import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInfoUser } from "../../../store/UserStore";
import { Directory } from "./directory/Directory";
import { DirectoryProvider } from "./directory/DirectoryContext";
import { LeftOutlined } from "@ant-design/icons";
import { useSideBarStore } from "../../../store/SideBarStore";

const OrgManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user, languageMap } = useInfoUser();
  const navigate = useNavigate();
  const [data, setData] = useState({
    groupName: "",
    userList: [],
  });
  const [orgList, setOrgList] = useState([]);
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);

  return (
    <div>
      <div className="font-semibold text-[20px] pl-[16px] pt-[16px] flex items-center">
        {!isWorkManagementOptions && (
          <a
            className="btn-back-to-work-management mr-2"
            onClick={switchIsWorkManagementOptions}
          >
            <LeftOutlined size={25} />
          </a>
        )}
          {languageMap?.["as.menu.organization.title"] ?? "Organization"}
      </div>
      <DirectoryProvider
        orgList={orgList}
        setOrgList={setOrgList}
        isOpen={true}
        conversationId={null}
      >
        <Directory />
      </DirectoryProvider>
    </div>
  );
};

export { OrgManagement };
