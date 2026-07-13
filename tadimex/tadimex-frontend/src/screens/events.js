import moment from "moment";

const generateYearlyEvents = (title, month, day, message, image_path) => {
  const events = [];
  const currentYear = new Date().getFullYear();
  const endYear = currentYear + 10; 

  for (let year = currentYear; year <= endYear; year++) {
    const start = new Date(year, month - 1, day, 0, 0, 0);
    const end = new Date(year, month - 1, day, 23, 59, 59);
    events.push({ title, start, end, message, image_path });
  }

  return events;
};

export const events = [
  ...generateYearlyEvents("New Year's Day", 1, 1, "Celebration of the New Year.", "/images/new_year.png"),
  ...generateYearlyEvents("Independence Day (USA)", 7, 4, "Celebration of the United States Independence Day.", "/images/independence_day.png"),
  ...generateYearlyEvents("Thanksgiving (USA)", 11, 28, "Thanksgiving Day celebration.", "/images/thanksgiving.png"),
  ...generateYearlyEvents("Easter Sunday", 3, 31, "Celebration of Easter Sunday.", "/images/easter.png"),
  ...generateYearlyEvents("Valentine's Day", 2, 14, "Celebration of Valentine's Day.", "/images/valentines_day.png"),
  ...generateYearlyEvents("Halloween", 10, 31, "Celebration of Halloween.", "/images/halloween.png"),
  ...generateYearlyEvents("Labor Day (USA)", 9, 2, "Labor Day celebration.", "/images/labor_day.png"),
  ...generateYearlyEvents("Diwali", 11, 12, "Festival of Lights celebration.", "/images/diwali.png"),
  ...generateYearlyEvents("Chinese New Year", 2, 10, "Celebration of the Chinese New Year.", "/images/chinese_new_year.png"),
  ...generateYearlyEvents("St. Patrick's Day", 3, 17, "Celebration of St. Patrick's Day.", "/images/st_patricks_day.png"),
  ...generateYearlyEvents("Earth Day", 4, 22, "Celebration of Earth Day.", "/images/earth_day.png"),
  ...generateYearlyEvents("Hanukkah", 12, 25, "Celebration of Hanukkah.", "/images/hanukkah.png"),
  ...generateYearlyEvents("Ramadan Begins", 3, 10, "Start of Ramadan.", "/images/ramadan.png"),
  ...generateYearlyEvents("Ramadan Ends", 4, 9, "End of Ramadan.", "/images/ramadan.png"),
  ...generateYearlyEvents("Oktoberfest Begins", 9, 21, "Start of Oktoberfest.", "/images/oktoberfest.png"),
  ...generateYearlyEvents("Oktoberfest Ends", 10, 6, "End of Oktoberfest.", "/images/oktoberfest.png"),
  ...generateYearlyEvents("Bastille Day", 7, 14, "Celebration of Bastille Day.", "/images/bastille_day.png"),
  ...generateYearlyEvents("Cinco de Mayo", 5, 5, "Celebration of Cinco de Mayo.", "/images/cinco_de_mayo.png"),
  ...generateYearlyEvents("Mother's Day", 5, 12, "Celebration of Mother's Day.", "/images/mothers_day.png"),
  ...generateYearlyEvents("Father's Day", 6, 16, "Celebration of Father's Day.", "/images/fathers_day.png"),
  ...generateYearlyEvents("Navidad", 12, 25, "Feliz navidad!!!", "C:/Users/Dell/Desktop/navidad.jpg"),
];