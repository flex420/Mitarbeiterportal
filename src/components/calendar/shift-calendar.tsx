"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import deLocale from "@fullcalendar/core/locales/de";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), { ssr: false });
const dayGridPlugin = dynamic(() => import("@fullcalendar/daygrid"), { ssr: false });
const timeGridPlugin = dynamic(() => import("@fullcalendar/timegrid"), { ssr: false });

type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: { employees: string[] };
};

export function ShiftCalendar({ events }: { events: Event[] }) {
  const plugins = useMemo(() => [dayGridPlugin, timeGridPlugin], []);

  return (
    <FullCalendar
      plugins={plugins as any}
      initialView="timeGridWeek"
      events={events}
      height="auto"
      locales={[deLocale] as any}
      locale="de"
      timeZone="Europe/Berlin"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,dayGridMonth"
      }}
      eventContent={(arg) => {
        const employees = (arg.event.extendedProps["employees"] as string[]) ?? [];
        return {
          html: `<div class="flex flex-col text-xs">
            <span class="font-medium">${arg.event.title}</span>
            <span class="text-slate-500">${employees.join(", ")}</span>
          </div>`
        };
      }}
    />
  );
}
