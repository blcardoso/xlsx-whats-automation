import winston from 'winston'
import util from 'util'
import { app } from 'electron'
import { join } from 'path'
import DailyRotateFile from 'winston-daily-rotate-file'

// https://github.com/winstonjs/winston/issues/1427
const combineMessageAndSplat = () => ({
  transform(info) {
    const { [Symbol.for('splat')]: args = [], message } = info
    // eslint-disable-next-line no-param-reassign
    info.message = util.format(message, ...args)
    return info
  }
})

const logDirPath = '.'
const filename = join(logDirPath, 'app.log')
const filenameRotate = join(logDirPath, 'app-%DATE%.log')

const transport = new DailyRotateFile({
  filename: filenameRotate,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '200m',
  maxFiles: '14d',
  prepend: true,
  level: 'debug'
})

const createLogger = () => winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    combineMessageAndSplat(),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [transport]
})

const logger = createLogger()
logger.add(new winston.transports.File({ level: 'debug', filename, options: { flags: 'a' } }))
logger.add(new winston.transports.Console())

export default logger
