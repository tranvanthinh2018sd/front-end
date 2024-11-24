import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";
import { format } from "date-fns";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [studentTypes, setStudentTypes] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage add student modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({

    fullName: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    gender: "Male",
    nationalID: "",
    email: "",
    activate: true,
    imageName: "",
    collectedMoney: "1",
    studentType: "",

  });
  const openAddStudentModal = () => {
    // Reset giá trị của newStudent khi mở modal "Add"
    setNewStudent({
      fullName: "",
      dateOfBirth: "",
      address: "",
      phoneNumber: "",
      gender: "Male",  // Chắc chắn rằng giới tính mặc định là "Male"
      nationalID: "",
      email: "",
      activate: true,
      imageName: "",
      collectedMoney: "1",
      studentType: "",  // Reset lại studentType
    });
    setIsAddModalOpen(true);  // Mở modal "Add"
  };

  const [pageIndex, setPageIndex] = useState(0); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số học viên mỗi trang
  useEffect(() => {
    fetchStudentTypes();
    fetchStudents();
  }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang

  const token = localStorage.getItem("token");

  // Fetch student types (called once when the component mounts)
  const fetchStudentTypes = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.get("http://localhost:8080/api/student-type", {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setStudentTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching student types:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.get(`http://localhost:8080/api/student`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };
  

  const handleView = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      console.log("Student data:", student);
      setSelectedStudent({
        ...student,
        dateOfBirth: student.dateOfBirth || "",
        studentTypes: student.studentType ? student.studentType[0] : null, // Lấy studentType đầu tiên nếu là mảng
      });
      setShowModal(true);
    } else {
      console.error("Không tìm thấy sinh viên với ID:", studentId);
    }
  };

  const handleEdit = (studentId) => {
    const studentToEdit = students.find(student => student.id === studentId);
    if (studentToEdit) {
      setNewStudent({
        ...studentToEdit,
        studentType: studentToEdit.studentType || "", // Chắc chắn rằng studentType có giá trị hợp lệ
      });
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy sinh viên để chỉnh sửa.");
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const response = await axios.put(`http://localhost:8080/api/student/${studentId}/deactivate`, 
        { isActive: false }, 
        { headers: { Authorization: `Bearer ${token}` } } // Thêm token
      );
      if (response.status === 200) {
        setStudents(students.filter((student) => student.id !== studentId));
        console.log("Deactivated student:", studentId);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };
  const handleAddStudent = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const studentToAdd = {
        ...newStudent,
        studentType: newStudent.studentType || null, // Sử dụng ID của studentType
      };
  
      const response = await axios.post("http://localhost:8080/api/student/addStudent", studentToAdd, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
      
      setStudents([...students, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };
  
  const handleEditStudent = async () => {
    try {
      const token = localStorage.getItem("token"); // Lấy token
      const studentToUpdate = {
        ...newStudent,
        studentType: newStudent.studentType || null,
      };
  
      // Gọi API để cập nhật sinh viên
      await axios.put(`http://localhost:8080/api/student/${newStudent.id}`, studentToUpdate, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
  
      // Lấy lại chi tiết sinh viên đã chỉnh sửa từ API
      const response = await axios.get(`http://localhost:8080/api/student/${newStudent.id}`, {
        headers: { Authorization: `Bearer ${token}` }, // Thêm token vào header
      });
  
      // Cập nhật danh sách sinh viên với dữ liệu mới
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === newStudent.id ? response.data : student
        )
      );
  
      // Đóng modal sau khi cập nhật
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewStudent((prevStudent) => ({
      ...prevStudent,
      [name]: value, // Cập nhật giá trị của studentType
    }));
  };


  const actions = [
    { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
    { name: "edit", icon: "heroicons-outline:pencil-square", onClick: (studentId) => handleEdit(studentId) },
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
  const paginatedStudents = students.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const totalPages = Math.ceil(students.length / pageSize);

  return (

    <Card noborder>
      <div className="relative">
        <h4 className="card-title">Student Table</h4>
        {loading ? (
          <p>Loading students...</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
            <thead className="bg-slate-200 dark:bg-slate-700">
              <tr>
                <th className="table-th">STT</th>
                <th className="table-th">Student Code</th>
                <th className="table-th">Full Name</th>
                <th className="table-th">Date of Birth</th>
                <th className="table-th">Gender</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
              {paginatedStudents.map((student, index) => (
                <tr key={student.id}>
                  <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                  <td className="table-td">{student.studentCode}</td>
                  <td className="table-td">{student.fullName}</td>
                  <td className="table-td">{formatDate(student.dateOfBirth)}</td>
                  <td className="table-td">{student.gender === "Male" ? "Male" : "Female"}</td>
                  <td className="table-td">{student.activate ? "Active" : "Inactive"}</td>
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
                              onClick={() => action.onClick(student.id)} // Chỉ truyền student.id vào hàm
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
      </div>
      <div>
        {/* Add Student Button */}
        <button
          onClick={openAddStudentModal}  // Gọi hàm mở modal và reset dữ liệu
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Add Student
        </button>

        {/* Add Student Modal */}
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
              <h2 className="text-2xl font-semibold mb-4">Add New Student</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddStudent();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newStudent.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newStudent.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newStudent.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={newStudent.phoneNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Gender Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={newStudent.gender}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">NationalID</label>
                  <input
                    type="text"
                    name="nationalID"
                    value={newStudent.nationalID}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={newStudent.email}
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
                    value={newStudent.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image Name</label>
                  <input
                    type="text"
                    name="imageName"
                    value={newStudent.imageName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Type</label>
                  <select
                    name="studentType"
                    value={newStudent.studentType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Student Type --</option>
                    {studentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.studentTypeName}
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
                    Add Student
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
              <h2 className="text-2xl font-semibold mb-4">Edit Student</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditStudent();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newStudent.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newStudent.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newStudent.address}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={newStudent.phoneNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Gender Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={newStudent.gender}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* NationalID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">National ID</label>
                  <input
                    type="text"
                    name="nationalID"
                    value={newStudent.nationalID}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={newStudent.email}
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
                    value={newStudent.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                {/* Image Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Image Name</label>
                  <input
                    type="text"
                    name="imageName"
                    value={newStudent.imageName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Student Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Type</label>
                  <select
                    name="studentType"
                    value={newStudent.studentType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Student Type --</option>
                    {studentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.studentTypeName}
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
            <h4>Student Details</h4>
            <p><strong>Student Code:</strong> {selectedStudent.studentCode}</p>
            <p><strong>Full Name:</strong> {selectedStudent.fullName}</p>
            <p><strong>Date of birth:</strong> {formatDate(selectedStudent?.dateOfBirth)}</p>
            <p><strong>Address:</strong> {selectedStudent.address}</p>
            <p><strong>Gender:</strong> {selectedStudent.gender === "1" ? "Male" : "Female"}</p>
            <p><strong>Phone Number:</strong> {selectedStudent.phoneNumber}</p>
            <p><strong>NationID:</strong> {selectedStudent.nationalID}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Status:</strong> {selectedStudent.activate === "1" ? "Activate" : "Inactivate"}</p>
            <p><strong>Collected Money:</strong> {selectedStudent.collectedMoney === "1" ? "Đã đóng" : "Chưa đóng"}</p>
            <p><strong>Student Type:</strong> {selectedStudent?.studentType?.studentTypeName || "N/A"}</p>

          </Modal>
        </Transition>
      )}
    </Card>
  );
};

export default StudentList;
