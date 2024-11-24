import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
import Modal from "@/components/ui/Modal";
import { Transition } from "@headlessui/react";
import { format } from "date-fns";

const TopicList = () => {
  const [Topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage add student modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({
    topicCode: "",
    topicName: "",
    theoryHours: "",
    practicalHours: "",
    originalPrice: "",
    promotionalPrice: "",
    activate: "",
  });
  const openAddTopicModal = () => {
    // Reset giá trị của newStudent khi mở modal "Add"
    setNewTopic({
      topicCode: "",
      topicName: "",
      theoryHours: "",
      practicalHours: "",
      originalPrice: "",
      promotionalPrice: "",
      activate: "",
    });
    setIsAddModalOpen(true); // Mở modal "Add"
  };

  const [pageIndex, setPageIndex] = useState(0); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số học viên mỗi trang
  useEffect(() => {
    fetchTopics();
  }, [pageIndex, pageSize]); // Fetch lại dữ liệu khi thay đổi trang hoặc số học viên mỗi trang

  // Fetch student types (called once when the component mounts)

  const getToken = () => {
    return localStorage.getItem("token");  // Adjust this if you're storing the token elsewhere
  };
  const fetchTopics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/topics?page=${pageIndex}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setTopics(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (topicsId) => {
    const selectedTopic = Topics.find((topic) => topic.id === topicsId);
    if (selectedTopic) {
      console.log("Topics data:", selectedTopic);
      setSelectedTopic({
        ...selectedTopic,
      });
      setShowModal(true);
    } else {
      console.error("Không tìm thấy Chuyên đề với ID:", topicsId);
    }
  };

  const handleEdit = (topicsId) => {
    const topicsToEdit = Topics.find((topics) => topics.id === topicsId);
    if (topicsToEdit) {
      setNewTopic({
        ...topicsToEdit,
      });
      setIsEditModalOpen(true);
    } else {
      console.error("Không tìm thấy Chuyên Đề để chỉnh sửa.");
    }
  };

  const handleDelete = async (topicsId) => {
    try {
      await axios.delete(`http://localhost:8080/api/topics/${topicsId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setTopics(Topics.filter((topic) => topic.id !== topicsId));
      console.log("Deleted topic:", topicsId);
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const handleAddTopics = async () => {
    try {
      const topicsToAdd = {
        ...newTopic,
      };

      const response = await axios.post(
        "http://localhost:8080/api/topics",
        topicsToAdd,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setTopics([...Topics, response.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding topics:", error);
    }
  };

  const handleEditTopics = async () => {
    try {
      const topicsToUpdate = {
        ...newTopic,
      };

      await axios.put(
        `http://localhost:8080/api/topics/${newTopic.id}`,
        topicsToUpdate,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const response = await axios.get(
        `http://localhost:8080/api/topics/${newTopic.id}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setTopics((prevTopics) =>
        prevTopics.map((topics) =>
          topics.id === newTopic.id ? response.data : topics
        )
      );

      // Đóng modal sau khi cập nhật
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating topics:", error);
    }
  };


  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewTopic((prevTopic) => ({
      ...prevTopic,
      [name]: value,
    }));
  };

  const actions = [
    { name: "view", icon: "heroicons-outline:eye", onClick: handleView },
    {
      name: "edit",
      icon: "heroicons-outline:pencil-square",
      onClick: (topicsId) => handleEdit(topicsId),
    },
    { name: "delete", icon: "heroicons-outline:trash", onClick: handleDelete },
  ];

  // Hàm format lại ngày tháng
  const formatDate = (dateString) => {
    // Kiểm tra nếu dateString là mảng
    if (Array.isArray(dateString)) {
      // Chuyển mảng [2009, 1, 8] thành chuỗi ngày tháng hợp lệ "yyyy-MM-dd"
      dateString = `${dateString[0]}-${String(dateString[1] + 1).padStart(
        2,
        "0"
      )}-${String(dateString[2]).padStart(2, "0")}`;
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
  const paginatedStopics = Topics.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );
  const totalPages = Math.ceil(Topics.length / pageSize);

  return (
    <Card noborder>
      <h4 className="card-title">topic Table</h4>
      {loading ? (
        <p>Loading topic...</p>
      ) : (
        <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700">
          <thead className="border-t border-slate-100 dark:border-slate-800">
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">topic Code</th>
              <th className="table-th">topic Name</th>
              <th className="table-th">theory Hours</th>
              <th className="table-th">practical Hours</th>
              <th className="table-th">original Price</th>
              <th className="table-th">promotional Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
            {paginatedStopics.map((topic, index) => (
              <tr key={topic.id}>
                <td className="table-td">{index + 1 + pageIndex * pageSize}</td>
                <td className="table-td">{topic.topicCode}</td>
                <td className="table-td">{topic.topicName}</td>
                <td className="table-td">
                  {topic.theoryHours}
                </td>
                <td className="table-td">
                  {topic.practicalHours}
                </td>
                <td className="table-td">{topic.originalPrice}</td>
                <td className="table-td">{topic.promotionalPrice}</td>
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
                            onClick={() => action.onClick(topic.id)} // Chỉ truyền topic.id vào hàm
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
        {/* Add topic Button */}
        <button
          onClick={openAddTopicModal} // Gọi hàm mở modal và reset dữ liệu
          className="px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Add topic
        </button>

        {/* Add topic Modal */}
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
              <h2 className="text-2xl font-semibold mb-4">Add New topics</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddTopic();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    topicCode
                  </label>
                  <input
                    type="text"
                    name="topicCode"
                    value={newTopic.topicCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    topicName
                  </label>
                  <input
                    type="text"
                    name="topicName"
                    value={newTopic.topicName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    theoryHours
                  </label>
                  <input
                    type="number"
                    name="theoryHours"
                    value={newTopic.theoryHours}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    practicalHours
                  </label>
                  <input
                    type="number"
                    name="practicalHours"
                    value={newTopic.practicalHours}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {/* Gender Select */}
                <div>
                  <label className="block text-sm font-medium ">
                    originalPrice
                  </label>
                  <input
                    name="number"
                    value={newTopic.originalPrice}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    promotionalPrice
                  </label>
                  <input
                    type="number"
                    name="promotionalPrice"
                    value={newTopic.promotionalPrice}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="activate"
                    value={newTopic.activate}
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
                    Add Topic
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
              <h2 className="text-2xl font-semibold mb-4">Edit Topic</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditTopic();
                }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    topicCode
                  </label>
                  <input
                    type="text"
                    name="topicCode"
                    value={newTopic.topicCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date of Birth Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    topicName
                  </label>
                  <input
                    type="text"
                    name="topicName"
                    value={newTopic.topicName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium">
                    Theory Hours
                  </label>
                  <input
                    type="number" // Chuyển từ "date" sang "time"
                    name="theoryHours"
                    value={newTopic.theoryHours}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Practical Hours
                  </label>
                  <input
                    type="number" // Chuyển từ "date" sang "time"
                    name="practicalHours"
                    value={newTopic.practicalHours}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium ">
                    originalPrice{" "}
                  </label>
                  <input
                    name="number"
                    value={newTopic.originalPrice}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium ">
                    promotionalPrice{" "}
                  </label>
                  <input
                    type="number"
                    name="promotionalPrice"
                    value={newTopic.promotionalPrice}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="activate"
                    value={newTopic.activate}
                    onChange={handleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

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
      </div>

      <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <select
            className="form-control py-2 w-max"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 15].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page{" "}
            <span>
              {pageIndex + 1} of {totalPages}
            </span>
          </span>
        </div>

        <ul className="flex items-center space-x-3 rtl:space-x-reverse">
          <li>
            <button
              className={`text-xl leading-4 ${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <Icon icon="heroicons:chevron-double-left-solid" />
            </button>
          </li>
          <li>
            <button
              className={`text-sm leading-4 ${pageIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={() => setPageIndex(pageIndex - 1)}
              disabled={pageIndex === 0}
            >
              Prev
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index}>
              <button
                className={`text-sm rounded leading-[16px] ${index === pageIndex
                  ? "bg-slate-900 dark:bg-slate-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700"
                  }`}
                onClick={() => setPageIndex(index)}
              >
                {index + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              className={`text-sm leading-4 ${pageIndex === totalPages - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={pageIndex === totalPages - 1}
            >
              Next
            </button>
          </li>
          <li>
            <button
              className={`text-xl leading-4 ${pageIndex === totalPages - 1
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
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
            <h4>Topic Details</h4>
            <p>
              <strong>topic Code:</strong> {selectedTopic.topicCode}
            </p>
            <p>
              <strong>topic Name:</strong> {selectedTopic.topicName}
            </p>
            <p>
              <strong>theory Hours:</strong>{" "}
              {format(new Date(selectedTopic.theoryHours), "HH:mm")}
            </p>
            <p>
              <strong>practica lHours:</strong>{" "}
              {format(new Date(selectedTopic.practicalHours), "HH:mm")}
            </p>
            <p>
              <strong>original Price:</strong> {selectedTopic.originalPrice}
            </p>
            <p>
              <strong>promotional Price:</strong>{" "}
              {selectedTopic.promotionalPrice}
            </p>
            <p>
              <strong>activate:</strong> {selectedTopic.activate === "1" ? "Activate" : "Inactivate"}
            </p>
          </Modal>
        </Transition>
      )}
    </Card>
  );
};

export default TopicList;
