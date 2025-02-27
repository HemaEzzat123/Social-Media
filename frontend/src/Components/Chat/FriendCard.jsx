import React, { useState, useEffect } from "react";
import axios from "axios";
import summaryApi from "../../../common";

export default function FriendCard({ conversation, currentUser }) {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const friendId = conversation.members.find((m) => m !== currentUser._id);

    const getUser = async () => {
      try {
        const res = await axios(
          summaryApi.getUserById.url + "/?userId=" + friendId,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(res.data);
        console.log(user);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation]);

  return (
    <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-darkBg dark:shadow-sm dark:shadow-white hover:bg-gray-200 flex-wrap rounded-lg cursor-pointer">
      <div className="flex items-center space-x-2">
        <img
          src={
            user
              ? summaryApi.domain.url + "/" + user.profilePic
              : "https://via.placeholder.com/40"
          }
          alt="Profile"
          className="w-10 h-10 rounded-2xl"
        />
        <div>
          <h4 className="font-semibold dark:text-white">
            {user ? user.name : ""}
          </h4>
          <p className="text-gray-500 w-[200px] text-sm truncate"></p>
        </div>
      </div>
    </div>
  );
}
