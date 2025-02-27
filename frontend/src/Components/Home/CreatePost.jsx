import { CgClose } from "react-icons/cg";
import {
  AiOutlineCamera,
  AiOutlineVideoCamera,
  AiOutlineRight,
} from "react-icons/ai";
import { useState, useRef, useContext, useEffect } from "react";
import axios from "axios";
import summaryApi from "../../../common";
import UserContext from "../../Contexts/UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [tags, setTags] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showFullContent, setShowFullContent] = useState(false);

  function addNewlinesAfterEverySixWordsOrLongWords(
    content,
    maxWordLength = 10,
    longWordLimit = 50
  ) {
    const words = content.split(" ");
    const result = [];

    for (let i = 0; i < words.length; i++) {
      if (words[i].length > longWordLimit) {
        for (let j = 0; j < words[i].length; j += longWordLimit) {
          result.push(words[i].substring(j, j + longWordLimit));
        }
      } else {
        result.push(words[i]);
      }
      if ((i + 1) % 6 === 0) {
        result.push("\n");
      }
    }

    return result.join(" ");
  }

  // Fetch friends when component mounts
  const fetchFriends = async () => {
    try {
      const response = await axios.get(summaryApi.myFriends.url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const friends = response.data;
      setTags(friends); // Set the friends as tags
    } catch (error) {
      console.error("Error fetching friends", error);
      toast.error("Failed to load friends.");
    }
  };
  useEffect(() => {
    fetchFriends();
  }, []);

  const createPost = async () => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("user", user._id);

      // Append image if available
      if (image) {
        formData.append("photo", image);
      }

      // Append video if available
      if (video) {
        formData.append("video", video);
      }

      // Add the current user to the tags array if not already included
      const updatedTags = [...tags];
      if (!tags.find((tag) => tag._id === user._id)) {
        updatedTags.push(user);
      }

      formData.append(
        "tags",
        JSON.stringify(updatedTags.map((tag) => tag._id))
      );
      formData.append("privacy", privacy);

      // Make the POST request
      const response = await axios.post(summaryApi.create.url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Success toast notification with onClose callback to reload window
      toast.success("Post created successfully!", {
        onClose: () => {
          navigate("/posts/" + response.data.post._id);
        },
        autoClose: 1000,
      });

      // Reset form fields
      setContent("");
      setImage(null);
      setVideo(null);
      setTags([]); // Reset tags
      setPrivacy("public");
    } catch (error) {
      // Error toast notification
      toast.error(
        `Error creating post: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const handleInput = (e) => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    setContent(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImage(file);
      } else if (file.type.startsWith("video/")) {
        setVideo(file);
      }
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };
  const handleVideoClick = () => {
    fileInputRef.current.click();
  };

  const handleShare = (e) => {
    e.preventDefault();
    createPost();
  };

  return (
    <div className="flex flex-col dark:bg-darkBg dark:shadow-slate-300 bg-white p-5 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      <form onSubmit={handleShare}>
        <div className="flex items-center gap-4">
          <Link to={"/profile/" + user?._id}>
            <img
              src={user ? summaryApi.domain.url + "/" + user.profilePic : ""}
              alt="user-profile"
              className="w-12 h-12 object-cover rounded-full border border-gray-300 clickableImage"
            />
          </Link>
          <textarea
            ref={textareaRef}
            value={content}
            onInput={handleInput}
            placeholder="What are you thinking?"
            className="w-[230px] p-3 rounded-lg h-auto dark:bg-darkBg dark:text-bg focus:outline-none resize-none overflow-hidden"
            rows={1}
          />
        </div>
        {image && (
          <div className="mt-4 relative">
            <button
              className="absolute top-2 right-5 z-50 text-white"
              onClick={() => {
                setImage(null);
                fileInputRef.current.value = "";
              }}
            >
              <CgClose size={24} />
            </button>
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full rounded-lg max-h-[400px] object-center"
            />
          </div>
        )}
        {video && (
          <div className="mt-4 relative">
            <button
              className="absolute top-2 right-5 z-50 text-white"
              onClick={() => {
                setVideo(null);
                fileInputRef.current.value = "";
              }}
            >
              <CgClose size={24} />
            </button>
            <video
              controls
              src={URL.createObjectURL(video)}
              className="w-full rounded-lg object-cover object-center"
            />
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-3 text-gray-500">
            <div
              className="bg-gray-200 dark:bg-darkBg dark:text-bg px-2 py-2 rounded-lg dark:hover:text-blue-500 hover:text-blue-500 duration-300 cursor-pointer
              w-9 md:w-10"  
              onClick={handleCameraClick}
            >
              <AiOutlineCamera size={20} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
            <div
              onClick={handleVideoClick}
              className="bg-gray-200 dark:bg-darkBg dark:text-bg px-2 py-2 rounded-lg dark:hover:text-blue-500 hover:text-blue-500 duration-300 cursor-pointer
              w-9 md:w-10"  
            >
              <AiOutlineVideoCamera size={20} />
            </div>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="bg-gray-200 dark:bg-darkBg dark:text-bg px-2 py-2 rounded-lg hover:text-blue-500 dark:hover:text-blue-500 duration-300 cursor-pointer
              w-20 md:w-24 "  
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-primary dark:bg-darkBg hover:scale-105 duration-300 dark:hover:text-blue-500 text-white px-2 py-2 rounded-lg flex gap-1 items-center
            w-20 md:w-24 text-sm ml-2" 
          >
            Share <AiOutlineRight />
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}