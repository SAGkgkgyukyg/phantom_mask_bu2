enum WeekdayName {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

enum WeekdayAbbreviation {
  Sun = 'Sun',
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
}

// create a map from WeekdayName to  WeekdayAbbreviation
const WeekdayNameToAbbreviationMap: {
  [key in WeekdayName]: WeekdayAbbreviation;
} = {
  [WeekdayName.Sunday]: WeekdayAbbreviation.Sun,
  [WeekdayName.Monday]: WeekdayAbbreviation.Mon,
  [WeekdayName.Tuesday]: WeekdayAbbreviation.Tue,
  [WeekdayName.Wednesday]: WeekdayAbbreviation.Wed,
  [WeekdayName.Thursday]: WeekdayAbbreviation.Thu,
  [WeekdayName.Friday]: WeekdayAbbreviation.Fri,
  [WeekdayName.Saturday]: WeekdayAbbreviation.Sat,
};
export { WeekdayName, WeekdayAbbreviation, WeekdayNameToAbbreviationMap };
