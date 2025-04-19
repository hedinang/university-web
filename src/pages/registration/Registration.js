import React, { useState } from "react";
import { Button, Form, Input, Spin } from "antd";
import apiFactory from "../../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import "./style.scss";
import winitechLogo from "../../assets/winitechLogo.jpg";

const Registration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const onFinish = async (values) => {
    setLoading(true);
    if (values.confirmPassword !== values.password) {
      toast.error("Your confirm password is inconsistant !");
      setLoading(false);
      return;
    }

    const result = await apiFactory.authApi.register({
      email: values.email.trim(),
      name: values.name.trim(),
      password: values.password.trim(),
    });
    setLoading(false);
    if (!result) return;

    if (result.status === 200) {
      navigate("/login");
    } else if (result.status === 401) {
      return toast.error("Current member is registered!");
    } else {
      return toast.error(result.message);
    }
  };
  return (
    <div className="register">
      <div className="img">
        <img src={winitechLogo} alt=""></img>
      </div>
      <div className="form">
        <Form
          initialValues={data}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <div>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                {
                  required: true,
                  message: "Required!",
                },
              ]}
            >
              <Input disabled={loading} />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Email Required!",
                  type: "email",
                },
              ]}
            >
              <Input disabled={loading} />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Required!",
                },
              ]}
            >
              <Input type="password" disabled={loading} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm password"
              rules={[
                {
                  required: true,
                  message: "Required!",
                },
              ]}
            >
              <Input type="password" disabled={loading} />
            </Form.Item>
            <Form.Item>
              <div className="register-button">
                <Button
                  className="bg-[#776d6d] text-[#f2f2f2]"
                  onClick={() => navigate("/login")}
                >
                  Back to login
                </Button>
                <Button
                  className="button w-[100px] bg-[#0082d1] text-[#f2f2f2]"
                  htmlType="submit"
                >
                  {loading ? (
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      }
                    />
                  ) : (
                    "Register"
                  )}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};
export { Registration };
