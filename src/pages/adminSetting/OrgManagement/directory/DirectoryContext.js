import { debounce } from "lodash";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FaFolderClosed, FaRegFolderOpen } from "react-icons/fa6";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import apiFactory from "../../../../api";
import { showName } from "../../../../utils/Utils";

const DirectoryContext = createContext(null);

export const useDirectoryContext = () => {
  return useContext(DirectoryContext);
};

export const DirectoryProvider = ({
  children,
  orgList,
  setOrgList,
  isOpen,
  conversationId,
  existedMemberIds,
  module,
}) => {
  const [tree, setTree] = useState([]);
  const [isCheckedList, setIsCheckedList] = useState(false);
  const [searchResult, setSearchResult] = useState();
  const [isTreeLoading, setIsTreeLoading] = useState(false);
  const [isCheckedLoading, setIsCheckedLoading] = useState(false);
  const [checkedList, setCheckedList] = useState([]);
  const [checkedParent, setCheckedParent] = useState(null);
  const [isCreateOrgModal, setIsCreateOrgModal] = useState(false);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [availableUserList, setAvailableUserList] = useState([]);
  const [memberGroupList, setMemberGroupList] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 860);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 860);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getUniqueItems = (itemList) => {
    let uniqueItemIdsSet = new Set(
      itemList
        ?.filter((item) => item?.isOrg === false && item?.checked)
        .map((item) => item.objectId)
    );

    let uniqueItems = Array.from(uniqueItemIdsSet, (itemId) => {
      let correspondingItem = itemList.find((item) => item.objectId === itemId);
      return { itemId, name: correspondingItem?.name };
    });

    return uniqueItems;
  };

  const listToTree = (list) => {
    const map = {};
    const tree = [];

    // Create a mapping of id to object and initialize the tree
    list?.forEach((item) => {
      map[item?.objectId] = { ...item, children: [] };
    });

    // Build the tree by linking children to their parents
    list?.forEach((item) => {
      if (item?.parentId !== null && item?.parentId !== "") {
        map[item.parentId]?.children?.push(map[item?.objectId]);
      } else {
        tree.push(map[item?.objectId]);
      }
    });

    return tree;
  };

  const updateCheckedStatus = (data, nodeId, checked) => {
    const getNodesById = (objectId) =>
      data.filter((node) => node?.objectId === objectId);

    const updateChildrenCheckedStatus = (parentId, checked) => {
      const children = data.filter((node) => node.parentId === parentId);
      children.forEach((child) => {
        child.checked = checked;
        updateChildrenCheckedStatus(child?.objectId, checked);
        updateCheckedStatus(data, child?.objectId, checked);
      });
    };

    const updateParentCheckedStatus = (parentId) => {
      const parentNode = data.find((node) => node?.objectId === parentId);
      if (!parentNode) return; // Parent not found

      const allChildrenChecked = data
        .filter((node) => node.parentId === parentId)
        .every((child) => child.checked);

      parentNode.checked = allChildrenChecked;
      parentNode.indeterminate = !allChildrenChecked && parentNode.checked;

      if (parentNode.parentId !== null) {
        updateParentCheckedStatus(parentNode.parentId);
      }
    };

    const updateNodes = (objectId, checked) => {
      getNodesById(objectId).forEach((node) => {
        node.checked = checked;
        updateChildrenCheckedStatus(node?.objectId, checked);
        updateParentCheckedStatus(node.parentId);
      });
    };

    updateNodes(nodeId, checked);
  };

  const fetchOrganizations = async (conversationId, existedMemberIds) => {
    setIsTreeLoading(true);
    
    const request = {
      name: "",
      conversationId: conversationId,
      existedMemberIds: existedMemberIds,
      module: module,
      setting: true,
    };

    let result;

    if (module === "WORK_MANAGEMENT") {
      result = await apiFactory.organizationUserApi.search(request);
    } else {
      result = await apiFactory.organizationApi.search(request);
    }

    if (result?.status !== 200) {
      toast.error(result?.message);
      return;
    }

    const orgs = result?.data?.map((org) => ({
      ...org,
      checked: false,
      indeterminate: false,
      fetched: true,
      isOpen: false,
      id: uuidv4(),
    }));

    //auto open root node
    for (let org of orgs) {
      if (org?.parentId) continue;
      org.isOpen = true;
    }

    setOrgList([...orgs]);
    setIsTreeLoading(false);
  };

  const onClickFolder = async (item) => {
    const closeFolder = orgList?.find(
      (org) => org?.objectId === item?.objectId
    );

    if (closeFolder.isOpen) {
      closeFolder.isOpen = false;
      setOrgList([...orgList]);
    } else {
      closeFolder.isOpen = true;
      setOrgList([...orgList]);
    }
  };

  const openFolder = (item) => {
    if (item?.children?.length === 0) {
      return (
        <>
          <FaFolderClosed
            className="cursor-pointer"
            size={20}
            color="#8C8C8C"
          ></FaFolderClosed>
          <div
            className={
              item?.highlight
                ? "text-[#eda30f] cursor-pointer"
                : "cursor-pointer text-[black]"
            }
          >
            {showName(item?.name)}
          </div>
        </>
      );
    }

    return item?.isOpen ? (
      <>
        <FaRegFolderOpen
          className="cursor-pointer"
          size={20}
          color="#87d068"
          onClick={() => onClickFolder(item)}
        ></FaRegFolderOpen>
        <div
          onClick={() => onClickFolder(item)}
          className={
            item?.highlight
              ? "text-[#eda30f] cursor-pointer"
              : "cursor-pointer text-[black]"
          }
        >
          {showName(item?.name)}
        </div>
      </>
    ) : (
      <>
        <FaFolderClosed
          className="cursor-pointer"
          size={20}
          color="#539edf"
          onClick={() => onClickFolder(item)}
        ></FaFolderClosed>
        <div
          onClick={() => onClickFolder(item)}
          className={
            item?.highlight
              ? "text-[#eda30f] cursor-pointer"
              : "cursor-pointer text-[black]"
          }
        >
          {showName(item?.name)}
        </div>
      </>
    );
  };

  const onClickCheckBox = (item) => {
    const existedCheck = orgList?.findIndex(
      (org) => org?.objectId === item?.objectId && org?.checked
    );

    if (existedCheck > -1) {
      orgList[existedCheck].checked = false;
      setCheckedParent(null);
    } else {
      orgList?.forEach((org) => (org.checked = false));
      const orgIndex = orgList?.findIndex(
        (org) => org?.objectId === item?.objectId
      );
      orgList[orgIndex].checked = true;
      setCheckedList(
        orgList?.filter((org) => org?.parentId === item?.objectId)
      );
      setCheckedParent(item?.objectId);
    }

    setOrgList([...orgList]);
  };

  const onBackOrgRoot = () => {
    orgList?.forEach((org) => (org.checked = false));
    setCheckedParent(null);
    setOrgList([...orgList]);
  };

  const onDeleteItem = (item) => {
    updateCheckedStatus(orgList, item?.objectId, false);
    setOrgList([...orgList]);
  };

  const showChoseUser = useMemo(() => {
    const users = getUniqueItems(orgList);
    return users?.map((user) => <div key={user?.itemId}>{user?.name}</div>);
  }, [orgList]);

  const debouncedFilterOrg = debounce(async (name, conversationId) => {
    setIsTreeLoading(true);
    orgList
      ?.filter((org) => org?.parentId)
      ?.forEach((org) => (org.isOpen = false));
    orgList
      ?.filter((org) => org?.highlight)
      ?.forEach((org) => (org.highlight = false));

    if (name !== "") {
      let result;
      if (module === "WORK_MANAGEMENT") {
        result = await apiFactory.organizationUserApi.search({
          name,
          conversationId,
          existedMemberIds,
          setting: true,
        });
      } else {
        result = await apiFactory.organizationApi.search({
          name,
          conversationId,
          existedMemberIds,
          setting: true,
        });
      }

      if (result?.status !== 200) {
        toast.error(result?.message);
        return;
      }

      if (result?.data?.length > 0) {
        setSearchResult(result?.data);

        orgList
          ?.filter((org) => org?.highlight)
          ?.forEach((org) => (org.highlight = false));

        addSearchOrg(result?.data, true);
        const orgPaths = [];
        result?.data?.forEach((org) => {
          if (org?.paths) {
            orgPaths?.push(...org.paths);
          }
        });

        // these is nodes which are belong to searched node parent
        const nearAndRelatedOrgs =
          await apiFactory.organizationUserApi.getListChildren({
            withoutObjectIds: [],
            parentIds: orgPaths?.map((e) => e?.objectId),
          });

        nearAndRelatedOrgs?.data?.forEach((searchOrg) => {
          const orgIndex = orgList?.findIndex(
            (org) => org?.objectId === searchOrg?.objectId
          );
          if (orgIndex === -1) {
            orgList?.push({
              ...searchOrg,
              checked: false,
              indeterminate: false,
              fetched: false,
              isOpen: false,
              id: uuidv4(),
            });
          }
        });
      }
    }
    setOrgList([...orgList]);
    setIsTreeLoading(false);
  }, 500);

  const addSearchOrg = (searchOrgs, highlight) => {
    searchOrgs?.forEach((searchOrg) => {
      const org = orgList?.find(
        (org) =>
          org?.objectId === searchOrg?.objectId &&
          org?.parentId === searchOrg?.parentId
      );

      // no need to open folder if it is highlighted
      if (!org) {
        const orgIds = searchOrg?.paths?.map((e) => e?.objectId);

        const checkedParent = orgList
          ?.filter((e) => orgIds?.includes(e?.objectId))
          ?.find((e) => e?.checked);

        orgList?.push({
          ...searchOrg,
          checked: !!checkedParent,
          indeterminate: false,
          fetched: true,
          isOpen: !highlight,
          id: uuidv4(),
          highlight: highlight,
        });
      } else {
        org.isOpen = !highlight;
        org.highlight = highlight;
      }

      addSearchOrg(searchOrg?.paths, false);
    });
  };

  useEffect(() => {
    if (!orgList?.some((org) => org?.checked)) {
      setCheckedList([...orgList?.filter((org) => !org?.parentId)]);
    }

    const items = listToTree(
      orgList?.filter((org) => org?.type === "INSTITUTION")
    );
    setTree(items);
  }, [orgList]);

  useEffect(() => {
    if (!isOpen) return;

    if (conversationId || (!conversationId && orgList?.length === 0)) {
      fetchOrganizations(conversationId, existedMemberIds);
    }
  }, [isOpen]);

  const values = useMemo(
    () => ({
      tree,
      orgList,
      setOrgList,
      getUniqueItems,
      listToTree,
      searchResult,
      updateCheckedStatus,
      openFolder,
      onClickCheckBox,
      showChoseUser,
      onDeleteItem,
      fetchOrganizations,
      debouncedFilterOrg,
      isCheckedList,
      setIsCheckedList,
      setSearchResult,
      conversationId,
      isTreeLoading,
      isCheckedLoading,
      checkedList,
      isCreateOrgModal,
      setIsCreateOrgModal,
      setCheckedParent,
      checkedParent,
      isAddUserModal,
      setIsAddUserModal,
      onBackOrgRoot,
      setCheckedList,
      availableUserList,
      setAvailableUserList,
      memberGroupList,
      setMemberGroupList,
      isMobile,
    }),
    [
      tree,
      orgList,
      isCheckedList,
      searchResult,
      isTreeLoading,
      isCheckedLoading,
      checkedList,
      isCreateOrgModal,
      checkedParent,
      isAddUserModal,
      availableUserList,
      memberGroupList,
      isMobile,
    ]
  );

  return (
    <DirectoryContext.Provider value={values}>
      {children}
    </DirectoryContext.Provider>
  );
};
