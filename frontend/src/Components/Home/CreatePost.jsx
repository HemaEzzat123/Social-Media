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
  console.log(user);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [tags, setTags] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

      formData.append("tags", JSON.stringify(tags));
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
        autoClose: 3000, // Optionally, set a duration for the toast
      });

      // Reset form fields
      setContent("");
      setImage(null);
      setVideo(null);
      setTags([]);
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
    <div className="flex flex-col bg-white p-5 rounded-lg shadow-md w-full max-w-xl mx-auto">
      <form onSubmit={handleShare}>
        <div className="flex items-center gap-4">
          {/* <Link to={`/profile/${user._id}`}> */}
          <img
            src="https://via.placeholder.com/48"
            alt="user-profile"
            className="w-12 h-12 rounded-lg"
          />
          {/* </Link> */}
          <textarea
            ref={textareaRef}
            value={content}
            onInput={handleInput}
            placeholder="What are you thinking?"
            className="w-full p-3 rounded-lg h-auto focus:outline-none resize-none overflow-hidden"
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
              className="w-full rounded-lg  max-h-[400px] object-center"
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
              className="w-full rounded-lg  object-cover object-center"
            />
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-3 text-gray-500">
            <div
              className="bg-gray-200 px-2 py-2 rounded-lg hover:text-blue-500 cursor-pointer"
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
              className="bg-gray-200 px-2 py-2 rounded-lg hover:text-blue-500 cursor-pointer"
            >
              <AiOutlineVideoCamera size={20} />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg flex gap-1 items-center"
          >
            Share <AiOutlineRight />
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
