import Layout from "../components/Layout";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/requests").then(res => {
      setEvents(
        res.data
          .filter(r => r.type === "Preventive")
          .map(r => ({
            title: r.subject,
            date: r.scheduled_date
          }))
      );
    });
  }, []);

  return (
    <Layout title="Preventive Maintenance Calendar">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <FullCalendar plugins={[dayGridPlugin]} events={events} />
      </div>
    </Layout>
  );
}
