import React, { useState, useEffect, useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { useNavigate } from "react-router-dom";
import userService from "../../services/userService";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";

const actions = [
  { name: "edit", icon: "heroicons:pencil-square" },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    roles: [], // Default to an empty array
    employee: [],
    password: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    userService.getUsers()
      .then((response) => setUsers(response))
      .catch((error) => console.error("Error fetching users:", error));

    userService.getRoles()
      .then((roles) => setAllRoles(roles))
      .catch((error) => console.error("Error fetching roles:", error));

    userService.getAllEmployees()
      .then((response) => setEmployees(response))
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  const handleAction = (action, row) => {
    const userId = row?.original?.id;
    switch (action) {
      case "edit":
        setSelectedUserId(userId);
        setShowForm(true);
        userService.getUserById(userId).then((user) => {
          setFormData({
            username: user.username || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            dob: user.dob || "", // Gán ngày sinh
            roles: user.roles ? user.roles.map((role) => role.name) : [], // Lưu name để hiển thị
            employeeId: user.employeeId || null, // Lấy đúng employeeId
            password: "", // Giữ blank cho password
          });
        });

        break;

      case "new":
        setShowForm(true);
        setFormData({
          username: "",
          firstName: "",
          lastName: "",
          roles: [],
          employee: [],
          password: "", // Đặt mặc định cho trường password
        });
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    // Validate form data
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // Update errors state
      return; // Stop form submission
    }
  
    setErrors({}); // Clear errors if validation passes
  
    const requestData = {
      username: formData.username,
      password: formData.password || undefined, // Don't send password if empty
      firstName: formData.firstName,
      lastName: formData.lastName,
      dob: formData.dob,
      roles: formData.roles,
      employeeId: formData.employeeId,
    };
  
    const action = selectedUserId
      ? userService.updateUser(selectedUserId, requestData)
      : userService.createUser(requestData);
  
    action
      .then(() => {
        alert(selectedUserId ? "User updated successfully!" : "User created successfully!");
        setShowForm(false);
        setSelectedUserId(null);
        userService.getUsers().then((response) => setUsers(response));
      })
      .catch((error) => console.error("Error submitting form:", error));
  };
  


  const columns = useMemo(
    () => [
      { Header: "Username", accessor: "username" },
      { Header: "First Name", accessor: "firstName" },
      { Header: "Last Name", accessor: "lastName" },
      {
        Header: "Roles",
        accessor: "roles",
        Cell: ({ cell: { value } }) =>
          value?.map((role) => role.name).join(", "),
      },
      {
        Header: "Employee",
        accessor: "employeeFullName", // Access 'employee' from user data
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            {actions.map((item, i) => (
              <button
                key={i}
                onClick={() => handleAction(item.name, row)}
                className={`w-full px-4 py-2 text-sm cursor-pointer flex items-center ${item.name === "new"
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 hover:bg-gray-400 text-black"
                  }`}
              >
                <Icon icon={item.icon} />
                <span className="ml-2">{item.name}</span>
              </button>
            ))}
          </div>
        ),
      },
    ],
    []
  );
  const {
    getTableProps, getTableBodyProps, headerGroups, prepareRow, rows, state: { pageIndex, pageSize }, gotoPage,
    nextPage, previousPage, setPageSize, canPreviousPage, canNextPage,
  } = useTable(
    {
      columns,
      data: users,
      initialState: { pageSize: 5 },
    },
    useSortBy,
    usePagination
  );

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  
    // Optionally validate this field
    const fieldErrors = validateForm({ ...formData, [field]: value });
    setErrors(fieldErrors);
  };
  

  const validateForm = (data) => {
    const errors = {};

    if (!data.username || data.username.length < 4) {
      errors.username = "Username must be at least 4 characters long.";
    }

    if (!data.password && !selectedUserId) {
      errors.password = "Password is required.";
    } else if (data.password && data.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (!data.firstName) {
      errors.firstName = "First Name is required.";
    }

    if (!data.lastName) {
      errors.lastName = "Last Name is required.";
    }

    if (!data.dob) {
      errors.dob = "Date of Birth is required.";
    } else {
      const dobDate = new Date(data.dob);
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 17) {
        errors.dob = "You must be at least 10 years old.";
      }
    }

    return errors;
  };

  return showForm ? (
    <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-lg font-bold mb-4">
        {selectedUserId ? "Update User" : "Create User"}
      </h3>

      {/* Username */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          disabled={!!selectedUserId} // Không cho chỉnh sửa nếu đang ở chế độ chỉnh sửa
          className={`mt-1 px-4 py-2 w-full border rounded-md ${errors.username ? "border-red-500" : "border-gray-300"
            } ${selectedUserId ? "bg-gray-200 cursor-not-allowed" : ""}`}
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username}</p>
        )}
      </div>


      {/* Password */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!selectedUserId} // Password chỉ bắt buộc khi thêm mới
          className={`mt-1 px-4 py-2 w-full border rounded-md ${errors.password ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>


      {/* First Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
          className={`mt-1 px-4 py-2 w-full border rounded-md ${errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
        )}
      </div>


      {/* Last Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
          className={`mt-1 px-4 py-2 w-full border rounded-md ${errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
        )}
      </div>


      {/* Date of Birth (dob) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          value={formData.dob || ""}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          required
          className={`mt-1 px-4 py-2 w-full border rounded-md ${errors.dob ? "border-red-500" : "border-gray-300"
            }`}
        />
        {errors.dob && (
          <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
        )}
      </div>


      {/* Roles */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Roles</label>
        <Dropdown
          classMenuItems="right-0 w-[200px] top-[110%]"
          label={formData.roles?.length > 0
            ? formData.roles.join(", ")
            : "Select Roles"}
        >
          {allRoles.map((role) => (
            <Menu.Item key={role.id}>
              <div
                className={`flex items-center p-2 cursor-pointer ${formData.roles?.includes(role.name) ? "bg-blue-500 text-white" : ""
                  }`}
                onClick={() => {
                  const updatedRoles = formData.roles?.includes(role.name)
                    ? formData.roles.filter((r) => r !== role.name)
                    : [...(formData.roles || []), role.name];
                  setFormData({ ...formData, roles: updatedRoles });
                }}
              >
                {role.name}
              </div>
            </Menu.Item>
          ))}
        </Dropdown>
      </div>

      {/* Employee */}
      {/* Employee */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Employee</label>
        {/* Hiển thị dropdown nếu đang tạo mới, nếu không thì chỉ hiển thị thông tin employee */}
        {selectedUserId ? (
          <div className="mt-1 px-4 py-2 w-full border rounded-md bg-gray-200 cursor-not-allowed">
            {employees.find((emp) => emp.id === formData.employeeId)?.fullName || "No Employee Selected"}
          </div>
        ) : (
          <Dropdown
            classMenuItems="right-0 w-[200px] top-[110%] max-h-[200px] overflow-y-auto"
            label={employees.find((emp) => emp.id === formData.employeeId)?.fullName || "Select Employee"}
          >
            {employees.map((employee) => (
              <Menu.Item key={employee.id}>
                <div
                  className={`flex items-center p-2 cursor-pointer ${formData.employeeId === employee.id ? "bg-blue-500 text-white" : ""}`}
                  onClick={() => setFormData({ ...formData, employeeId: employee.id })}
                >
                  {employee.fullName}
                </div>
              </Menu.Item>
            ))}
          </Dropdown>
        )}
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex space-x-4">
        <button type="submit" className="btn-primary px-6 py-2 rounded-md">
          {selectedUserId ? "Update" : "Create"}
        </button>
        <button
          type="button"
          className="btn-secondary px-6 py-2 rounded-md"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </button>
      </div>
    </form>

  ) : (
    <Card className="p-6 bg-white shadow-md rounded-lg">
    <h3 className="text-lg font-bold mb-4">User Management</h3>
    <button
      onClick={() => handleAction("new")}
      className="mb-4 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
    >
      Add New User
    </button>
    <table {...getTableProps()} className="w-full border-collapse border border-gray-200 rounded-md">
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
            {headerGroup.headers.map((column) => (
              <th
                {...column.getHeaderProps(column.getSortByToggleProps())}
                className="px-4 py-2 text-left text-sm font-medium text-gray-700"
              >
                {column.render("Header")}
                {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} className="border-t hover:bg-gray-100">
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()} className="px-4 py-2 text-sm text-gray-700">
                  {cell.render("Cell")}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>

    {/* Pagination Controls */}
    <div className="flex justify-between items-center mt-4">
      <div>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <span className="text-sm text-gray-700">
        Page <strong>{pageIndex + 1}</strong> of {Math.ceil(rows.length / pageSize)}
      </span>
      <select
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
        className="px-4 py-2 text-sm border border-gray-300 rounded-md"
      >
        {[5, 10, 20].map((size) => (
          <option key={size} value={size}>
            Show {size}
          </option>
        ))}
      </select>
    </div>
  </Card>
  );
};

export default UserManagement;
