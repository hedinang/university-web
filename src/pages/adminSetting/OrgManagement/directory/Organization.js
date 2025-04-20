import { IoPerson } from "react-icons/io5";
import { Checkbox, Spin } from "antd";
import { useDirectoryContext } from "./DirectoryContext";
import { useEffect, useRef } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { showName } from "../../../../utils/Utils";
import "./style.scss";
import { sortBy } from "lodash";

const Organization = () => {
  const { tree, searchResult, setSearchResult, isTreeLoading } =
    useDirectoryContext();

  const organizationRef = useRef(null);

  useEffect(() => {
    if (searchResult?.length) {
      organizationRef?.current[searchResult?.[0]?.objectId]?.scrollIntoView();
      setSearchResult([]);
    }
  }, [tree]);

  return (
    <div
      ref={organizationRef}
      className={`relative overflow-y-auto mt-[15px] h-[80vh]`}
    >
      {sortBy(tree, ["position"])?.map((item) => (
        <div
          ref={(el) => {
            if (organizationRef?.current)
              return (organizationRef.current[item?.objectId] = el);
          }}
          key={item?.id}
        >
          <Subtree
            item={item}
            key={item?.id}
            organizationRef={organizationRef}
          />
        </div>
      ))}
      {isTreeLoading && (
        <div className="absolute top-[50%] w-full text-center">
          <Spin indicator={<LoadingOutlined className="text-[35px]" spin />} />
        </div>
      )}
    </div>
  );
};

const Subtree = ({ item, organizationRef }) => {
  const { openFolder, onClickCheckBox } = useDirectoryContext();

  return (
    <div
      className="subtree text-[14px]"
      ref={(el) => {
        if (organizationRef && organizationRef.current)
          return (organizationRef.current[item?.objectId] = el);
      }}
    >
      <div className="parent cursor-pointer hover-user-select">
        {item?.type === "INSTITUTION" ? (
          <Checkbox
            onClick={() => onClickCheckBox(item)}
            checked={item?.checked}
            indeterminate={item?.indeterminate}
          />
        ) : (
          <IoPerson size={20} />
        )}

        {item?.type === "INSTITUTION" && openFolder(item)}
        {item?.type !== "INSTITUTION" && (
          <button
            onClick={() => onClickCheckBox(item)}
            className={
              item?.highlight
                ? "text-[#eda30f] flex flex-col"
                : "text-[black] flex flex-col "
            }
          >
            <span>
              {showName(item?.name)}
              <span className="text-[#2a55b9]">{showName(item?.phone)}</span>
            </span>
            <div className="text-[#2a55b9]">{showName(item?.mood)}</div>
          </button>
        )}
      </div>
      <div className="children">
        {item?.isOpen &&
          sortBy(item?.children, ["position"])?.map((i) => (
            <Subtree
              item={i}
              openFolder={openFolder}
              key={i?.id}
              onClickCheckBox={onClickCheckBox}
              organizationRef={organizationRef}
            />
          ))}
      </div>
    </div>
  );
};
export { Organization };
