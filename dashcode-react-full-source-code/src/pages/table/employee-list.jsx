import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";
import { format } from "date-fns";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeTypes, setEmployeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [degrees, setDegrees] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage add student modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({

    fullName: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: "",
    gender: "Male",
    nationalID: "",
    email: "",
    activate: true,
    imageName: "",
    employeeType: "",
    degree: "",
    specialization: "",

  });
  const openAddEmployeeModal = () => {
    // Reset giá trị của newStudent khi mở modal "Add"
    setNewEmployee({
      fullName: "",
      dateOfBirth: "",
      address: "",
      phoneNumber: "",
      gender: "Male",
      nationalID: "",
      email: "",
      activate: true,
      imageName: "",
      employeeType: "",
      degree: "",
      specialization: "",
    });
    setIsAddModalOpen(true);  // Mở modal "Add"
  };

  const [pageIndex, setPageIndex] = useState(0); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số học viên mỗi trang
  useEffect(() => {
    fetchSpecializations();
    fetchDegrees();
    fetchEmployeeTypes();
    fetchEmployees();
  }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang

  // Fetch student types (called once when the component mounts)
  // Function to get the token, assuming it's stored in localStorage
const getAuthToken = () => {
    return localStorage.getItem("token"); // Or wherever you store your token
  };
  
  const fetchEmployeeTypes = async () => {
    try {
      const token = getAuthToken(); // Get the token
      const response = await axios.get("http://localhost:8080/api/employee-type", {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      setEmployeeTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching employee type:", error);
    }
  };
  
  const fetchDegrees = async () => {
    try {
      const token = getAuthToken(); // Get the token
      const response = await axios.get("http://localhost:8080/api/degree", {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      setDegrees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching degree:", error);
    }
  };
  
  const fetchSpecializations = async () => {
    try {
      const token = getAuthToken(); // Get the token
      const response = await axios.get("http://localhost:8080/api/specialization", {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      setSpecializations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching specialization:", error);
    }
  };
  
  const fetchEmployees = async () => {
    try {
      const token = getAuthToken(); // Get the token
      const response = await axios.get(`http://localhost:8080/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleView = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      console.log("Employee data:", employee);
      setSelectedEmployee({
        ...employee,
        dateOfBirth: employee.dateOfBirth || "",
        employeeTypes: employee.employeeTypes ? employee.employeeType[0] : null, // Lấy employeeType đầu tiên nếu là mảng
        degrees: employee.degrees ? employee.degree[0] : null,
        specializations: employee.specializations ? employee.specialization[0] : null,
      });
      setShowModal(true);
    } else {
      console.error("Không tìm thấy nhân viên với ID:", employeeId);
    }
  };
  
  const handleEdit = (employeeId) => {
    const employeeToEdit = employees.find(employee => employee.id === employeeId);
    if (employeeToEdit) {
      setNewEmployee({
        ...employeeToEdit,
        employeeType: employeeToEdit.employeeType || "",
        degree: employeeToEdit.degree || "",
        specialization: employeeToEdit.specialization || "",
      });
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy nhân viên để chỉnh sửa.");
    }
  };
  
  const handleDelete = async (employeeId) => {
    try {
      const token = getAuthToken(); // Get the token
      const response = await axios.put(`http://localhost:8080/api/employees/${employeeId}/deactivate`, { isActive: false }, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      if (response.status === 200) {
        setEmployees(employees.filter((employee) => employee.id !== employeeId));
        console.log("Deleted employee:", employeeId);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };
  
  const handleAddEmployee = async () => {
    try {
      const token = getAuthToken(); // Get the token
      const employeeToAdd = {
        ...newEmployee,
        employeeType: newEmployee.employeeType || "",
        degree: newEmployee.degree || "",
        specialization: newEmployee.specialization || "",
      };
  
      const response = await axios.post("http://localhost:8080/api/employees/addEmployee", employeeToAdd, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
      setEmployees([...employees, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };
  
  const handleEditEmployee = async () => {
    try {
      const token = getAuthToken(); // Get the token
      const employeeToUpdate = {
        ...newEmployee,
        employeeType: newEmployee.employeeType || "",
        degree: newEmployee.degree || "",
        specialization: newEmployee.specialization || "",
      };
  
      await axios.put(`http://localhost:8080/api/employees/${newEmployee.id}`, employeeToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
  
      const response = await axios.get(`http://localhost:8080/api/employees/${newEmployee.id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the headers
        },
      });
  
      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === newEmployee.id ? response.data : employee
        )
      );
  
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value, // Cập nhật giá trị của studentType
    }));
  };


  const actions = [
    { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
    { name: "edit", icon: "heroicons-outline:pencil-square", onClick: (employeeId) => handleEdit(employeeId) },
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
  const paginatedEmployees = employees.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const totalPages = Math.ceil(employees.length / pageSize);

  return (

    <Card noborder>
      <h4 className="card-title">Employee Table</h4>
      {loading ? (
        <p>Loading Employees...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
            <thead className="bg-slate-200 dark:bg-slate-700">
              <tr>
                <th className="table-th">STT</th>
                <th className="table-th">Full Name</th>
                <th className="table-th">Date Of Birth</th>
                <th className="table-th">Gender</th>
                <th className="table-th">Phone Number</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
              {paginatedEmployees.map((employee, index) => (
                <tr key={employee.id}>
                  <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                  <td className="table-td">{employee.fullName}</td>
                  <td className="table-td">{formatDate(employee.dateOfBirth)}</td>
                  <td className="table-td">{employee.gender === "Male" ? "Male" : "Female"}</td>
                  <td className="table-td">{employee.phoneNumber}</td>
                  <td className="table-td">{employee.activate ? "Active" : "Inactive"}</td>
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
                              onClick={() => action.onClick(employee.id)}
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
          onClick={openAddEmployeeModal}  // Gọi hàm mở modal và reset dữ liệu
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Add Employee
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
              <h2 className="text-2xl font-semibold mb-4">Add New Employee</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddEmployee();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newEmployee.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Date Of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newEmployee.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Gender</label>
                  <select
                    name="gender"
                    value={newEmployee.gender}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
                  <input
                    type="number"
                    name="phoneNumber"
                    value={newEmployee.phoneNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">NationalID </label>
                  <input
                    type="number"
                    name="nationalID"
                    value={newEmployee.nationalID}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newEmployee.address}
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
                    value={newEmployee.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Employee Type</label>
                  <select
                    name="employeeType"
                    value={newEmployee.employeeType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Employee Type --</option>
                    {employeeTypes.map((em) => (
                      <option key={em.id} value={em.id}>
                        {em.employeeTypeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Degree Type</label>
                  <select
                    name="degree"
                    value={newEmployee.degree}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Degree Type --</option>
                    {degrees.map((de) => (
                      <option key={de.id} value={de.id}>
                        {de.degreeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Specialization Type</label>
                  <select
                    name="specialization"
                    value={newEmployee.specialization}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Specialization Type --</option>
                    {specializations.map((spe) => (
                      <option key={spe.id} value={spe.id}>
                        {spe.specializationName}
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
                    Add Employee
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
              <h2 className="text-2xl font-semibold mb-4">Edit Employee</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditEmployee();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newEmployee.fullName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Date Of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={newEmployee.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Gender</label>
                  <select
                    name="gender"
                    value={newEmployee.gender}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number</label>
                  <input
                    type="number"
                    name="phoneNumber"
                    value={newEmployee.phoneNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                  <input
                    type="text"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">NationalID </label>
                  <input
                    type="number"
                    name="nationalID"
                    value={newEmployee.nationalID}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newEmployee.address}
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
                    value={newEmployee.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Employee Type</label>
                  <select
                    name="employeeType"
                    value={newEmployee.employeeType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Employee Type --</option>
                    {employeeTypes.map((em) => (
                      <option key={em.id} value={em.id}>
                        {em.employeeTypeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Degree Type</label>
                  <select
                    name="degree"
                    value={newEmployee.degree}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Degree Type --</option>
                    {degrees.map((de) => (
                      <option key={de.id} value={de.id}>
                        {de.degreeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Specialization Type</label>
                  <select
                    name="specialization"
                    value={newEmployee.specialization}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-200"
                  >
                    <option value="">-- Select Specialization Type --</option>
                    {specializations.map((spe) => (
                      <option key={spe.id} value={spe.id}>
                        {spe.specializationName}
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
              <h4>Employee Details</h4>

              <p><strong>Full Name:</strong> {selectedEmployee.fullName}</p>
              <p><strong>Date of birth:</strong> {formatDate(selectedEmployee?.dateOfBirth)}</p>
              <p><strong>Address:</strong> {selectedEmployee.address}</p>
              <p><strong>Gender:</strong> {selectedEmployee.gender === "1" ? "Male" : "Female"}</p>
              <p><strong>Phone Number:</strong> {selectedEmployee.phoneNumber}</p>
              <p><strong>NationID:</strong> {selectedEmployee.nationalID}</p>
              <p><strong>Email:</strong> {selectedEmployee.email}</p>
              <p><strong>Status:</strong> {selectedEmployee.activate === "1" ? "Activate" : "Inactivate"}</p>

              <p><strong>Employee Type:</strong> {selectedEmployee?.employeeType?.employeeTypeName || "N/A"}</p>
              <p><strong>Degree Type:</strong> {selectedEmployee?.degree?.degreeName || "N/A"}</p>
              <p><strong>Specialization Type:</strong> {selectedEmployee?.specialization?.specializationName || "N/A"}</p>

            </Modal>
          </Transition>
        )}
      </div>
    </Card>
  );
};

export default EmployeeList;
