import winston, { format } from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: format.combine(format.json(), format.colorize()),
  defaultMeta: {
    service: "GOOD_RESTAURANT",
  },
});
