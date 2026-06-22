export const getStoreStatus = (hours, alwaysOpen) => {
  // No hours set — default to Open
  if (alwaysOpen) return { isOpen: true, label: "Open 24/7", next: null };
  if (!hours) return { isOpen: true, label: "Open", next: null };

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  const dayName = days[now.getDay()];
  const today = hours[dayName];

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
  };

  // Check if any day has valid hours set
  const hasAnyHours = days.some(
    (d) => hours[d]?.open && hours[d]?.close && !hours[d]?.closed,
  );
  if (!hasAnyHours) return { isOpen: true, label: "Open", next: null };

  // Today has no hours or is marked closed
  if (!today || today.closed || !today.open || !today.close) {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDay = days[(now.getDay() + i) % 7];
      const nextDayHours = hours[nextDay];
      if (
        nextDayHours &&
        !nextDayHours.closed &&
        nextDayHours.open &&
        nextDayHours.close
      ) {
        const label =
          i === 1
            ? "tomorrow"
            : nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
        return {
          isOpen: false,
          label: `Closed · Opens ${label} at ${formatTime(nextDayHours.open)}`,
          next: nextDay,
        };
      }
    }
    return { isOpen: false, label: "Closed", next: null };
  }

  // Check if currently open
  const [openH, openM] = today.open.split(":").map(Number);
  const [closeH, closeM] = today.close.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const minsLeft = closeMinutes - currentMinutes;
    const label =
      minsLeft <= 30
        ? `Closing soon · ${minsLeft} mins left`
        : `Open · Closes at ${formatTime(today.close)}`;
    return { isOpen: true, label, next: null };
  }

  // Opens later today
  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      label: `Closed · Opens at ${formatTime(today.open)}`,
      next: null,
    };
  }

  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDay = days[(now.getDay() + i) % 7];
    const nextDayHours = hours[nextDay];
    if (
      nextDayHours &&
      !nextDayHours.closed &&
      nextDayHours.open &&
      nextDayHours.close
    ) {
      const label =
        i === 1
          ? "tomorrow"
          : nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
      return {
        isOpen: false,
        label: `Closed · Opens ${label} at ${formatTime(nextDayHours.open)}`,
        next: nextDay,
      };
    }
  }

  return { isOpen: false, label: "Closed", next: null };
};
