const mongoose = require('mongoose')
const connectionParams = {
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
}

const connection = mongoose.connect(process.env.DATABASE_URL,connectionParams)
.then(()=>{
    console.log('Connected to database')
})
.catch((err)=>{
    console.log(`${err}`);
})

module.exports = connection