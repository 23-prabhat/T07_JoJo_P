"use client";

import { CheckCircle, Circle } from "@phosphor-icons/react";

export interface ActivityEvent {
  label: string;
  timestamp: string | null;
  done: boolean;
}

interface SessionActivityProps {
  events: ActivityEvent[];
}

export function SessionActivity({ events }: SessionActivityProps) {
  return (
    <ol className="space-y-0">
      {events.map((evt, i) => (
        <li key={i} className="flex gap-4">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div className="mt-0.5">
              {evt.done ? (
                <CheckCircle size={20} weight="fill" className="text-warm" />
              ) : (
                <Circle size={20} weight="regular" className="text-foreground/20" />
              )}
            </div>
            {i < events.length - 1 && (
              <div className="my-1 w-px flex-1 bg-foreground/10" />
            )}
          </div>

          {/* Content */}
          <div className="pb-5">
            <p
              className={`text-sm font-medium ${
                evt.done ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {evt.label}
            </p>
            {evt.timestamp && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground/50">
                {evt.timestamp}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
