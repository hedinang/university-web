import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiFactory from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { useInfoUser } from "../store/UserStore";

const AdminSettingContext = createContext(null);

export const useAdminSettingContext = () => {
  return useContext(AdminSettingContext);
};

export const AdminSettingProvider = ({ children }) => {
  const navigate = useNavigate();
  const { languageMap, user } = useInfoUser();
  const [isGeneralLoading, setIsGeneralLoading] = useState(false);
  const [isProgramLoading, setIsProgramLoading] = useState(false);
  const [programList, setProgramList] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState();
  const [isVerify, setIsVerify] = useState(false);

  const fetchProgramList = async () => {
    setIsProgramLoading(true);
    try {
      const request = {
        // program: "",
        // date: "",
      };

      const result = await apiFactory.resourceApi.summaryAll(request);
      if (result?.status === 200) {
        setProgramList(
          result?.data?.map((program) => ({
            ...program,
            key: program?.program,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching alarm list data:", error);
    } finally {
      setIsProgramLoading(false);
    }
  };

  const values = useMemo(
    () => ({
      programList,
      setProgramList,
      setSelectedProgram,
      selectedProgram,
      isGeneralLoading,
      setIsGeneralLoading,
      fetchProgramList,
      isProgramLoading,
      setIsProgramLoading,
      isVerify,
    }),
    [programList, selectedProgram, isGeneralLoading, isProgramLoading, isVerify]
  );

  useEffect(() => {
    if (user) {
      if (user.roleCode === "ADMIN") {
        setIsVerify(true);
      } else {
        navigate("/conversation");
      }
    }
  }, [user]);

  return (
    <AdminSettingContext.Provider value={values}>
      {children}
    </AdminSettingContext.Provider>
  );
};
