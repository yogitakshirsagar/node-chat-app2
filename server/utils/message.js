var moment = require('moment');

var generateMessage = (from, text) => {
  return {
    from,
    text,
    createdAt: moment().valueOf()
  };
};
var generateLocationMessage = (from, latitude, longitude) => {
  return {
    from,
    url: `https://www.google.com/maps?q=${latitude},${longitude}`,
    //createdAt: new Date().getTime()
	createdAt: moment().valueOf()
  };
};

module.exports = {generateMessage, generateLocationMessage};

