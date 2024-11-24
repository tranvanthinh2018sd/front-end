import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";

const TeachingAssignmentList = () => {
    const [TeachingAssignments, setTeachingAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedteachingAssignments, setSelectedteachingAssignments] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [Courses, setCourses] = useState([]);
    const [Employees, setEmployees] = useState([]);
    const [Sessions, setSessions] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newteachingAssignments, setNewteachingAssignments] = useState({

        course: { courseCode: '', courseName: '' },
        employee: { fullName: '' },
        session: { sessionName: '' },
        activate: true,
    });
    const openAddteachingAssignmentsModal = () => {
        setNewteachingAssignments({
            course: { courseCode: '', courseName: '' },
            employee: { fullName: '' },
            session: { sessionName: '' },
            activate: true,
        });
        setIsAddModalOpen(true);  // Mở modal "Add"
    };
    const [pageIndex, setPageIndex] = useState(0); // Số trang hiện tại
    const [pageSize, setPageSize] = useState(5); // Số học viên mỗi trang
    useEffect(() => {
        fetchCourses();
        fetchEmployees();
        fetchSessions();
        fetchTeachingAssignments();
    }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang

    const getToken = () => {
        return localStorage.getItem("token");  // Adjust this if you're storing the token elsewhere
    };
    // Fetch student types (called once when the component mounts)
    const fetchCourses = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/courses", {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            setCourses(response.data);
        } catch (error) {
            setError("Không thể tải danh sách khóa học");
            console.error("Error fetching courses:", error);
        }
    };
    const fetchEmployees = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/employees", {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            setEmployees(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/sessions", {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            setSessions(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu buổi học:", error);
        }
    };

    const fetchTeachingAssignments = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/teaching-assignment?page=${pageIndex}&size=${pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            setTeachingAssignments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching TeachingAssignments:", error);
            setTeachingAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (teachingAssignmentId) => {
        const teachingAssignment = TeachingAssignments.find((s) => s.id === teachingAssignmentId);
        if (teachingAssignment) {
            console.log("TeachingAssignment data:", teachingAssignment);
            setSelectedteachingAssignments({
                ...teachingAssignment,
            });
            setShowModal(true);
        } else {
            console.error("Không tìm thấy sinh viên với ID:", teachingAssignmentId);
        }
    };

    const handleEdit = (teachingAssignmentId) => {
        const teachingAssignmentToEdit = TeachingAssignments.find(
            (teachingAssignment) => teachingAssignment.id === teachingAssignmentId
        );
        if (teachingAssignmentToEdit) {
            console.log("Teaching Assignment to Edit: ", teachingAssignmentToEdit);

            setNewteachingAssignments({
                course: {
                    courseCode: teachingAssignmentToEdit.course?.courseCode || '',
                    courseName: teachingAssignmentToEdit.course?.courseName || ''
                },
                employee: {
                    fullName: teachingAssignmentToEdit.employee?.fullName || ''
                },
                session: {
                    sessionName: teachingAssignmentToEdit.session?.sessionName || ''
                },
                activate: teachingAssignmentToEdit.activate || true,
                id: teachingAssignmentToEdit.id,  // Include the ID for editing
            });

            setIsEditModalOpen(true);  // Chỉ mở modal chỉnh sửa
            setIsAddModalOpen(false);  // Đảm bảo modal thêm mới không mở
        } else {
            console.error("Không tìm thấy teaching assignment để chỉnh sửa.");
        }
    };


    const handleDelete = async (TeachingAssignmentId) => {
        try {
            await axios.delete(`http://localhost:8080/api/teaching-assignment/${TeachingAssignmentId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            setTeachingAssignments(
                TeachingAssignments.filter((teachingAssignment) => teachingAssignment.id !== TeachingAssignmentId)
            );
            console.log("Deleted teachingAssignment:", TeachingAssignmentId);
        } catch (error) {
            console.error("Error deleting teachingAssignment:", error);
        }
    };

    const handleAddTeachingAssignment = async () => {
        try {
            const teachingAssignmentToAdd = {
                ...newteachingAssignments,
            };

            const response = await axios.post(
                "http://localhost:8080/api/teaching-assignment",
                teachingAssignmentToAdd,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );
            setTeachingAssignments([...TeachingAssignments, response.data]);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error adding teachingAssignment:", error);
        }
    };

    const handleEditTeachingAssignment = async () => {
        try {
            const teachingAssignmentToUpdate = {
                ...newteachingAssignments,
            };

            await axios.put(
                `http://localhost:8080/api/teaching-assignment/${newteachingAssignments.id}`,
                teachingAssignmentToUpdate,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            const response = await axios.get(
                `http://localhost:8080/api/teaching-assignment/${newteachingAssignments.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            setTeachingAssignments((prevTeachingAssignment) =>
                prevTeachingAssignment.map((teachingAssignment) =>
                    teachingAssignment.id === newteachingAssignments.id ? response.data : teachingAssignment
                )
            );

            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating teachingAssignment:", error);
        }
    };
    const handleChange = (event) => {
        const { name, value } = event.target;
        console.log("Changing", name, "to", value); // Log for debugging
        setNewteachingAssignments((prevTeachingAssignment) => ({
            ...prevTeachingAssignment,
            [name]: value,
        }));
    };

    const actions = [
        { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
        { name: "edit", icon: "heroicons-outline:pencil-square", onClick: (teachingAssignmentId) => handleEdit(teachingAssignmentId) },
        { name: "delete", icon: "heroicons-outline:trash", onClick: handleDelete },
    ];



    // Slice the students array to simulate pagination
    const paginatedTeachingAssignment = TeachingAssignments.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const totalPages = Math.ceil(TeachingAssignments.length / pageSize);

    return (

        <Card noborder>
            <h4 className="card-title">teachingAssignment Table</h4>
            {loading ? (
                <p>Loading teachingAssignments...</p>
            ) : (
                <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
                    <thead className="border-t border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="table-th">STT</th>
                            <th className="table-th">courseCode</th>
                            <th className="table-th">courseName</th>
                            <th className="table-th">fullName</th>
                            <th className="table-th">sessionName</th>
                            <th className="table-th">Status</th>

                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                        {paginatedTeachingAssignment.map((teachingAssignment, index) => (
                            <tr key={teachingAssignment.id}>
                                <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                                <td className="table-td">{teachingAssignment.course.courseCode}</td>
                                <td className="table-td">{teachingAssignment.course.courseName}</td>
                                <td className="table-td">{teachingAssignment.employee.fullName}</td>
                                <td className="table-td">{teachingAssignment.course.session.sessionName}</td>
                                <td className="table-td">{teachingAssignment.activate ? "Active" : "Inactive"}</td>
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
                                                        onClick={() => action.onClick(teachingAssignment.id)} // Chỉ truyền teachingAssignment.id vào hàm
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
                {/* Add teachingAssignment Button */}
                <button
                    onClick={openAddteachingAssignmentsModal}  // Gọi hàm mở modal và reset dữ liệu
                    className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
                >
                    Add teachingAssignment
                </button>

                {/* Add teachingAssignment Modal */}
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
                            <h2 className="text-2xl font-semibold mb-4">Add New teachingAssignment</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddTeachingAssignment();
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">course Code</label>
                                    <select
                                        name="courseCode"
                                        value={newteachingAssignments.courseCode}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select course --</option>
                                        {Courses.map((course) => (
                                            <option key={course.id} value={course.courseCode}>
                                                {course.courseCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">course Name</label>
                                    <select
                                        name="courseName"
                                        value={newteachingAssignments.courseName}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select course --</option>
                                        {Courses.map((course) => (
                                            <option key={course.id} value={course.courseName}>
                                                {course.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">full Name</label>
                                    <select
                                        name="fullName"
                                        value={newteachingAssignments.fullName}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select employee --</option>
                                        {Employees.map((employee) => (
                                            <option key={employee.id} value={employee.fullName}>
                                                {employee.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">session Name</label>
                                    <select
                                        name="sessionName"
                                        value={newteachingAssignments.sessionName}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select session --</option>
                                        {Sessions.map((session) => (
                                            <option key={session.id} value={session.sessionName}>
                                                {session.sessionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="activate"
                                        value={newteachingAssignments.activate}
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
                                        Add TeachingAssignment
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
                            <h2 className="text-2xl font-semibold mb-4">Edit TeachingAssignment</h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEditTeachingAssignment();
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">course Code</label>
                                    <select
                                        name="courseCode"
                                        value={newteachingAssignments.courseCode || ""}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select course --</option>
                                        {Courses.map((course) => (
                                            <option key={course.id} value={course.courseCode}>
                                                {course.courseCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">course Name</label>
                                    <select
                                        name="courseName"
                                        value={newteachingAssignments.courseName || ""}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select course --</option>
                                        {Courses.map((course) => (
                                            <option key={course.id} value={course.courseName}>
                                                {course.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">full Name</label>
                                    <select
                                        name="fullName"
                                        value={newteachingAssignments.fullName || ""}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select employee --</option>
                                        {Employees.map((employee) => (
                                            <option key={employee.id} value={employee.fullName}>
                                                {employee.fullName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">session Name</label>
                                    <select
                                        name="sessionName"
                                        value={newteachingAssignments.sessionName || ""}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">-- Select session --</option>
                                        {Sessions.map((session) => (
                                            <option key={session.id} value={session.sessionName}>
                                                {session.sessionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        name="activate"
                                        value={newteachingAssignments.activate}
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
                        <h4>teachingAssignments Details</h4>
                        <p><strong>courseCode:</strong> {selectedteachingAssignments.course.courseCode}</p>
                        <p><strong>courseName:</strong> {selectedteachingAssignments.course.courseName}</p>
                        <p><strong>fullName:</strong> {selectedteachingAssignments.employee.fullName}</p>
                        <p><strong>sessionName:</strong> {selectedteachingAssignments.course.session.sessionName}</p>

                        <p><strong>Status:</strong> {selectedteachingAssignments.activate === "1" ? "Activate" : "Inactivate"}</p>


                    </Modal>
                </Transition>
            )}
        </Card>
    );
};

export default TeachingAssignmentList;
