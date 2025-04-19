import React, {useEffect, useState} from "react";
import {Modal, Tabs} from "antd";
import {toast} from "react-toastify";
import {useInfoUser} from "../../store/UserStore";
import {BasicMemberInfo} from "../select/directory/BasicMemberInfo";
import apiFactory from "../../api";
import {CHATTING} from "../../config/Constant";

const MemberReadUnreadModal = ({conversationId, messageId, isModalMembersReadUnread, onCancel}) => {
    const {languageMap} = useInfoUser();
    const [tabs, setTabs] = useState([]);
    const [memberSearch, setMemberSearch] = useState({
        search: {
            conversationId: conversationId,
            messageId: messageId,
            viewType: "ALL"
        },
        ts: new Date(),
        page: 1,
        limit: CHATTING.MEMBER_LIMIT
    });
    const [memberList, setMemberList] = useState([]);
    const [activeKey, setActiveKey] = useState("ALL");

    const changeTab = (key) => {
        setActiveKey(key);
        setMemberList([]);
        setMemberSearch((prevSearch) => ({
            ...prevSearch,
            search: {
                conversationId: conversationId,
                messageId: messageId,
                viewType: key
            },
            page: 1
        }))
    }

    const fetchMembersData = async () => {
        const result = await apiFactory.userConversationApi.getMembersReadUnread(memberSearch);
        if (result?.status !== 200) return toast.error(result?.message);
        setMemberList([...memberList, ...result?.data?.items]);
    };

    const handleScroll = async (event) => {
        if (event.currentTarget.scrollTop + event.currentTarget.clientHeight >= event.currentTarget.scrollHeight && event.currentTarget.scrollHeight !== 0) {
            setMemberSearch(prevState => {
                return {
                    ...prevState,
                    page: prevState.page + 1
                }
            })
        }
    }

    useEffect(() => {
        fetchMembersData();
    }, [memberSearch]);

    const generateTabs = () => {
        return (
            <div className="h-[550px] overflow-y-scroll" onScroll={handleScroll}>
                {memberList?.map((member) => {
                    return (
                        <BasicMemberInfo
                            memberGroup={member?.organizations}
                            screenInfo={"READ_UNREAD"}
                            isHost={member?.role === "HOST"}
                            hasRead={member?.hasRead}
                            lastSeenTs={member?.lastSeenTs}
                            key={member?.userId}
                        />
                    );
                })}
            </div>);
    };

    useEffect(() => {
        const tabsContent = generateTabs();
        const items = [
            {
                key: "ALL",
                label: languageMap ? languageMap["modal.seen.all"] : "All",
                destroyInactiveTabPane: true,
                children: tabsContent
            },
            {
                key: "READ",
                label: languageMap ? languageMap["modal.seen.read"] : "Read",
                destroyInactiveTabPane: true,
                children: tabsContent
            },
            {
                key: "UNREAD",
                label: languageMap ? languageMap["modal.seen.unread"] : "Unread",
                destroyInactiveTabPane: true,
                children: tabsContent
            }
        ];
        setTabs(items);
    }, [memberList, languageMap]);

    return (
        <>
            <Modal
                title={languageMap ? languageMap["modal.seen.title"] : "Read/Unread"}
                visible={isModalMembersReadUnread}
                onCancel={onCancel}
                width="600px"
                footer={false}
            >
                <Tabs
                    defaultActiveKey="ALL"
                    activeKey={activeKey}
                    items={tabs}
                    onChange={changeTab}
                />
            </Modal>
        </>
    );
};

export default MemberReadUnreadModal;