import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";
import { format } from "date-fns";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage add student modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({

    courseName: "",
    startDate: "",
    endDate: "",
    totalStudent: "",
    activate: true,
    session: "",
    topic: "",

  });
  const openAddCourseModal = () => {
    // Reset giá trị của newStudent khi mở modal "Add"
    setNewCourse({
      courseName: "",
      startDate: "",
      endDate: "",
      totalStudent: "",
      activate: true,
      session: "",
      topic: "",
    });
    setIsAddModalOpen(true);  // Mở modal "Add"
  };

  const [pageIndex, setPageIndex] = useState(0); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số học viên mỗi trang
  useEffect(() => {
    fetchSessions();
    fetchTopics();
    fetchCourses();
  }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang

  // Fetch student types (called once when the component mounts)
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.get("http://localhost:8080/api/sessions", {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setSessions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };
  

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.get("http://localhost:8080/api/topics", {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setTopics(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching topic:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.get(`http://localhost:8080/api/courses`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setCourses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };
  

  const handleView = async (courseId) => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.get(`http://localhost:8080/api/courses/students/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setStudents(response.data);  // Lưu danh sách sinh viên vào state
      setSelectedCourse(courses.find(course => course.id === courseId));  // Chọn khóa học đã chọn
      setShowModal(true);  // Hiển thị modal
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };
  

  const handleEdit = (courseId) => {
    const courseToEdit = courses.find(course => course.id === courseId);
    if (courseToEdit) {
      setNewCourse({
        ...courseToEdit,
        session: courseToEdit.session || "", // Chắc chắn rằng studentType có giá trị hợp lệ
        topic: courseToEdit.topic || "",
      });
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy khóa học để chỉnh sửa.");
    }
  };

  const handleDelete = async (courseId) => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.put(`http://localhost:8080/api/courses/${courseId}/deactivate`, { isActive: false }, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setCourses(courses.filter((course) => course.id !== courseId));
      if (response.status === 200) {
        console.log("Deleted course:", courseId);
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };
  
  const handleAddCourse = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const courseToAdd = {
        ...newCourse,
        session: newCourse.session || null, // Sử dụng ID của studentType
        topic: newCourse.topic || null,
      };
  
      const response = await axios.post("http://localhost:8080/api/courses/addCourse", courseToAdd, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setCourses([...courses, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };
  
  const handleEditCourse = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const courseToUpdate = {
        ...newCourse,
        session: newCourse.session || null,
        topic: newCourse.topic || null,
      };
  
      // Gọi API để cập nhật khóa học
      await axios.put(`http://localhost:8080/api/courses/${newCourse.id}`, courseToUpdate, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
  
      // Lấy lại chi tiết khóa học đã chỉnh sửa từ API
      const response = await axios.get(`http://localhost:8080/api/courses/${newCourse.id}`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
  
      // Cập nhật danh sách khóa học với dữ liệu mới
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === newCourse.id ? response.data : course
        )
      );
  
      // Đóng modal sau khi cập nhật
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value, // Cập nhật giá trị của studentType
    }));
  };


  const actions = [
    { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
    { name: "edit", icon: "heroicons-outline:pencil-square", onClick: (courseId) => handleEdit(courseId) },
    { name: "delete", icon: "heroicons-outline:trash", onClick: handleDelete },
  ];

  // Hàm format lại ngày tháng
  const formatDate = (dateString) => {
    // Kiểm tra nếu dateString là mảng
    if (Array.isArray(dateString)) {
      // Chuyển mảng [2024, 6, 12] thành chuỗi ngày tháng hợp lệ "yyyy-MM-dd"
      const [year, month, day] = dateString;
      // Không cần +1 nữa, vì đã chuyển mảng thành chuỗi theo đúng định dạng
      dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

    // Định dạng ngày tháng theo định dạng "yyyy-MM-dd"
    return format(date, "yyyy-MM-dd");
  };


  // Slice the students array to simulate pagination
  const paginatedCourses = courses.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const totalPages = Math.ceil(courses.length / pageSize);

  return (

    <Card noborder>
      <h4 className="card-title">Course Table</h4>
      {loading ? (
        <p>Loading Courses...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
            <thead className="bg-slate-200 dark:bg-slate-700">
              <tr>
                <th className="table-th">STT</th>
                <th className="table-th">Course Code</th>
                <th className="table-th">Course Name</th>
                <th className="table-th">Start Date</th>
                <th className="table-th">End Date</th>
                <th className="table-th">Session</th>
                <th className="table-th">Topic</th>
                <th className="table-th">Total</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
              {paginatedCourses.map((course, index) => (
                <tr key={course.id}>
                  <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                  <td className="table-td">{course.courseCode}</td>
                  <td className="table-td">{course.courseName}</td>
                  <td className="table-td">{formatDate(course.startDate)}</td>
                  <td className="table-td">{formatDate(course.endDate)}</td>
                  <td className="table-td">{course.session?.sessionName}</td>
                  <td className="table-td">{course.topic?.topicName}</td>
                  <td className="table-td">{course.totalStudent}</td>
                  <td className="table-td">{course.activate ? "Active" : "Inactive"}</td>
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
                              onClick={() => action.onClick(course.id)}
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
        </div>
      )}

      <div>
        {/* Add Course Button */}
        <button
          onClick={openAddCourseModal}  // Gọi hàm mở modal và reset dữ liệu
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Add Course
        </button>

        {/* Add Course Modal */}
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
            <div className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
              <h2 className="text-2xl font-semibold mb-4">Add New Course</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCourse();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Course Name</label>
                  <input
                    type="text"
                    name="courseName"
                    value={newCourse.courseName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newCourse.startDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newCourse.endDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Total Student</label>
                  <input
                    type="number"
                    name="totalStudent"
                    value={newCourse.totalStudent}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                {/* Status Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Status</label>
                  <select
                    name="activate"
                    value={newCourse.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Session Type</label>
                  <select
                    name="session"
                    value={newCourse.session}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Session Type --</option>
                    {sessions.map((se) => (
                      <option key={se.id} value={se.id}>
                        {se.sessionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Topic Type</label>
                  <select
                    name="topic"
                    value={newCourse.topic}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Topic Type --</option>
                    {topics.map((se) => (
                      <option key={se.id} value={se.id}>
                        {se.topicName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                  >
                    Add Course
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
            <div className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
              <h2 className="text-2xl font-semibold mb-4">Edit Course</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditCourse();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Course Name</label>
                  <input
                    type="text"
                    name="courseName"
                    value={newCourse.courseName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newCourse.startDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newCourse.endDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Total Student</label>
                  <input
                    type="number"
                    name="totalStudent"
                    value={newCourse.totalStudent}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                {/* Status Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Status</label>
                  <select
                    name="activate"
                    value={newCourse.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                {/* Student Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Student Type</label>
                  <select
                    name="session"
                    value={newCourse.session}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Session Type --</option>
                    {sessions.map((se) => (
                      <option key={se.id} value={se.id}>
                        {se.sessionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Student Type</label>
                  <select
                    name="topic"
                    value={newCourse.topic}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Topic Type --</option>
                    {topics.map((to) => (
                      <option key={to.id} value={to.id}>
                        {to.topicName}
                      </option>
                    ))}
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

      <div>
        {/* Hiển thị modal với danh sách sinh viên */}
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
            <Modal onClose={() => setShowModal(false)} className="max-w-screen-lg">
              <h4>Students in {selectedCourse?.courseName}</h4>
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                  <thead className="bg-slate-200 dark:bg-slate-700">
                    <tr>
                      <th>Student Code</th>
                      <th>Full Name</th>
                      <th>Phone Number</th>
                      <th>Gender</th>
                      <th>Collected Money</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                    {students.length > 0 ? (
                      students.map((student) => (
                        <tr key={student.id}>
                          <td >{student.studentCode}</td>
                          <td >{student.fullName}</td>
                          <td >{student.phoneNumber}</td>
                          <td>{student.gender}</td>
                          <td >{student.collectedMoney === "1" ? "Đã đóng" : "Chưa đóng"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-3 text-center">No students found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Modal>
          </Transition>
        )}
      </div>
    </Card>
  );
};

export default CourseList;
