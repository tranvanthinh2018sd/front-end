import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";
import { format } from "date-fns";

const TuitionFeeList = () => {
  const [tuitionFees, setTuitionFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTuitionFee, setSelectedTuitionFee] = useState(null);
  const [courses, setCourses] = useState([]);
  const [Topics, setTopics] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage add student modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTuitionFee, setNewTuitionFee] = useState({

    course: "",
    registrationDate: "",
    collectionDate: "",
    topic: "",
    status: "",
    student: "",
  });
  const openAddTuitionFeesModal = () => {

    setNewTuitionFee({
      course: "",
      registrationDate: "",
      collectionDate: "",
      topic: "",
      status: "",
      student: "",

    });
    setIsAddModalOpen(true);
  };

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  useEffect(() => {
    fetchCourses();
    fetchTopics();
    fetchStudents();
    fetchTuitionFees();
  }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang

  // Example of fetching the token (assuming it's stored in localStorage)
const getToken = () => {
    return localStorage.getItem("token");  // Adjust this if you're storing the token elsewhere
  };
  
  const fetchCourses = async () => {
    try {
      const token = getToken();  // Get the token
      const response = await axios.get("http://localhost:8080/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
      setCourses(response.data);
    } catch (error) {
      setError("Không thể tải danh sách khóa học");
      console.error("Error fetching courses:", error);
    }
  };
  
  const fetchTopics = async () => {
    try {
      const token = getToken();  // Get the token
      const response = await axios.get("http://localhost:8080/api/topics", {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setError("Đã có lỗi xảy ra khi tải dữ liệu chuyên đề.");
    }
  };
  
  const fetchStudents = async () => {
    try {
      const token = getToken();  // Get the token
      const response = await axios.get("http://localhost:8080/api/student", {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
      console.log(response.data);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching student:", error);
      setError("Đã có lỗi xảy ra khi tải dữ liệu chuyên đề.");
    }
  };
  
  const fetchTuitionFees = async () => {
    try {
      const token = getToken();  // Get the token
      const response = await axios.get(`http://localhost:8080/api/tuition-fees`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
      setTuitionFees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching TuitionFees:", error);
      setTuitionFees([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleView = (TuitionFeesId) => {
    const token = getToken();  // Get the token
    const TuitionFees = tuitionFees.find((s) => s.id === TuitionFeesId);
    if (TuitionFees) {
      console.log("TuitionFees data:", TuitionFees);
      setSelectedTuitionFee({
        ...TuitionFees,
      });
      setShowModal(true);
    } else {
      console.error("Không tìm thấy học phí với ID:", TuitionFeesId);
    }
  };
  
  const handleEdit = (TuitionFeesId) => {
    const token = getToken();  // Get the token
    const TuitionFeesToEdit = tuitionFees.find(TuitionFees => TuitionFees.id === TuitionFeesId);
    if (TuitionFeesToEdit) {
      setNewTuitionFee({
        ...TuitionFeesToEdit,
      });
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy Học Phí để chỉnh sửa.");
    }
  };
  
  const handleDelete = async (TuitionFeesId) => {
    try {
      const token = getToken();  // Get the token
      await axios.delete(`http://localhost:8080/api/tuition-fees/${TuitionFeesId}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
      setTuitionFees(tuitionFees.filter((TuitionFees) => TuitionFees.id !== TuitionFeesId));
      console.log("Deleted TuitionFees:", TuitionFeesId);
    } catch (error) {
      console.error("Error deleting tuition fees:", error);
    }
  };
  
  const handleAddTuitionFees = async () => {
    try {
      const token = getToken();  // Get the token
      const TuitionFeesToAdd = {
        ...newTuitionFee,
      };
  
      const response = await axios.post("http://localhost:8080/api/tuition-fees", TuitionFeesToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
      setTuitionFees([...tuitionFees, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding TuitionFees:", error);
    }
  };
  
  const handleEditTuitionFees = async () => {
    try {
      const token = getToken();  // Get the token
      const TuitionFeesToUpdate = {
        ...newTuitionFee,
      };
  
      await axios.put(`http://localhost:8080/api/tuition-fees/${newTuitionFee.id}`, TuitionFeesToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
  
      const response = await axios.get(`http://localhost:8080/api/tuition-fees/${newTuitionFee.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Attach token to the request
        },
      });
  
      setTuitionFees((prevTuitionFees) =>
        prevTuitionFees.map((TuitionFees) =>
          TuitionFees.id === newTuitionFee.id ? response.data : TuitionFees
        )
      );
  
      // Đóng modal sau khi cập nhật
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating TuitionFees:", error);
    }
  };
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewTuitionFee((prevTuitionFees) => ({
      ...prevTuitionFees,
      [name]: value,
    }));
  };


  const actions = [
    { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
    { name: "edit", icon: "heroicons-outline:pencil-square", onClick: (TuitionFeesId) => handleEdit(TuitionFeesId) },
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

  const paginatedTuitionFees = tuitionFees.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const totalPages = Math.ceil(tuitionFees.length / pageSize);

  return (

    <Card noborder>
      <h4 className="card-title">tuitionFees Table</h4>
      {loading ? (
        <p>Loading tuitionFees...</p>
      ) : (
        <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
          <thead className="border-t border-slate-100 dark:border-slate-800">
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">course Name</th>
              <th className="table-th">Student</th>
              <th className="table-th">registration Date</th>
              <th className="table-th">collection Date</th>
              <th className="table-th">promotional Price</th>
              <th className="table-th">status</th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
            {paginatedTuitionFees.map((tuitionFees, index) => (
              <tr key={tuitionFees.id}>
                <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                <td className="table-td">{tuitionFees.course.courseName}</td>
                <td className="table-td">{tuitionFees.student.fullName}</td>
                <td className="table-td">{formatDate(tuitionFees.registrationDate)}</td>
                <td className="table-td">{formatDate(tuitionFees.collectionDate)}</td>
                <td className="table-td">{tuitionFees.course.topic.promotionalPrice}</td>
                <td className="table-td">{tuitionFees.activate === "1" ? "Activate" : "Inactivate"}</td>

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
                            onClick={() => action.onClick(tuitionFees.id)} // Chỉ truyền tuitionFees.id vào hàm
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
        {/* Add tuitionFees Button */}
        <button
          onClick={openAddTuitionFeesModal}  // Gọi hàm mở modal và reset dữ liệu
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Add Tuition Fees
        </button>

        {/* Add tuitionFees Modal */}
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
              <h2 className="text-2xl font-semibold mb-4">Add New tuitionFees</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTuitionFees();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Type</label>
                  <select
                    name="course"
                    value={newTuitionFee.course}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.courseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student Type</label>
                  <select
                    name="student"
                    value={newTuitionFee.student}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select Student --</option>
                    {students.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={newTuitionFee.registrationDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ">Collection Date</label>
                  <input
                    type="date"
                    name="collectionDate"
                    value={newTuitionFee.collectionDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 ">Promotional Price</label>
                  <input
                    type="number"
                    name="promotionalPrice"
                    value={newTuitionFee.promotionalPrice}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Gender Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 ">Status</label>
                  <select
                    name="activate"
                    value={newTuitionFee.activate}
                    onChange={handleChange}
                    required
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
                    Add TuitionFee
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
              <h2 className="text-2xl font-semibold mb-4">Edit Tuition Fee</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditTuitionFees();
                }}
                className="space-y-4"
              >

                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <input
                    type="text"
                    name="courseName"
                    value={newTuitionFee.courseName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newTuitionFee.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={newTuitionFee.registrationDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium ">Collection Date</label>
                  <input
                    type="date"
                    name="collectionDate"
                    value={newTuitionFee.collectionDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium ">Promotional Price</label>
                  <input
                    type="number"
                    name="promotionalPrice"
                    value={newTuitionFee.promotionalPrice}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium ">Status</label>
                  <select
                    name="activate"
                    value={newTuitionFee.activate}
                    onChange={handleChange}
                    required
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
            <h4>tuitionFees Details</h4>
            <p><strong>course Name:</strong> {selectedTuitionFee.course.courseName}</p>
            <p><strong>Student:</strong> {selectedTuitionFee.student.fullName}</p>
            <p><strong>registration Date:</strong> {formatDate(selectedTuitionFee.registrationDate)}</p>
            <p><strong>collection Date:</strong> {formatDate(selectedTuitionFee.collectionDate)}</p>
            <p><strong>promotional Price:</strong> {selectedTuitionFee.course.topic.promotionalPrice}</p>
            <p><strong>status:</strong> {selectedTuitionFee.activate === "1" ? "Activate" : "Inactivate"}</p>



          </Modal>
        </Transition>
      )}
    </Card>
  );
};

export default TuitionFeeList;
