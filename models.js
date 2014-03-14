var Mongoose = require('mongoose');

var ActivitySchema = new Mongoose.Schema({
    loc: {
      type: { type: String },
      coordinates: []
    },
    address: String,
    hours: {allDays: {starttime: [Number],endtime: [Number]},
      weekDays: {starttime: [Number],endtime: [Number]},
      weekEnds: {starttime: [Number],endtime: [Number]},
      mondays: {starttime: [Number],endtime: [Number]},
      tuesdays: {starttime: [Number],endtime: [Number]},
      wednesdays: {starttime: [Number],endtime: [Number]},
      thursdays: {starttime: [Number],endtime: [Number]},
      fridays: {starttime: [Number],endtime: [Number]},
      saturdays: {starttime: [Number],endtime: [Number]},
      sundays: {starttime: [Number],endtime: [Number]}
    },
    length: Number,
    energylevel: Number,
    moneyupperlimit: Number,
    description: String,
    imageURL: String,
    thingslist: [String],
    moreinfoURL: String
});

var suggestionSchema = new Mongoose.Schema({
    name: String,
    address: String,
    hours: {
      starttime: Number,
      endtime: Number
    },
    length: Number,
    energylevel: Number,
    description: String,
    thingslist: String
});

var TimeSchema = new Mongoose.Schema({
  time: Number
});

ActivitySchema.index({ loc: '2dsphere' });

exports.Activity = Mongoose.model('Activity', ActivitySchema);
exports.Time = Mongoose.model('Time', TimeSchema);
exports.Suggestion = Mongoose.model('Suggestion', suggestionSchema);

