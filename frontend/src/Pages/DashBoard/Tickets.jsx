import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket } from "@fortawesome/free-solid-svg-icons";
import Loading from "../../Components/Layout/Loading";
import axios from "axios";
import summaryApi from "../../../common";
import TicketCard from "../../Components/DashBoard/TicketCard";
import NavBarDashboard from "../../Components/DashBoard/NavBarDashboard";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(summaryApi.tickets.url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTickets(response.data);
      } catch (error) {
        setError("Failed to fetch tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return <Loading color={"#666AEC"} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBarDashboard />
      <div className="m-10">
        <h1 className="text-xl font-semibold mb-2">DashBoard</h1>
        <p className="text-l mb-10 mt-10">
          <FontAwesomeIcon icon={faTicket} /> / tickets
        </p>
        <div className="grid grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <TicketCard ticket={ticket} key={ticket.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Tickets;
