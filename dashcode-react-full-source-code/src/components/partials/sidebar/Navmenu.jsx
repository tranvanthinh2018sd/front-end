import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Collapse } from "react-collapse";
import Icon from "@/components/ui/Icon";
import { toggleActiveChat } from "@/pages/app/chat/store";
import { useDispatch } from "react-redux";
import useMobileMenu from "@/hooks/useMobileMenu";
import Submenu from "./Submenu";
import userService from "../../../services/userService";


const Navmenu = ({ menus }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const location = useLocation();
  const locationName = location.pathname.replace("/", "");
  const [mobileMenu, setMobileMenu] = useMobileMenu();
  const dispatch = useDispatch();

  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const roles = await userService.getUserRoles();
        setUserRoles(roles || []); // Lưu roles vào state
      } catch (error) {
        console.error("Lỗi khi lấy roles của người dùng:", error);
      }
    };
    fetchUserRoles();
  }, []);

  // Kiểm tra quyền truy cập
  const hasPermission = (itemRoles) => {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.some((role) => userRoles.includes(role));
  };

  // Xử lý hiển thị submenu
  const toggleSubmenu = (i) => {
    setActiveSubmenu(activeSubmenu === i ? null : i);
  };

  // Xử lý trạng thái submenu khi thay đổi location
  useEffect(() => {
    let submenuIndex = null;
    menus.forEach((item, i) => {
      if (item.child) {
        const ciIndex = item.child.findIndex(
          (ci) => ci.childlink === locationName
        );
        if (ciIndex !== -1) submenuIndex = i;
      }
    });
    setActiveSubmenu(submenuIndex);
    dispatch(toggleActiveChat(false));
    if (mobileMenu) setMobileMenu(false);
  }, [location]);

  return (
    <>
      <ul>
        {menus.map(
          (item, i) =>
            hasPermission(item.roles) && ( // Kiểm tra quyền truy cập của từng mục
              <li
                key={i}
                className={`single-sidebar-menu 
                  ${item.child ? "item-has-children" : ""}
                  ${activeSubmenu === i ? "open" : ""}
                  ${locationName === item.link ? "menu-item-active" : ""}`}
              >
                {!item.child && !item.isHeadr && (
                  <NavLink
                    className="menu-link"
                    to={item.link}
                    activeClassName="menu-item-active" // Adds active class when the link is active
                    exact
                  >
                    <span className="menu-icon flex-grow-0">
                      <Icon icon={item.icon} />
                    </span>
                    <div className="text-box flex-grow">{item.title}</div>
                    {item.badge && (
                      <span className="menu-badge">{item.badge}</span>
                    )}
                  </NavLink>
                )}
                {item.isHeadr && !item.child && (
                  <div className="menulabel">{item.title}</div>
                )}
                {item.child && (
                  <>
                    <div
                      className={`menu-link ${
                        activeSubmenu === i
                          ? "parent_active not-collapsed"
                          : "collapsed"
                      }`}
                      onClick={() => toggleSubmenu(i)}
                    >
                      <span className="menu-icon">
                        <Icon icon={item.icon} />
                      </span>
                      <div className="text-box">{item.title}</div>
                    </div>
                    <Collapse isOpened={activeSubmenu === i}>
                      <ul>
                        {item.child
                          .filter((subItem) => hasPermission(subItem.roles)) // Kiểm tra quyền của child
                          .map((subItem, j) => (
                            <li key={j}>
                              <NavLink to={subItem.childlink} 
                              activeClassName="submenu-item-active" // Adds active class for submenu
                              >
                                {subItem.childtitle}
                              </NavLink>
                            </li>
                          ))}
                      </ul>
                    </Collapse>
                  </>
                )}
              </li>
            )
        )}
      </ul>
    </>
  );
};

export default Navmenu;
