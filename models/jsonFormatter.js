// take an array of data and an array of metadata
// return a javascript object
exports.format = (data, meta) => {
  const obj = {};
  for (let i = 0; i < data.length; i++) {
    obj[meta[i].getColumnLabel()] = data[i];
  }
  return obj;
};
