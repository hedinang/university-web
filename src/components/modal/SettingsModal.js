import { Modal } from "antd";
import "./style.scss";
import { tabSettings } from "../../config/Constant";
import React, {useEffect, useState} from "react";
import {
  LeftOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import apiFactory from "../../api";
import { useInfoUser } from "../../store/UserStore";
import { toast } from "react-toastify";

const SettingsModal = ({ onCancel, open }) => {
  const { user, languageMap, updateUser, updateLanguageMap } = useInfoUser();
  const [tabNumb, setTabNumb] = useState(null);
  const [isLeftSide, setIsLeftSide] = useState(true);

  const changeLanguage = async (value) => {
    const params = {
      language: value,
    };
    const me = await apiFactory.userApi.saveMe(params);

    if (me?.status === 200) {
      updateUser(me?.data?.user);
      updateLanguageMap(me?.data?.languageMap);
    } else {
      toast.error(me?.message);
      updateUser(null);
    }
  };

  const switchTab = (value) => {
    setTabNumb(value);
    setIsLeftSide(false);
  };

  const handleClickLeftSide = () => {
    setIsLeftSide(true);
    setTabNumb(null);
  };

  const handleClickRightSide = () => {
    setIsLeftSide(false);
  };

  const renderComponentTab = () => {
    switch (tabNumb) {
      case tabSettings.GENERAL_SETTINGS: {
        return (
          <>
            <div className="py-2">
              <div>
                <div className="settings-right-titles">
                  {languageMap
                    ? languageMap["modal.generalSettings.languageTitle"]
                    : "Language"}
                </div>
                <div className="settings-note-text mt-1">
                  {languageMap
                    ? languageMap["modal.generalSettings.languageSubTitle"]
                    : "Change the system language"}
                </div>
              </div>
              <div className="flex flex-row bg-white rounded-[15px] mt-[20px] pt-[15px] pr-[15px] pb-[15px] pl-[15px] items-center">
                <div>
                  <span className="settings-option-content">
                    {languageMap
                      ? languageMap["modal.generalSettings.changeLanguage"]
                      : "Change language"}
                  </span>
                </div>
                <div className="ml-auto">
                  <div className="relative inline-block">
                    <select
                      value={user?.language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="appearance-none bg-white rounded-lg border border-gray-300 px-4 py-2 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                    >
                      <option value="kr">Korea</option>
                      <option value="us">English</option>
                      <option value="vn">VietNam</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                        <path d="M10 12l-6-6 1.5-1.5L10 9l4.5-4.5L16 6l-6 6z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      }
      default: {
        return <></>;
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setTabNumb(tabSettings.GENERAL_SETTINGS);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closeIcon={true}
      width={800}
      title={
        <>
          <div className="flex flex-row">
            {!isLeftSide && (
              <a className="btn-back-to-settings" onClick={handleClickLeftSide}>
                <LeftOutlined />
              </a>
            )}
            <div className="ml-3">
              <span className="settings-title">
                {languageMap ? languageMap["modal.settings.title"] : "Settings"}
              </span>
            </div>
          </div>
        </>
      }
      titleFontSize={24}
      className="mb-5"
    >
      <div className="desktop">
        <div className="list-group">
          <div className="list-group-column pr-4">
            <ul className="mt-5">
              <li
                className={
                  tabNumb === tabSettings.GENERAL_SETTINGS ? "tab-active" : ""
                }
                onClick={() => {
                  switchTab(tabSettings.GENERAL_SETTINGS);
                  handleClickRightSide();
                }}
              >
                <SettingOutlined className="items-center pr-2" />
                <span className="settings-left-titles">
                  {languageMap
                    ? languageMap["modal.generalSettings.tabName"]
                    : "General settings"}
                </span>
              </li>
            </ul>
          </div>
          <div className="list-group-column p-5" key={tabNumb}>
            {tabNumb && renderComponentTab()}
          </div>
        </div>
      </div>
      <div className="mobile">
        <div className="list-group">
          <div
            className={
              isLeftSide
                ? "block list-group-column"
                : "hidden list-group-column"
            }
          >
            <ul className="mt-5">
              <li
                className={
                  tabNumb === tabSettings.GENERAL_SETTINGS ? "tab-active" : ""
                }
                onClick={() => switchTab(tabSettings.GENERAL_SETTINGS)}
              >
                <SettingOutlined className="items-center pr-2" />
                <span className="settings-left-titles">
                  {languageMap
                    ? languageMap["modal.generalSettings.tabName"]
                    : "General settings"}
                </span>
              </li>
            </ul>
          </div>
          <div
            className={
              isLeftSide
                ? "hidden list-group-column mt-5 pt-10 ml-5"
                : "block list-group-column p-3"
            }
            key={tabNumb}
          >
            {tabNumb && renderComponentTab()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export { SettingsModal };
