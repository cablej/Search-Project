'use strict';
module.exports = (sequelize, DataTypes) => {
  const url = sequelize.define('url', {
    url: DataTypes.STRING,
    title: DataTypes.STRING,
    contents: DataTypes.STRING
  }, {});
  url.associate = function(models) {
    // associations can be defined here
  };
  return url;
};