import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { FiEye, FiTrash } from "react-icons/fi";
import { stringToDate } from "../../../utils/formatTime";
import { standardizeVolume } from "../../../utils/Utils";

const RenderMobileList = ({
  data,
  selectedProgram,
  onSelectProgram,
  onExpand,
  onRemove,
  expandedPrograms,
  isProgramList,
}) => {
  return (
    <div
      className={`flex flex-col gap-4 pb-[10px] overflow-auto ${isProgramList ? "mt-[70px]" : " h-[80vh]"}`}
    >
      {data?.map((item) => {
        const hasChildren = item?.children && item?.children.length > 0;
        const isExpanded = expandedPrograms?.includes(
          isProgramList ? item?.program : item?.date
        );

        return (
          <div
            key={item?.key}
            className={`rounded-xl border transition ${
              item === selectedProgram
                ? "border-blue-500 shadow-md"
                : "border-gray-200"
            } bg-white ${hasChildren && "border-l-4 border-l-blue-500"}`}
          >
            {/* Header */}
            <div className="flex justify-between items-start p-4 cursor-pointer hover:bg-gray-50">
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-800">
                  {isProgramList ? item?.program : stringToDate(item?.date)}
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                  <span className="bg-gray-100 rounded-full px-2 py-0.5">
                    {item?.dataType || "ALL"}
                  </span>
                  <span className="bg-gray-100 rounded-full px-2 py-0.5">
                    {item?.totalNumber} items
                  </span>
                  <span className="bg-gray-100 rounded-full px-2 py-0.5">
                    {standardizeVolume(item?.totalVolume)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 m-4 mt-0 justify-end">
              <button
                className="px-[10px] py-[6px] text-white bg-red-500 hover:bg-red-600 rounded-md flex items-center gap-2"
                onClick={() => onRemove(item)}
              >
                <FiTrash className="text-white" size={16} />
                Xóa
              </button>
              {!item?.dataType && (
                <Button
                  className="px-[10px]"
                  type="primary"
                  icon={
                    isExpanded ? <CaretUpOutlined /> : <CaretDownOutlined />
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpand(!isExpanded, item);
                  }}
                >
                  {isExpanded ? "Thu gọn" : "Mở rộng"}
                </Button>
              )}
              {isProgramList && onSelectProgram && (
                <Button
                  className="px-[10px]"
                  type="primary"
                  icon={<FiEye />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProgram(item);
                  }}
                >
                  Xem chi tiết
                </Button>
              )}
            </div>

            {/* Children */}
            {hasChildren && (
              <div className="border-t px-4 pb-4 pt-2">
                {item?.children.map((child) => (
                  <div
                    key={child.dataType}
                    className="mt-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-700">
                        {child.dataType}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {child.totalNumber} items —{" "}
                        {standardizeVolume(child.totalVolume)}
                      </div>
                    </div>
                    <Button
                      danger
                      size="small"
                      shape="circle"
                      icon={<FiTrash size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(child);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { RenderMobileList };
