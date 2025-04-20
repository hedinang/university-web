import {
  CloseOutlined,
  LeftOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Form,
  Menu,
  Row,
  Select,
} from "antd";
import "./style.scss";
import dayjs from "dayjs";
import Search from "antd/es/input/Search";
import { addMonths } from "date-fns";
import { useState } from "react";

const SideBarCalendar = ({
  isOpen,
  onClose,
  handleOpenModal,
  onSearch,
  form,
}) => {
  const [typeEvent, setTypeEvent] = useState(null);

  const handleOpenModalCreate = () => {
    handleOpenModal(null, {});
    onClose();
  };

  const renderBody = () => {
    switch (typeEvent) {
      case null:
        return defaultBody();
      case "SEARCH":
        return renderSearch();
      default:
        return defaultBody();
    }
  };

  const handleSearch = (values) => {
    onSearch(values);
    onClose();
  };

  const defaultBody = () => {
    return (
      <Menu
        mode="inline"
        width={350}
        inlineCollapsed={false}
        className="py-4 overflow-y-auto space-y-2 font-medium"
      >
        <Menu.Item
          className="cursor-pointer"
          onClick={() => setTypeEvent("SEARCH")}
        >
          <div className="drawer-item">
            <div className="drawer-item-icon">
              <SearchOutlined size={20} color="black" />
            </div>
            <div className="ms-3">
              <span>Search</span>
            </div>
          </div>
        </Menu.Item>
        <Menu.Item
          className="cursor-pointer"
          onClick={(e) => handleOpenModalCreate(e)}
        >
          <div className="drawer-item">
            <div className="drawer-item-icon">
              <PlusOutlined size={20} color="black" />
            </div>
            <div className="ms-3">
              <span>Create event</span>
            </div>
          </div>
        </Menu.Item>
      </Menu>
    );
  };

  const renderSearch = () => {
    return (
      <Form
        form={form}
        name="searchCalendarDrawerForm"
        onFinish={handleSearch}
        style={{ maxWidth: 300 }}
      >
        <div className="flex flex-row">
          <a onClick={() => setTypeEvent(null)}>
            <CloseOutlined className="drawer-btn-close" />
          </a>
        </div>
        <div className="pb-3">
          <Row className="mt-2">
            <Col span={24}>
              <label>Event Name:</label>
              <Form.Item
                className="mb-0"
                name="content"
                wrapperCol={{ span: 24 }}
                labelCol={{ span: 8 }}
              >
                <Search
                  size="small"
                  placeholder="Search events content"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col span={24}>
              <div>
                <label>Schedule Type:</label>
                <Form.Item
                  name="type"
                  wrapperCol={{ span: 24 }}
                  labelCol={{ span: 8 }}
                >
                  <Select
                    style={{ width: "100%" }}
                    defaultValue={null}
                    size="small"
                    options={[
                      { value: null, label: "All" },
                      { value: "WORK", label: "Work" },
                      { value: "BUSINESS_TRIP", label: "Business trip" },
                      { value: "VACATION", label: "Vacation" },
                      { value: "ETC", label: "Etc" },
                    ]}
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>
          <Row justify="end">
            <div>
              <Button
                type="primary"
                htmlType="submit"
                size="small"
                className="w-100"
              >
                Submit
              </Button>
            </div>
          </Row>
        </div>
      </Form>
    );
  };

  return (
    <Drawer
      placement={"right"}
      closable={false}
      onClose={onClose}
      open={isOpen}
      width={350}
      className="drawer-visible"
      title={
        <>
          {!typeEvent && (
            <div className="flex flex-row">
              <span className="drawer-label">
                <a onClick={onClose}>
                  <LeftOutlined className="drawer-btn-close" />
                </a>
                Menu
              </span>
            </div>
          )}
        </>
      }
    >
      {renderBody()}
    </Drawer>
  );
};

export { SideBarCalendar };
