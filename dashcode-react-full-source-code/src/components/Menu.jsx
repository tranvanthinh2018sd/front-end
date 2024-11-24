// src/components/Menu.jsx

import React from "react";
import AuthenticationService from "@/services/authenticationService";
import { menuItems as allMenuItems } from "@/data/menuItems";

const Menu = () => {
  const userRoles = AuthenticationService.getUserRole();

  // Lọc các menu dựa trên quyền người dùng
  const filteredMenuItems = allMenuItems.map((item) => {
    // Lọc các menu con
    if (item.child) {
      const filteredChildren = item.child.filter(
        (child) => !child.roles || child.roles.some(role => userRoles.includes(role))
      );
      return { ...item, child: filteredChildren };
    }

    // Hiển thị menu nếu không có trường `roles` hoặc vai trò người dùng phù hợp
    return !item.roles || item.roles.some(role => userRoles.includes(role)) ? item : null;
  }).filter(Boolean); // Lọc ra các giá trị null

  return (
    <nav>
      <ul>
        {filteredMenuItems.map((item, index) => (
          <li key={index}>
            {item.title}
            {item.child && item.child.length > 0 && (
              <ul>
                {item.child.map((child, idx) => (
                  <li key={idx}>{child.childtitle}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
