const {format}=require('date-fns')
const {v4:uuid}=require('uuid')
const fs=require('fs')
const fspromises=require('fs').promises
const path=require('path')

const logEvents = async (message,logFileName)=>{
    const dateTime=`${format(new Date(),'yyyyMMdd\tHH:mm:ss')}`
    const logItme=`${dateTime}\t${uuid()}\t${message}\n`

    try {
        if(!fs.existsSync(path.join(__dirname,'..','logs'))){
            await fspromises.mkdir(path.join(__dirname,'..','logs'))
        }
        await fspromises.appendFile(path.join(__dirname,'..','logs',logFileName),logItme)
    } catch (error) {
        console.log(error)
    }
}

const logger =(req,res,next)=>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`,'reqLog.log')
    console.log(`${req.method}c${req.path}`)
    next()
}

module.exports={logEvents,logger}