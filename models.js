var Mongoose = require('mongoose');

// var geoSchema = new Mongoose.Schema({
  // loc: {
    // type: { type: String },
    // coordinates: []
  // }
// });
// geoSchema.index({ loc: '2d' });

var ActivitySchema = new Mongoose.Schema({
    // "id": Number,
    // "name": String,
    // "tags": [String],
    // // "loc": { "type": [Number], "index": "2d" },
    // // "loc": Mongoose.Schema.Types.Mixed,
      // // {"type": String,
      // // "geometry": {"type": String,"coordinates": [Number]}
    // // },
    // "address": String,
    // "hours": {"allDays": {"starttime": [Number],"endtime": [Number]},
      // "weekDays": {"starttime": [Number],"endtime": [Number]},
      // "weekEnds": {"starttime": [Number],"endtime": [Number]},
      // "mondays": {"starttime": [Number],"endtime": [Number]},
      // "tuesdays": {"starttime": [Number],"endtime": [Number]},
      // "wednesdays": {"starttime": [Number],"endtime": [Number]},
      // "thursdays": {"starttime": [Number],"endtime": [Number]},
      // "fridays": {"starttime": [Number],"endtime": [Number]},
      // "saturdays": {"starttime": [Number],"endtime": [Number]},
      // "sundays": {"starttime": [Number],"endtime": [Number]}
    // },
    // "length": Number,
    // "energylevel": Number,
    // "moneyupperlimit": Number,
    // "description": String,
    // "imageURL": String,
    // "thingslist": [String],
    // "moreinfoURL": String
    id: Number,
    name: String,
    tags: [String],
    // loc: { type: [Number], index: 2d },
    // loc: Mongoose.Schema.Types.Mixed,
      // {type: String,
      // geometry: {type: String,coordinates: [Number]}
    // },
    // loc: {
      // type: { type: String },
      // coordinates: []
    // },
    coordinates: [],
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

ActivitySchema.index({ coordinates: '2d' });

exports.Activity = Mongoose.model('Activity', ActivitySchema);


