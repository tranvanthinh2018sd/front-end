import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";
import { format } from "date-fns";


const ClassScheduleList = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [classSchedules, setClassSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null); // Lưu thông tin lịch học được chọn để hiển thị chi tiết
  const [newClassSchedule, setNewClassSchedule] = useState({
    course: { courseName: '' },
    classRoom: { roomName: '' },
    classDate: '',
    startTime: '',
    endTime: '',
    activate: true
  });
  const openAddClassScheduleModal = () => {
    // Reset giá trị của newStudent khi mở modal "Add"
    setNewClassSchedule({
      courseName: "",
      roomName: "",
      classDate: "",
      startTime: "",
      endTime: "",
      activate: true,
    });


    setIsAddModalOpen(true);  // Mở modal "Add"
  };

  const [pageIndex, setPageIndex] = useState(0); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số học viên mỗi trang
  useEffect(() => {
    fetchClassRoom();
    fetchCourse();
    fetchClassSchedules();
  }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang


const fetchCourse = async () => {
  const token = localStorage.getItem("token"); // Lấy token
    try {
      const response = await axios.get("http://localhost:8080/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCourse(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
};

const fetchClassRoom = async () => {
  const token = localStorage.getItem("token"); // Lấy token
    try {
      const response = await axios.get("http://localhost:8080/api/class-rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassRoom(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching ClassRoom:", error);
    }
};

const fetchClassSchedules = async () => {
  const token = localStorage.getItem("token"); // Lấy token
    try {
      const response = await axios.get(`http://localhost:8080/api/class-schedules`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassSchedules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching classSchedules:", error);
      setClassSchedules([]);
    } finally {
      setLoading(false);
    }
};

const handleView = (classScheduleId) => {
    const classSchedule = classSchedules.find((s) => s.id === classScheduleId);
    if (classSchedule) {
      console.log("schedule data:", classSchedule);
      setSelectedSchedule({
        ...classSchedule,
      });
      setShowModal(true);
    } else {
      console.error("Không tìm thấy sinh viên với ID:", classScheduleId);
    }
};

const handleEdit = (classScheduleId) => {
    const classScheduleToEdit = classSchedules.find(schedule => classSchedules.id === classScheduleId);
    if (scheduleToEdit) {
      setNewClassSchedule({
        ...classScheduleToEdit,
      });
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy Lịch Học để chỉnh sửa.");
    }
};

const handleAddClassSchedule = async () => {
  const token = localStorage.getItem("token"); // Lấy token
    try {
      const classScheduleToAdd = {
        ...newClassSchedule,
      };

      const response = await axios.post("http://localhost:8080/api/class-schedules", classScheduleToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassSchedules([...classSchedules, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
};

const handleEditClassSchedule = async () => {
  const token = localStorage.getItem("token"); // Lấy token
    try {
      const classScheduleToUpdate = {
        ...newClassSchedule,
      };

      await axios.put(`http://localhost:8080/api/class-schedules/${newClassSchedule.id}`, classScheduleToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.get(`http://localhost:8080/api/class-schedules/${newClassSchedule.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClassSchedules((prevClassSchedules) =>
        prevSchedules.map((classSchedule) =>
          classSchedule.id === newClassSchedule.id ? response.data : classSchedule
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating class schedule:", error);
    }
};

const handleDelete = async (classScheduleId) => {
  const token = localStorage.getItem("token"); // Lấy token
    try {
      await axios.delete(`http://localhost:8080/api/class-schedules/${classScheduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassSchedules(classSchedules.filter((classSchedule) => classSchedule.id !== classScheduleId));
      console.log("Deleted class schedule:", classScheduleId);
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
};


  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewClassSchedule((prevClassSchedule) => ({
      ...prevClassSchedule,
      [name]: value,
    }));
  };



  const actions = [
    { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
    { name: "edit", icon: "heroicons-outline:pencil-square", onClick: (classScheduleId) => handleEdit(classScheduleId) },
    { name: "delete", icon: "heroicons-outline:trash", onClick: handleDelete },
  ];

  // Hàm format lại ngày tháng
  const formatDate = (dateString) => {
    // Kiểm tra nếu dateString là mảng
    if (Array.isArray(dateString)) {
      // Chuyển mảng [2009, 1, 8] thành chuỗi ngày tháng hợp lệ "yyyy-MM-dd"
      dateString = `${dateString[0]}-${String(dateString[1] + 1).padStart(2, '0')}-${String(dateString[2]).padStart(2, '0')}`;
    }

    // Kiểm tra nếu dateString không có giá trị
    if (!dateString) {
      console.error("Ngày tháng không hợp lệ: ", dateString);
      return "N/A"; // Trả về "N/A" nếu không có giá trị ngày tháng
    }

    // Tạo đối tượng Date từ dateString
    const date = new Date(dateString);

    // Kiểm tra nếu đối tượng Date không hợp lệ
    if (isNaN(date.getTime())) {
      console.error("Ngày tháng không hợp lệ:", dateString);
      return "N/A"; // Trả về "N/A" nếu đối tượng Date không hợp lệ
    }

    // Định dạng ngày theo định dạng "yyyy-MM-dd"
    return format(date, "yyyy-MM-dd");
  };


  // Slice the students array to simulate pagination
  const paginatedClassSchedules = classSchedules.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const totalPages = Math.ceil(classSchedules.length / pageSize);

  return (

    <Card noborder>
      <h4 className="card-title">Class Schedules Table</h4>
      {loading ? (
        <p>Loading class schedules...</p>
      ) : (
        <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
          <thead className="border-t border-slate-100 dark:border-slate-800">
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">Tên Khóa Học</th>
              <th className="table-th">Tên Lớp</th>
              <th className="table-th">Ngày Học</th>
              <th className="table-th">Giờ Bắt Đầu</th>
              <th className="table-th">Giờ Kết Thúc</th>
              <th className="table-th">Trạng Thái</th>
              <th className="table-th">Hành Động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
            {paginatedClassSchedules.map((classSchedule, index) => (
              <tr key={classSchedule.id}>
                <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                <td className="table-td">{classSchedule.course.courseName}</td>
                <td className="table-td">{classSchedule.classRoom.roomName}</td>
                <td className="table-td">{formatDate(classSchedule.classDate)}</td>
                <td className="table-td">{format(new Date(classSchedule.startTime), "HH:mm")}</td>
                <td className="table-td">{format(new Date(classSchedule.endTime), "HH:mm")}</td>
                <td></td>
                <td className="table-td">
                  <Dropdown
                    classMenuItems="right-0 w-[140px] top-[110%]"
                    label={
                      <span className="text-xl text-center block w-full">
                        <Icon icon="heroicons-outline:dots-vertical" />
                      </span>
                    }
                  >
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {actions.map((action, i) => (
                        <Menu.Item key={i}>
                          <div
                            className={`cursor-pointer px-4 py-2 text-sm flex items-center space-x-2 ${action.name === "delete"
                              ? "text-danger-500 hover:bg-danger-500 hover:text-white"
                              : "hover:bg-slate-900 hover:text-white"
                              }`}
                            onClick={() => action.onClick(classSchedule.id)} // Chỉ truyền student.id vào hàm
                          >
                            <Icon icon={action.icon} />
                            <span>{action.name}</span>
                          </div>
                        </Menu.Item>
                      ))}
                    </div>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div>
        {/* Add schedule Button */}
        <button
          onClick={openAddClassScheduleModal}  // Gọi hàm mở modal và reset dữ liệu
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Add schedule
        </button>

        {/* Add schedule Modal */}
        <Transition
          show={isAddModalOpen}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Modal onClose={() => setIsAddModalOpen(false)}>
            <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Add New schedule</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddClassSchedule();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên Khóa Học:</label>
                  <input
                    type="text"
                    name="courseName"
                    value={newClassSchedule.course.courseName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên Lớp</label>
                  <input
                    type="text"
                    name="roomName"
                    value={newClassSchedule.classRoom.roomName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày Học</label>
                  <input
                    type="date"
                    name="classDate"
                    value={newClassSchedule.classDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giờ Học</label>
                  <input
                    type="Date"
                    name="startTime"
                    value={newClassSchedule.startTime}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="activate"
                    value={newClassSchedule.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>


                {/* Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                  >
                    Add Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        </Transition>
      </div>
      <div>
        {/* Edit Modal */}
        <Transition
          show={isEditModalOpen}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Modal onClose={() => setIsEditModalOpen(false)}>
            <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Edit Schedule</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSchedule();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên Khóa Học</label>
                  <input
                    type="text"
                    name="courseName"
                    value={newClassSchedule.course.courseName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên Lớp</label>
                  <input
                    type="text"
                    name="roomName"
                    value={newClassSchedule.classRoom.roomName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ngày Học</label>
                  <input
                    type="date"
                    name="classDate"
                    value={newClassSchedule.classDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giờ Học</label>
                  <input
                    type="date"
                    name="startTime"
                    value={newClassSchedule.startTime}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="activate"
                    value={newClassSchedule.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>



                {/* Submit Button */}
                <button
                  type="submit"
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </Modal>
        </Transition>

        {/* Other Code */}
      </div>


      <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <select className="form-control py-2 w-max" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[5, 10, 15].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page <span>{pageIndex + 1} of {totalPages}</span>
          </span>
        </div>

        <ul className="flex items-center space-x-3 rtl:space-x-reverse">
          <li>
            <button
              className={`text-xl leading-4 ${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <Icon icon="heroicons:chevron-double-left-solid" />
            </button>
          </li>
          <li>
            <button
              className={`text-sm leading-4 ${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setPageIndex(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              Prev
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index}>
              <button
                className={`text-sm rounded leading-[16px] ${index === pageIndex ? "bg-slate-900 dark:bg-slate-600 text-white" : "bg-slate-100 dark:bg-slate-700"}`}
                onClick={() => setPageIndex(index)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              className={`text-sm leading-4 ${pageIndex === totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={pageIndex === totalPages - 1}
            >
              Next
            </button>
          </li>
          <li>
            <button
              className={`text-xl leading-4 ${pageIndex === totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => setPageIndex(totalPages - 1)}
              disabled={pageIndex === totalPages - 1}
            >
              <Icon icon="heroicons:chevron-double-right-solid" />
            </button>
          </li>
        </ul>
      </div>

      {showModal && (
        <Transition
          show={showModal}
          enter="transition-opacity duration-75"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Modal onClose={() => setShowModal(false)}>
            <h4>Schedule Details</h4>
            <p><strong>Tên Khóa Học:</strong> {selectedSchedule.course.courseName}</p>
            <p><strong>Tên Lớp:</strong> {selectedSchedule.classRoom.roomName}</p>
            <p><strong>Ngày Học:</strong> {formatDate(selectedSchedule.classDate)}</p>
            <p><strong>Giờ Học:</strong> {format(new Date(selectedSchedule.startTime), "HH:mm")} - {format(new Date(selectedSchedule.endTime), "HH:mm")}</p>
            <p><strong>Trạng Thái:</strong> {selectedSchedule.status}</p>

          </Modal>
        </Transition>
      )}
    </Card>
  );
};

export default ClassScheduleList;
