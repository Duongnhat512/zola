import { EditTwoTone } from "@ant-design/icons";
import { Button, Image, Modal } from "antd";
import React from "react";
import { useSelector } from "react-redux";

const Profile = ({ isModalOpen, setModalOpen }) => {
  const isAuthenticated = useSelector((state) => state.user.authenticated);
  const user = useSelector((state) => state.user.user);

  return (
    <>
      <Modal
        title="Thông tin tài khoản"
        open={isModalOpen}
        width={400}
        onCancel={() => setModalOpen(false)}
        centered
        footer={null}
        className="rounded-2xl"
      >
        <div>
          <Image width="100%" height={200} src={user?.avt} />
          <div className="flex gap-5 items-center ml-6 relative bottom-5">
            <Image
              width={80}
              height={80}
              className="border-2"
              style={{ borderRadius: "50%" }}
              src={user?.avt}
            />
            <div className="flex items-center gap-2">
              <h1 className="font-sans text-xl">
                {user?.fullname || "Người dùng"}{" "}
              </h1>
              <Button className="border-0 text-sm">
                <EditTwoTone />
              </Button>
            </div>
          </div>
          <div className="border-separate"></div>
          <div>
            <div className=" text-xl">Thông tin cá nhân</div>
            <table className="table-auto border-collapse w-full mt-4">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Giới tính</td>
                  <td className="px-4 py-2">{user?.gender}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Ngày sinh</td>
                  <td className="px-4 py-2">{user?.dob}</td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-medium">Điện thoại</td>
                  <td className="px-4 py-2">(+84) {user?.username}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4">
            <Button className="border-0 text-xl">
              <EditTwoTone /> Cập nhật
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Profile;
