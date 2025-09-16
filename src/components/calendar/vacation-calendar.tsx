"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import deLocale from "@fullcalendar/core/locales/de";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
const dayGridPlugin = dynamic(() => import("@fullcalendar/daygrid"), { ssr: false });
const timeGridPlugin = dynamic(() => import("@fullcalendar/timegrid"), { ssr: false });
const interactionPlugin = dynamic(() => import("@fullcalendar/interaction"), { ssr: false });

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    status: string;
    type: string;
  };
};

export function VacationCalendar({ events }: { events: Event[] }) {
  const plugins = useMemo(() => [dayGridPlugin, timeGridPlugin, interactionPlugin], []);
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek">("dayGridMonth");

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          className={`rounded-full px-3 py-1 text-sm ${
            view === "dayGridMonth" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
          }`}
          onClick={() => setView("dayGridMonth")}
        >
          Monat
        </button>
        <button
          className={`rounded-full px-3 py-1 text-sm ${
            view === "timeGridWeek" ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
          }`}
          onClick={() => setView("timeGridWeek")}
        >
          Woche
        </button>
      </div>
      <FullCalendar
        plugins={plugins as any}
        initialView={view}
        height="auto"
        events={events}
        locales={[deLocale] as any}
        locale="de"
        timeZone="Europe/Berlin"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: ""
        }}
        eventContent={(arg) => {
          const status = arg.event.extendedProps["status"] as string;
          return {
            html: `<div class="flex flex-col text-xs">
              <span class="font-medium">${arg.event.title}</span>
              <span class="uppercase tracking-wide text-[10px] text-slate-500">${status}</span>
            </div>`
          };
        }}
      />
    </div>
  );
}
