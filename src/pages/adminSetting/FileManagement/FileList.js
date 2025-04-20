import { Button, Modal, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiFactory from "../../../api";
import { GeneralModal } from "../../../components/modal/GeneralModal";
import { useAdminSettingContext } from "../../../context/AdminSettingContext";
import { useInfoUser } from "../../../store/UserStore";
import { standardizeVolume } from "../../../utils/Utils";
import { stringToDate } from "../../../utils/formatTime";
import { FiEye, FiTrash } from "react-icons/fi";
import { RenderMobileList } from "./RenderMobileList";

const FileList = ({ isMobile }) => {
  const navigate = useNavigate();
  const { user, languageMap } = useInfoUser();
  const [isLoading, setIsLoading] = useState(false);
  const {
    setSelectedProgram,
    selectedProgram,
    isGeneralLoading,
    setIsGeneralLoading,
    isProgramLoading,
    setIsProgramLoading,
    fetchProgramList,
    isVerify,
  } = useAdminSettingContext();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedDeletion, setSelectedDeletion] = useState(null);
  const [expandedPrograms, setExpandedPrograms] = useState([]);

  const columns = [
    {
      title: languageMap?.["as.menu.document.table.date"] ?? "Date",
      dataIndex: "date",
      key: "date",
      render: (text, record) => !record?.dataType && stringToDate(text),
    },
    {
      title: languageMap?.["as.menu.document.table.dataType"] ?? "Data type",
      dataIndex: "dataType",
      key: "dataType",
      render: (text, record) => text || "ALL",
    },
    {
      title:
        languageMap?.["as.menu.document.table.totalNumber"] ?? "Total number",
      dataIndex: "totalNumber",
      key: "totalNumber",
      render: (text, record) => text,
    },
    {
      title:
        languageMap?.["as.menu.document.table.totalVolume"] ?? "Total volume",
      dataIndex: "totalVolume",
      key: "totalVolume",
      render: (text, record) => standardizeVolume(text),
    },
    {
      title: `${languageMap?.["as.menu.document.table.action"] ?? "Action"}`,
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <Button
          className="bg-[#e00d0d] text-[white]"
          onClick={() => onRemove(record)}
          icon={<FiTrash className="text-[18px]" />}
        />
      ),
    },
  ];
  const [fileList, setFileList] = useState([]);

  const [pagination, setPagination] = useState({
    pageSize: 10,
    total: 0,
    current: 1,
  });

  const fetchFileList = async (resetPage = false) => {
    if (!selectedProgram?.program) {
      setFileList([]);
      setPagination({
        pageSize: 10,
        total: 0,
        current: 1,
      });
      return;
    }

    setIsLoading(true);
    try {
      const newPage = resetPage ? 1 : pagination?.current;

      const request = {
        program: selectedProgram?.program,
        limit: pagination?.pageSize,
        page: newPage,
      };

      const result = await apiFactory.resourceApi.summaryByProgram(request);

      if (result?.status === 200) {
        setFileList(
          result?.data?.items?.map((file) => ({
            ...file,
            key: file?.date,
          }))
        );
        setPagination((prev) => ({
          ...prev,
          total: result?.data?.totalItems || 0,
          current: newPage,
        }));
      }
    } catch (error) {
      console.error("Error fetching file list data:", error);
    } finally {
      setIsLoading(false);
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

  const handleTableChange = (pagination) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const onExpand = async (expanded, record) => {
    setIsLoading(true);
    const fileIndex = fileList?.findIndex((f) => f?.date === record?.date);

    if (!expanded) {
      fileList[fileIndex].children = [];
      setExpandedPrograms((prev) => prev.filter((p) => p !== record?.date));
    } else {
      const result = await apiFactory.resourceApi.summaryByProgram({
        program: selectedProgram?.program,
        limit,
        page,
        date: record?.date,
      });

      if (result?.status === 200) {
        const dateIndex = fileList?.findIndex(
          (file) => file?.date === record?.date
        );

        fileList[dateIndex].children = result?.data?.items;
        setExpandedPrograms((prev) => [...prev, record?.date]);
      }
    }

    setFileList([...fileList]);
    setIsLoading(false);
  };

  const showSelectedProgram = () => {
    if (selectedProgram?.program) {
      const text = languageMap?.["as.menu.document.in"] ?? " in ";
      return text + selectedProgram?.program;
    }
    return "";
  };

  const onRemove = (record) => {
    setSelectedDeletion(record);
  };

  const handleOnConfirm = async () => {
    setIsGeneralLoading(true);
    setSelectedDeletion(null);

    const request = {
      program: selectedDeletion?.program,
      dataType: selectedDeletion?.dataType,
      date: selectedDeletion?.date,
    };

    const result = await apiFactory.resourceApi.remove(request);
    if (result?.status !== 200) toast.error(result?.data);

    const fileIndex = fileList?.findIndex(
      (f) => f?.date === selectedDeletion?.date
    );

    if (selectedDeletion?.dataType) {
      const dataTypeIndex = fileList[fileIndex]?.children?.findIndex(
        (e) => e?.dataType === selectedDeletion?.dataType
      );
      fileList[fileIndex].totalNumber =
        fileList[fileIndex].totalNumber -
        fileList[fileIndex].children[dataTypeIndex].totalNumber;
      fileList[fileIndex].totalVolume =
        fileList[fileIndex].totalVolume -
        fileList[fileIndex].children[dataTypeIndex].totalVolume;
      fileList[fileIndex]?.splice(dataTypeIndex, 1);
    } else {
      fileList[fileIndex].children = [];
      fileList[fileIndex].totalNumber = 0;
      fileList[fileIndex].totalVolume = 0;
    }

    setFileList([...fileList]);
    await fetchProgramList();
    toast.success(
      languageMap?.["as.menu.document.deleteFolderSuccess"] ??
        "Delete folder successfully"
    );
    setIsGeneralLoading(false);
  };

  const getTitle = () => {
    const title =
      languageMap?.["as.menu.document.confirm"] ??
      "Are you sure to delete folder ";
    if (selectedDeletion?.dataType) {
      return (
        title +
        selectedDeletion?.program +
        "/" +
        selectedDeletion?.dataType +
        "/" +
        selectedDeletion?.date
      );
    } else {
      return title + selectedDeletion?.program + "/" + selectedDeletion?.date;
    }
  };

  useEffect(() => {
    if (isVerify) {
      fetchFileList(true);
    }
  }, [selectedProgram?.program, isVerify]);

  useEffect(() => {
    if (isVerify) {
      fetchFileList();
    }
  }, [pagination?.pageSize, pagination?.current]);

  return (
    <>
      {isMobile ? (
        <Modal
          title={
            languageMap?.["as.menu.document.table.mobileTitle"] ??
            `File list ${showSelectedProgram()}`
          }
          open={selectedProgram}
          onCancel={() => {
            setSelectedProgram(null);
            setExpandedPrograms([]);
          }}
          footer={null}
          width={"100%"}
        >
          <RenderMobileList
            data={fileList}
            onExpand={onExpand}
            onRemove={onRemove}
            loading={isLoading}
            selectedProgram={selectedProgram}
            languageMap={languageMap}
            expandedPrograms={expandedPrograms}
            isProgramList={false}
          />
        </Modal>
      ) : (
        <>
          {" "}
          <div className="file-list">
            <div
              className="my-alarm"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div className="flex justify-between gap-[10px]">
                <div className="font-semisolid">
                  {"File list" + showSelectedProgram()}
                </div>
                <ReloadOutlined
                  className="text-[20px]"
                  //  onClick={handleReload}
                />
              </div>
            </div>

            <div>
              <Table
                columns={columns}
                dataSource={fileList}
                onChange={handleTableChange}
                expandable={{
                  // expandedRowKeys: expandedRowKeys,
                  // onExpandedRowsChange: setExpandedRowKeys,
                  expandIcon: expandIcon,
                  onExpand: (expanded, record) => onExpand(expanded, record),
                }}
                pagination={{
                  ...pagination,
                  showSizeChanger: false,
                }}
                size={"middle"}
                loading={isLoading}
                rowKey={(record) => record.key}
                rowClassName="admin-setting-table-row"
                scroll={{
                  x: 700,
                  y: 300,
                }}
              />
            </div>
          </div>{" "}
        </>
      )}

      {selectedDeletion && (
        <GeneralModal
          title={languageMap?.["e"] ?? getTitle()}
          onCancel={() => setSelectedDeletion(null)}
          open={selectedDeletion}
          onConfirm={handleOnConfirm}
        />
      )}
    </>
  );
};
export { FileList };
