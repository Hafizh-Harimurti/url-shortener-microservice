const mongoose = require('mongoose');
const Counter = require('./CounterSchema');

const shortUrlSchema = new mongoose.Schema({
    original_url: {
        required: true,
        type: String
    },
    short_url: {
        type: Number
    }
});

shortUrlSchema.pre('save',function(next){
    let doc = this;
    Counter.findByIdAndUpdate('shorturlsCounter', {$inc: {seq_value: 1}},{upsert:true, new:true}, function(err,data){
        if(err){
            return next(err);
        } else {
            doc.short_url = data.seq_value;
            next()
        }
    })
})

module.exports = mongoose.model('ShortURL', shortUrlSchema);