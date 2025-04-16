import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import summaryApi from "../../../common";

function TicketCard({ ticket }) {
  const textRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const relativeTime = moment(ticket.createdAt).fromNow();

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsClamped(element.scrollHeight > element.clientHeight);
    }
  }, [ticket]);

  const handleReadMore = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Check media type
  const hasPhoto = ticket.media && ticket.media.photo;
  const hasVideo = ticket.media && ticket.media.video;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-bold hover:underline">{ticket.name}</h4>
            <p className="text-gray-500 text-sm">{relativeTime}</p>
          </div>
        </div>
      </div>

      {/* ✅ Render Media if available */}
      {hasPhoto && (
        <img
          src={`${summaryApi.domain.url}/${ticket?.media?.photo}`}
          alt="ticket media"
          className="w-full max-h-[400px] object-cover object-center rounded-lg mb-4"
          onError={(e) => console.error("Image failed to load:", e.target.src)}
        />
      )}
      {hasVideo && (
        <video
          controls
          className="w-full max-h-[400px] object-cover object-center rounded-lg mb-4"
        >
          <source
            src={`${summaryApi.domain.url}/${ticket?.media?.video}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}

      {/* ✅ Message */}
      <p ref={textRef} className="text-gray-500 mt-2 mb-4 line-clamp-2">
        {ticket.message}
      </p>

      {isClamped && (
        <p className="text-blue-500 font-semi-bold cursor-pointer">
          <button onClick={handleReadMore}>Read More</button>
        </p>
      )}

      {/* ✅ Full message modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-4">Full Message</h2>

            {isImage && (
              <img
                src={`${summaryApi.domain.url}/uploads/${ticket.media}`}
                alt="ticket media"
                className="w-full max-h-[400px] object-cover object-center rounded-lg mb-4"
              />
            )}

            {isVideo && (
              <video
                controls
                className="w-full max-h-[400px] object-cover object-center rounded-lg mb-4"
              >
                <source
                  src={`${summaryApi.domain.url}/${ticket.media}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}

            <p>{ticket.message}</p>
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketCard;
