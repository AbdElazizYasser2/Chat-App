import morgan from "morgan";

const devLogger = morgan("dev");

const prodLogger = morgan("combined");

const logger = process.env.NODE_ENV === "development" ? devLogger : prodLogger;
 
export default logger;