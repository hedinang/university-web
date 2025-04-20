import {
  CaretDownOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  LeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { ImBin2 } from "react-icons/im";
import { Button, Card, ConfigProvider, Spin, Table } from "antd";
import React, { useEffect, useState } from "react";
import apiFactory from "../../../api";
import { useAdminSettingContext } from "../../../context/AdminSettingContext";
import { useInfoUser } from "../../../store/UserStore";
import { standardizeVolume } from "../../../utils/Utils";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { toast } from "react-toastify";
import { FiEye, FiTrash } from "react-icons/fi";
import { useSideBarStore } from "../../../store/SideBarStore";
import { stringToDate } from "../../../utils/formatTime";
import { RenderMobileList } from "./RenderMobileList";

const ProgramList = ({ isMobile }) => {
  const [selectedDeletion, setSelectedDeletion] = useState(null);
  const { user, languageMap } = useInfoUser();
  const { switchIsWorkManagementOptions, isWorkManagementOptions } =
    useSideBarStore((state) => state);
  const {
    programList,
    setProgramList,
    selectedProgram,
    setSelectedProgram,
    isGeneralLoading,
    setIsGeneralLoading,
    setIsProgramLoading,
    isProgramLoading,
    isVerify,
  } = useAdminSettingContext();
  const [expandedPrograms, setExpandedPrograms] = useState([]);

  const columns = [
    {
      title: `${languageMap?.["as.menu.document.table.programName"] ?? "Program Name"}`,
      dataIndex: "program",
      key: "program",
      render: (text, record) => !record?.dataType && text,
    },
    {
      title: `${languageMap?.["as.menu.document.table.dataType"] ?? "Data type"}`,
      dataIndex: "dataType",
      key: "dataType",
      render: (text, record) => text || "ALL",
    },
    {
      title: `${languageMap?.["as.menu.document.table.totalNumber"] ?? "Total number"}`,
      dataIndex: "totalNumber",
      key: "totalNumber",
    },
    {
      title: `${languageMap?.["as.menu.document.table.totalVolume"] ?? "Total volume"}`,
      dataIndex: "totalVolume",
      key: "totalVolume",
      render: (text, record) => standardizeVolume(text),
    },
    {
      title: `${languageMap?.["as.menu.document.table.action"] ?? "Action"}`,
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (text, record) => (
        <Button
          className="bg-[#e00d0d] text-[white]"
          onClick={() => onRemove(record)}
          icon={<FiTrash className="text-[18px]" />}
        />
      ),
    },
  ];
  const onRemove = (record) => {
    setSelectedDeletion(record);
  };

  const handleOnConfirm = async () => {
    setIsGeneralLoading(true);
    setSelectedDeletion(null);
    try {
      const request = {
        program: selectedDeletion?.program,
        dataType: selectedDeletion?.dataType,
      };
      const deletion = await apiFactory.resourceApi.remove(request);
      if (deletion?.status !== 200) toast.error(deletion?.data);
      const result = await apiFactory.resourceApi.summaryAll({});
      if (result?.status === 200) {
        setProgramList(
          result?.data?.map((program) => ({
            ...program,
            key: program?.program,
          }))
        );
      }
      if (selectedDeletion?.program === selectedProgram?.program) {
        setSelectedProgram(null);
      }
      toast.success(
        languageMap?.["as.menu.document.deleteFolderSuccess"] ??
          "Delete folder successfully"
      );
    } catch (error) {
      console.error("Delete folder failed", error);
    } finally {
      setIsGeneralLoading(false);
    }
  };
  const closeModalConfirm = () => {
    setSelectedDeletion(null);
  };
  const getSelectedColor = (record) => {
    return (
      record?.program === selectedProgram?.program &&
      !record?.dataType &&
      "highlighted-row-clicked"
    );
  };
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
  const expandIcon = ({ expanded, onExpand, record }) => {
    if (record?.dataType) return;
    return expanded ? (
      <div>
        <CaretRightOutlined size={23} onClick={(e) => onExpand(record, e)} />
      </div>
    ) : (
      <div>
        <CaretDownOutlined size={23} onClick={(e) => onExpand(record, e)} />
      </div>
    );
  };

  const onExpand = async (expanded, record) => {
    const programIndex = programList?.findIndex(
      (program) => program?.program === record?.program
    );

    if (!expanded) {
      programList[programIndex].children = [];
      setExpandedPrograms((prev) => prev.filter((p) => p !== record?.program));
    } else {
      setIsProgramLoading(true);
      const result = await apiFactory.resourceApi.summaryAll({
        program: record?.program,
      });
      programList[programIndex].children = result?.data;
      setExpandedPrograms((prev) => [...prev, record?.program]);
      setIsProgramLoading(false);
    }
    setProgramList([...programList]);
  };

  const onSelectProgram = (record) => {
    if (record?.dataType) return;
    setSelectedProgram(record);
  };
  const getTitle = () => {
    const title =
      languageMap?.["as.menu.document.confirm"] ??
      "Are you sure to delete folder ";
    if (selectedDeletion?.dataType) {
      return (
        title + selectedDeletion?.program + "/" + selectedDeletion?.dataType
      );
    } else {
      return title + selectedDeletion?.program;
    }
  };

  useEffect(() => {
    if (isVerify) {
      fetchProgramList();
    }
  }, [isVerify]);
  return (
    <div className={`program-list ${isMobile ? "border-none h-[unset]" : ""}`}>
      <div
        className={`my-project  ${isMobile ? "fixed top-[0] left-[0] bg-[white] right-[0] z-[10] shadow-sm " : ""}`}
        style={{
          display: "flex",
          justifyContent: "space-between",
          // marginBottom: "20px",
        }}
      >
        <div className={`dashboard-header `}>
          {!isWorkManagementOptions && (
            <a
              className="btn-back-to-work-management"
              onClick={switchIsWorkManagementOptions}
            >
              <LeftOutlined size={25} />
            </a>
          )}
          <div>{languageMap?.["as.menu.document.title"] ?? "Document"}</div>
        </div>
        <div className="flex justify-between gap-[10px] p-[10px]">
          <div className="font-semibold">
            {languageMap?.["as.menu.document.programList"] ?? "Program list"}
          </div>
          <ReloadOutlined
            className="text-[20px] reload"
            // onClick={handleReload}
          />
        </div>
      </div>
      <div className=" ">
        {isMobile ? (
          <RenderMobileList
            data={programList}
            selectedProgram={selectedProgram}
            onSelectProgram={onSelectProgram}
            onExpand={onExpand}
            onRemove={onRemove}
            expandedPrograms={expandedPrograms}
            isProgramList={true}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={programList}
            pagination={false}
            expandable={{
              // expandedRowKeys: expandedRowKeys,
              // onExpandedRowsChange: setExpandedRowKeys,
              expandIcon: expandIcon,
              onExpand: (expanded, record) => onExpand(expanded, record),
            }}
            loading={isProgramLoading || isGeneralLoading}
            size={"middle"}
            // onChange={handleTableChange}
            rowKey={(record) => record.key}
            onRow={(record, index) => ({
              onDoubleClick: (e) => onSelectProgram(record),
              className: getSelectedColor(record),
            })}
            // style={{ maxHeight: "300px" }}
            rowClassName="admin-setting-table-row"
            scroll={{
              x: 700,
              y: 230,
            }}
          />
        )}
      </div>
      {selectedDeletion && (
        <GeneralModal
          title={getTitle()}
          // content={getTitleAndContent()?.content}
          onCancel={closeModalConfirm}
          open={selectedDeletion}
          onConfirm={handleOnConfirm}
        />
      )}
    </div>
  );
};
export { ProgramList };
