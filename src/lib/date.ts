import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekday from "dayjs/plugin/weekday";
import localeDe from "dayjs/locale/de";

dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.locale(localeDe);
dayjs.tz.setDefault("Europe/Berlin");

export default dayjs;
